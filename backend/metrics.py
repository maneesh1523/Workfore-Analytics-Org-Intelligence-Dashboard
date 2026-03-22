import boto3, json 
from datetime import datetime 
from dateutil.relativedelta import relativedelta 
 
db    = boto3.resource('dynamodb', region_name='ap-south-1') 
TABLE = db.Table('analytics_table') 
CORS  = { 
  'Content-Type':'application/json', 
  'Access-Control-Allow-Origin':'*', 
  'Access-Control-Allow-Headers':'Content-Type,Authorization', 
  'Access-Control-Allow-Methods':'GET,OPTIONS' 
} 
 
def lambda_handler(event, context): 
  params = event.get('queryStringParameters') or {} 
  metric = params.get('type', 'headcount_engineering') 
  period = int(params.get('period', 6)) 
  today  = datetime.now() 
  months = [(today - relativedelta(months=i)).strftime('%Y-%m') for i in 
range(period)] 
  results = [] 
  for ym in reversed(months): 
    resp = TABLE.get_item(Key={'metric_name': metric, 'date': ym}) 
    item = resp.get('Item') 
    results.append({'date': ym, 'value': float(item['value']) if item else 0}) 
  return { 
    'statusCode': 200, 'headers': CORS, 
    'body': json.dumps({'metric': metric, 'data': results}) 
  } 