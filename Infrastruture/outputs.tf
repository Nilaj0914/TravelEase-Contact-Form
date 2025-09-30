output "cloudfront_url" {
  value = aws_cloudfront_distribution.website_distribution.domain_name
}
output "Distribution_ID" {
  description = "CloudFront distribution ID."
  value = aws_cloudfront_distribution.website_distribution.id
}
output "bucket_name"{
  value = aws_s3_bucket.website.bucket
}

output "aws_dynamodb_table_name" {
  value = aws_dynamodb_table.TE-contact-form.name
  description = "name of the Dynamodb table created"
}

output "aws_dynamodb_table_arn" {
  value = aws_dynamodb_table.TE-contact-form.arn
  description = "ARN of the DynamoDB table created"
}