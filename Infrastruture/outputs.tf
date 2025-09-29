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