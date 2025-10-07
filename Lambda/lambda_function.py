import os
import json
import uuid
import boto3
from datetime import datetime, timedelta, timezone
import urllib.request
import urllib.parse

# using boto3, initialize the ses and dynamodb clients
ses_client = boto3.client('ses')
dynamodb = boto3.client('dynamodb')

# get envroment variables from lambda function config file (lambda.tf)
Table_Name = os.environ.get('Table_Name')
Source_Email = os.environ.get('Source_Email')
Business_Email = os.environ.get('Business_Email')
Customer_Email = os.environ.get('Customer_Email')

# Email validation
def is_valid_email(email):
    if email.count('@') != 1:
        return False
    local_part, domain_part = email.split('@')
    if not local_part or not domain_part:
        return False
    if '.' not in domain_part or domain_part.startswith('.') or domain_part.endswith('.'):
        return False
    return True

# format form content into html for email body
def format_data_as_html(data):
    html_lines = []
    for key, value in data.items():
        formatted_key = key.replace('_', ' ').capitalize()
        
        if isinstance(value, dict):
            service_parts = []
            for service_name, is_requested in value.items():
                if is_requested == True:
                    status = "Yes"
                else:
                    status = "No"
                service_parts.append(f"{service_name.capitalize()}: {status}")
            
            formatted_value = ", ".join(service_parts)
        else:
            formatted_value = str(value)
            
        html_lines.append(f"<p><strong>{formatted_key}:</strong> {formatted_value}</p>")
    
    return "\n".join(html_lines)

#Lambda function handler
def lambda_handler(event, context):
    try:
        # Parse incoming json data from the website form (from event body)
        form_data = json.loads(event.get('body', '{}'))

        #Server-side validation of form data
        required_fields = ['name', 'email', 'destination', 'startDate', 'endDate']
        for field in required_fields:
            if not form_data.get(field):
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': f"Please fill out all the missing fields. Missing:{field}"})
                }
            
            if not is_valid_email(form_data['email']):
                return{
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'meassage': 'Please enter a valid email address'})
                }
            
            # validate phone number
            if form_data.get('phone') and not form_data['phone'].isdigit():
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Phone number should only contain digits.'})
                }
            
            # validate travel startDate and endDate
            if form_data.get('startDate') and form_data.get('endDate'):
                try:
                    start_date = datetime.fromisoformat(form_data['startDate'])
                    end_date = datetime.fromisoformat(form_data['endDate'])
                    if start_date > end_date:
                        return {
                            'statusCode': 400,
                            'headers': {'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'message': 'Your return date cannot be before your departure date.'})
                        }
                except ValueError:
                    return{
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'message': 'Invalid date format'})
                    }
            #validate destination using Nominatim API
            try:
                destination_query = urllib.parse.quote(form_data['destination'])
                url = f"https://nominatim.openstreetmap.org/search?q={destination_query}&format=json&limit=1"

                with urllib.request.urlopen(url) as response:
                    data = json.loads(response.read().decode())
                    #empty "data"  means no results found
                    if not data:
                        return{
                            'statusCode': 400,
                            'headers': {'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'message': 'Could not find the specified destination. Please enter a valid destination.'})
                        }
            # if external API fails, continue without validation
            except Exception as e:
                print(f"Error occured while validating destination, it will be manually verified by our staff. Error details: {e}")
            
            #prepare data for dynamodb table
            submission_id = str(uuid.uuid4())
            utc_time = datetime.now(timezone.utc)
            submission_timestamp = utc_time.isoformat()
            ttl_timestamp = int((utc_time + timedelta(days=90)).timestamp())
            table = dynamodb.Table(Table_Name)
            
            items_to_store = {
                'submissionId': submission_id,
                'createdAt': submission_timestamp,
                'ttl': ttl_timestamp,
                **form_data
            }
            #Save items to DynamoDB table
            table.put_item(Item=items_to_store)

            # Customer confirmation email
            customer_summary_html = f"""
            <html><body>
                <h2>Thank you for your inquiry, {form_data['name']}!</h2>
                <p>We've received your request and our travel experts will be in touch shortly. Here is a summary of your submission:</p>
                <div>
                    <p><strong>Reference ID:</strong> {submission_id}</p>
                    <p><strong>Destination:</strong> {form_data['destination']}</p>
                    <p><strong>Departure Date:</strong> {form_data['startDate']}</p>
                    <p><strong>Return Date:</strong> {form_data['endDate']}</p>
                    <p><strong>Number of Travelers:</strong> {form_data.get('travelers', 'N/A')}</p>
                </div>
                <p>Regards,<br/>The TravelEase Team</p>
            </body></html>"""
        customer_summary_text = f"Hello {form_data['name']},\n\nThank you for your inquiry! \n\n We've received your request and our travel experts will be in touch shortly. Here is a summary of your submission. \n\n Your reference number is: {submission_id} \n\n Destination: {form_data['destination']} \n Departure Date: {form_data['startDate']} \n Return Date: {form_data['endDate']} \n Number of Travelers: {form_data.get('travelers', 'N/A')}"
        
        # send the customer confirmation email using the SES client
        ses_client.send_email(
            Source=Source_Email,
            Destination={'ToAddresses': [form_data['email']]},
            Message={
                'Subject': {'Data': f"Your TravelEase Inquiry Summary (Ref: {submission_id})"},
                'Body': {'Text': {'Data': customer_summary_text},
                        'Html': {'Data': customer_summary_html}
                }
            }
        )

        # Business notification email
        business_details_html = f"""
            <html><body>
                <h2>New Travel Inquiry Received</h2>
                <p><strong>Reference ID:</strong> {submission_id}</p><hr>
                {format_data_as_html(form_data)}
            </body></html>"""
        # send the business notification email using the SES client
        ses_client.send_email(
            Source=Source_Email,
            Destination={'ToAddresses': [Business_Email]},
            Message={
                'Subject': {'Data': f"New Inquiry from {form_data['name']} (Ref: {submission_id})"},
                'Body': {
                    'Text': {'Data': f"New inquiry received. Reference ID: {submission_id}\n\nDetails:\n\n{json.dumps(form_data, indent=2, default=str)}"},
                    'Html': {'Data': business_details_html}
                }
            }
        )
        # Return success response to the frontend
        return{
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message':'Thank you for your inquiry! You will recieve a confirmation email shortly with details of your request'})
        }
    #log any exception error to cloudwatch for debugging
    except Exception as e:
        print(f"ERROR: An unexpected error occurred: {e}")
        return{
            'statusCode': 500,
            'headers': {'Access-Control-Allow_Origin': "*"},
            'body': json.dumps({'message':'Internal Server Error'})
        }



