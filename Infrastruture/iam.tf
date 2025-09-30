# IAM Roles and policies for the lambda function to put items into DynamoDB table and send emails using SES, as well as create log in cloudwatch

resource "aws_iam_role" "contact_form_lambda_role" {
  name = "TravelEase-ContactForm-LambdaRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement =[
        {
            Action = "sts:AssumeRole"
            Effect = "Allow"
            Principle ={
                Service = "lambda.amazonaws.com"
            }
        }
    ]
  })
}

#IAM policy

resource "aws_iam_policy" "contact_form_lambda_policy" {
  name = "TravelEase-ContactForm-LambdaRole-Policy"
  description = "Grants permissions to The Lambda function to put items into DynamoDB table and send emails using SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
        {
            # permssion: put items into DynamoDB table
            Effect = "Allow"
            Action = "dynamodb:PutItem"
            Resource = aws_dynamodb_table.TE-contact-form.arn
        },
        {
            # permission: send emails from source identity using SES
            Effect = "Allow"
            Action = "ses:SendEmail"
            Resource = aws_ses_email_identity.source_email_identity.arn
        },
        {
            # permission: allows lambda function to create logs in cloudwatch for debugging
            Effect = "Allow"
            Action = [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ]
            Resource = "arn:aws:logs:*:*:*"
        }

    ]
  })
}

# Policy Attachment to role
resource "aws_iam_policy_attachment" "contact_form_lambda_policy_attachment" {
  name = "ContactForm-Lambda_Policy_Attachment"
  roles = aws_iam_role.contact_form_lambda_role.name
  policy_arn = aws_iam_policy.contact_form_lambda_policy.arn
  }