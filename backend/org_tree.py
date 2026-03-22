import boto3, json 
 
db    = boto3.resource('dynamodb', region_name='ap-south-1') 
TABLE = db.Table('employees') 
CORS  = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*', 
         'Access-Control-Allow-Headers':'Content-Type,Authorization', 
         'Access-Control-Allow-Methods':'GET,OPTIONS'} 
 
def build_tree(employees): 
  children = {} 
  emp_ids  = {e['employee_id'] for e in employees} 
  for emp in employees: 
    mid = emp.get('manager_id','ROOT') 
    if mid not in children: children[mid] = [] 
    children[mid].append(emp) 
  def build_node(emp): 
    node = {'id':emp['employee_id'],'name':emp['name'], 
            'title':emp.get('job_title',''),'department':emp.get('department','')} 
    kids = children.get(emp['employee_id'],[]) 
    if kids: node['children'] = [build_node(k) for k in kids] 
    return node 
  roots = [e for e in employees 
           if not e.get('manager_id') or e.get('manager_id') not in emp_ids 
           or e.get('manager_id') == 'ROOT'] 
  return [build_node(r) for r in roots] 
 
def lambda_handler(event, context): 
  employees = TABLE.scan()['Items'] 
  tree = build_tree(employees) 
  root = tree[0] if len(tree) == 1 else {'name':'Organisation','children':tree} 
  return { 
    'statusCode': 200, 'headers': CORS, 
    'body': json.dumps(root) 
  }