#s3 Bucket Resource
resource "aws_s3_bucket" "website" {
  bucket = "travelease-nextjs-website"
  
  # force destroy deletes even non-empty buckets, be careful regarding data loss
  force_destroy = true

  tags = {
    Name = "Portfolio Website"
    Enviroment = "Production"
  }
}

# Ownership Control
resource "aws_s3_bucket_ownership_controls" "website_ownership_control" {
  bucket = aws_s3_bucket.website.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Bucket public access
resource "aws_s3_bucket_public_access_block" "website_public_access_block" {
  bucket = aws_s3_bucket.website.id

  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

/*Bucket ACL
resource "aws_s3_bucket_acl" "website_bucket_acl" {
  bucket = aws_s3_bucket.website.id
  depends_on = [ 
    aws_s3_bucket_ownership_controls.website_ownership_control,
    aws_s3_bucket_public_access_block.website_public_access_block
   ]
   acl = "public-read"
}
*/

# website index document configuration
resource "aws_s3_bucket_website_configuration" "website-policy" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }
  
  error_document {
    key = "index.html"
  }
}

# S3 Bucket Policy Resource
resource "aws_s3_bucket_policy" "website_policy" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.Website_OAI.iam_arn
        }
        Action = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })
}

# Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "Website_OAI" {
  comment = "OAI for NextJS portfolio site"
}

#Cloudfront Distribution
resource "aws_cloudfront_distribution" "website_distribution" {
  
  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id = "S3-website-bucket"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.Website_OAI.cloudfront_access_identity_path
    }
  }

  enabled = true
  is_ipv6_enabled = true
  comment = "Next.js portfolio site"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods = [ "GET", "HEAD" ]
    target_origin_id = "S3-website-bucket"

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.url_rewrite.arn
    }

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl = 0
    default_ttl = 3600
    max_ttl = 86400
  }
# Error response in case of 403 error
  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 403 
    response_code         = 200
    response_page_path    = "/index.html" 
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    
    cloudfront_default_certificate = true

  }
}

# Enabling Cloudfront funtion to rewrite URLs 
resource "aws_cloudfront_function" "url_rewrite" {
  name    = "travelease-url-rewrite-function"
  runtime = "cloudfront-js-2.0"
  comment = "Rewrites clean URLs to their .html equivalents"
  publish = true
  code = file("${path.module}/url_rewrite.js")
}



