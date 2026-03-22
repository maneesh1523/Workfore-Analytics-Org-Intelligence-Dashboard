import boto3, json 
from datetime import datetime 
from boto3.dynamodb.conditions import Attr 
 
db       = boto3.resource('dynamodb', region_name='ap-south-1') 
ANALYTICS= db.Table('analytics_table') 
EMP_TABLE= db.Table('employees') 
CORS = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*', 
        'Access-Control-Allow-Headers':'Content-Type,Authorization', 
        'Access-Control-Allow-Methods':'GET,OPTIONS'} 
 
def lambda_handler(event, context): 
  params  = event.get('queryStringParameters') or {} 
  top_n   = int(params.get('top', 10)) 
  month   = datetime.now().strftime('%Y-%m') 
  resp = ANALYTICS.scan( 
    FilterExpression=Attr('metric_name').begins_with('attrition_risk_') & 
Attr('date').eq(month) 
  ) 
  ranked = sorted(resp['Items'], key=lambda x: float(x['value']), 
reverse=True)[:top_n] 
  results = [] 
  for row in ranked: 
    eid  = row['metric_name'].replace('attrition_risk_','') 
    emp  = EMP_TABLE.get_item(Key={'employee_id': eid}).get('Item', {}) 
    score= float(row['value']) 
    results.append({ 
      'employee_id': eid, 
      'name':        emp.get('name','Unknown'), 
      'department':  emp.get('department',''), 
      'tenure_months': int(emp.get('tenure_months', 0)), 
      'risk_score':  round(score, 3), 
      'risk_level':  'high' if score>=0.7 else 'medium' if score>=0.4 else 'low' 
    }) 
  return { 
    'statusCode': 200, 'headers': CORS, 
    'body': json.dumps({'month': month, 'employees': results}) 
  } 
