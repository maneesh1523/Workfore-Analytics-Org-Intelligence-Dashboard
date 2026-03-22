import boto3, json
from datetime import datetime
from decimal import Decimal
from collections import defaultdict

db         = boto3.resource('dynamodb', region_name='ap-south-1')
EMP_TABLE  = db.Table('employees')
LEAVE_TABLE= db.Table('leave_records')
PERF_TABLE = db.Table('performance')
REC_TABLE  = db.Table('recruitment')
ANALYTICS  = db.Table('analytics_table')
CW         = boto3.client('cloudwatch', region_name='ap-south-1')
MONTH      = datetime.now().strftime('%Y-%m')

def scan_all(table):
    items, resp = [], table.scan()
    items.extend(resp['Items'])
    while 'LastEvaluatedKey' in resp:
        resp = table.scan(ExclusiveStartKey=resp['LastEvaluatedKey'])
        items.extend(resp['Items'])
    return items

def write(name, value, date=None):
    ANALYTICS.put_item(Item={
        'metric_name': name,
        'date': date or MONTH,
        'value': Decimal(str(round(float(value), 4)))
    })

def normalise(val, lo, hi):
    return max(0.0, min(1.0, (float(val)-lo)/(hi-lo))) if hi != lo else 0.0

def attrition_risk(leave, perf, tenure):
    return (0.40 * normalise(leave, 0, 30) +
            0.35 * (1 - normalise(perf, 1, 5)) +
            0.25 * (1 - normalise(tenure, 0, 60)))

def lambda_handler(event, context):
    employees = scan_all(EMP_TABLE)
    leave_rec  = scan_all(LEAVE_TABLE)
    perf_rec   = scan_all(PERF_TABLE)
    recruit    = scan_all(REC_TABLE)

    active = [e for e in employees if e.get('status') == 'active']

    # ── 1. Headcount per department (written for current month) ──
    dept_count = defaultdict(int)
    for e in active:
        dept_count[e['department']] += 1
    for dept, count in dept_count.items():
        write(f'headcount_{dept.lower()}', count)
    write('headcount_total', len(active))

    # ── 2. Leave utilisation per department per month ──
    # Group all leave records by (year_month, dept) — no current-month filter.
    # This gives the query Lambda a full time-series to return.
    emp_to_dept = {e['employee_id']: e['department'] for e in active}

    # leave_emp is still scoped to current month for attrition risk calculation
    leave_emp_current = defaultdict(int)

    # month_dept accumulates across ALL months in the leave table
    month_dept = defaultdict(lambda: defaultdict(lambda: {'taken': 0, 'quota': 0}))

    for rec in leave_rec:
        eid  = rec['employee_id']
        dept = emp_to_dept.get(eid)
        if not dept:
            continue
        ym    = rec.get('year_month', '')
        taken = int(rec.get('days_taken', 0))
        quota = int(rec.get('quota', 2))

        month_dept[ym][dept]['taken'] += taken
        month_dept[ym][dept]['quota'] += quota

        # Track current-month leave per employee for attrition risk
        if ym == MONTH:
            leave_emp_current[eid] += taken

    # Write leave_util per dept per month
    for ym, depts in month_dept.items():
        for dept, v in depts.items():
            pct = (v['taken'] / v['quota'] * 100) if v['quota'] else 0
            write(f'leave_util_{dept.lower()}', pct, date=ym)

    # ── 3. Attrition risk per employee ──
    perf_map = {p['employee_id']: float(p.get('score', 3.0)) for p in perf_rec}
    for emp in active:
        eid   = emp['employee_id']
        score = attrition_risk(
            leave_emp_current.get(eid, 0),
            perf_map.get(eid, 3.0),
            int(emp.get('tenure_months', 24))
        )
        write(f'attrition_risk_{eid}', score)

    # ── 4. Recruitment funnel ──
    stage_count = defaultdict(int)
    for app in recruit:
        stage_count[app.get('stage', 'applied')] += 1
    for stage in ['applied', 'shortlisted', 'interviewed', 'offered', 'joined']:
        write(f'funnel_{stage}', stage_count.get(stage, 0))

    # ── 5. Push custom CloudWatch metric ──
    CW.put_metric_data(Namespace='HRAnalytics', MetricData=[
        {'MetricName': 'EmployeesProcessed', 'Value': len(active), 'Unit': 'Count'}
    ])

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Aggregation complete',
            'active_employees': len(active),
            'leave_months_processed': len(month_dept),
            'month': MONTH
        })
    }