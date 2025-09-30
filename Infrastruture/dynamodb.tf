resource "aws_dynamodb_table" "TE-contact-form" {
  name = "TravelEase-ContactSubmissions"
  billing_mode = "PAY_PER_REQUEST"

# "submissionId" is generated using lambda function and used as an unique identifier for each entry
  hash_key = "submissionId"

  attribute {
    name = "submissionId"
    type = "S"
  }
# "ttl_timestamp" is generated using lambda function and used for automatic data cleanup
  ttl {
    attribute_name = "ttl_timestamp"
    enabled = true
  }

point_in_time_recovery {
      enabled = true
}

server_side_encryption {
  enabled = true
}
tags = {
  Name = "TravelEase Contact Form Submissions"
  ManagedBy = "Terraform"
}
}