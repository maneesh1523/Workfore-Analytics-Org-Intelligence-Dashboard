import boto3, json 
from datetime import datetime, timedelta 
 
cw   = boto3.client('cloudwatch', region_name='ap-south-1') 
CORS = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*', 
        'Access-Control-Allow-Headers':'Content-Type,Authorization', 
        'Access-Control-Allow-Methods':'GET,OPTIONS'} 
 
def lambda_handler(event, context): 
  end   = datetime.utcnow() 
  start = end - timedelta(hours=24) 
  def stat(ns, metric, dims, s='Sum'): 
    r = cw.get_metric_statistics( 
      Namespace=ns, MetricName=metric, Dimensions=dims, 
      StartTime=start, EndTime=end, Period=86400, Statistics=[s]) 
    pts = r.get('Datapoints',[]) 
    return round(pts[0][s],2) if pts else 0 
  return { 
    'statusCode': 200, 'headers': CORS, 
    'body': json.dumps({ 
      'api_requests_24h': stat('AWS/ApiGateway','Count', 
        [{'Name':'ApiName','Value':'hrms-api'}]), 
      'lambda_errors_24h': stat('AWS/Lambda','Errors', 
        [{'Name':'FunctionName','Value':'hrms-aggregation-lambda'}]), 
      'avg_latency_ms': stat('AWS/ApiGateway','Latency', 
        [{'Name':'ApiName','Value':'hrms-api'}],'Average') 
    }) 
  } 