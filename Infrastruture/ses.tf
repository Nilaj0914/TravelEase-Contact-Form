# Setup SES email identities while referencing the email addresses using AWS Secrets manager

data "aws_secretsmanager_secret_version" "SES_Emails" {
  secret_id = "TravelEase-SES_Emails"
}

# Parse the JSON string to extract email addresses using jsondecode
locals {
  ses_email_values = jsondecode(data.aws_secretsmanager_secret_version.SES_Emails.secret_string)
}

#create SES email identities using the local values
resource "aws_ses_email_identity" "source_email_identity" {
  email = local.ses_email_values.source_email
}

resource "aws_ses_email_identity" "business_email_identity" {
  email = local.ses_email_values.business_email
}