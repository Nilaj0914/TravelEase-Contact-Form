# zip lambda function code and upload

data "archive_file" "lambda_function_zip" {
  type = "zip"
  source_dir = "${path.module}/../Lambda"
  output_path = "${path.module}/../Lambda/lambda_function_payload.zip"
}

#lambda function resource
resource "aws_lambda_function" "lambda_function" {
  function_name = "TravelEase-ContactForm-Function"

# zip file created by the archive data source for source code
  filename = data.archive_file.lambda_function_zip.output_path
  source_code_hash = data.archive_file.lambda_function_zip.output_base64sha256

  #ARN of the IAM role created for assigning permissions to the lambda function
  role = aws_iam_role.contact_form_lambda_role.arn

  #handler and runtime
  handler = "lambda_function.lambda_handler"
  runtime = "python3.12"

  #Enviroment Variables
  environment {
    variables = {
      Table_Name = aws_dynamodb_table.TE-contact-form.name
      Source_Email = local.ses_email_values.source_email
      Business_Email = local.ses_email_values.business_email
      Customer_Email = local.ses_email_values.test_customer_email
    }
  }
}