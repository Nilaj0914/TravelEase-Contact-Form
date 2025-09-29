output "cloudfront_url" {
  value = aws_cloudfront_distribution.website_distribution.domain_name
}
output "website_endpoint" {
  description = "The S3 static website endpoint."
  value = aws_s3_bucket_website_configuration.website-policy.website_endpoint
}