#test-change
# REST API container
resource "aws_api_gateway_rest_api" "contact-form-api" {
  name = "TravelEase-ContactForm-API"
  description = "API for TravelEase contact form and invocation of lambda function"
}

# /submit resource (URL PATH)
resource "aws_api_gateway_resource" "submit-resource" {
  rest_api_id = aws_api_gateway_rest_api.contact-form-api.id
  parent_id = aws_api_gateway_rest_api.contact-form-api.root_resource_id
  path_part = "submit"
}

# HTTP POST method for /submit resource
resource "aws_api_gateway_method" "post-method" {
  rest_api_id = aws_api_gateway_rest_api.contact-form-api.id
  resource_id = aws_api_gateway_resource.submit-resource.id
  http_method = "POST"
  authorization = "NONE"
}

# API Gateway-Lambda integration
resource "aws_api_gateway_integration" "lambda-integration" {
  rest_api_id = aws_api_gateway_rest_api.contact-form-api.id
  resource_id = aws_api_gateway_resource.submit-resource.id
  http_method = aws_api_gateway_method.post-method.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.lambda_function.invoke_arn
}

# Allow API Gateway to invoke the lambda function
resource "aws_lambda_permission" "api-gateway-invoke-lambda" {
  statement_id = "AllowAPIGatewayToInvokeLambda"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_function.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.contact-form-api.execution_arn}/*/*"
}

# CORS configuration (Browser security)

# OPTIONS method for browser preflight checks
resource "aws_api_gateway_method" "options-method" {
  rest_api_id = aws_api_gateway_rest_api.contact-form-api.id
  resource_id = aws_api_gateway_resource.submit-resource.id
  http_method = "OPTIONS"
  authorization = "NONE"
}

# Mock integration for OPTIONS method
resource "aws_api_gateway_integration" "options-integration" {
  rest_api_id = aws_api_gateway_rest_api.contact-form-api.id 
  resource_id = aws_api_gateway_resource.submit-resource.id
  http_method = aws_api_gateway_method.options-method.http_method
  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Define headers that OPTIONS method is allowed to return
resource "aws_api_gateway_method_response" "options-response" {
  rest_api_id = aws_api_gateway_rest_api.contact-form-api.id
  resource_id = aws_api_gateway_resource.submit-resource.id
  http_method = aws_api_gateway_method.options-method.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

#Values of the headers returned by OPTIONS method
resource "aws_api_gateway_integration_response" "options-integration-response" {
  rest_api_id = aws_api_gateway_rest_api.contact-form-api.id
  resource_id = aws_api_gateway_resource.submit-resource.id
  http_method = aws_api_gateway_method.options-method.http_method
  status_code = aws_api_gateway_method_response.options-response.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

#Deploy the API
resource "aws_api_gateway_deployment" "TE-API-deployement" {
  rest_api_id = aws_api_gateway_rest_api.contact-form-api.id

  #triggers redeployement on API changes
  triggers = {
    redeployement = sha1(jsonencode([
        aws_api_gateway_resource.submit-resource.id,
        aws_api_gateway_method.post-method.id,
        aws_api_gateway_integration.lambda-integration.id,
        aws_api_gateway_method.options-method.id,
        aws_api_gateway_integration.options-integration.id
    ]))
  }

  #lifecycle rule: create new deployment before old one is destroyed to prevent downtimes
  lifecycle {
    create_before_destroy = true
  }
}

# Stage for deployment
resource "aws_api_gateway_stage" "api-stage" {
  deployment_id = aws_api_gateway_deployment.TE-API-deployement.id
  rest_api_id = aws_api_gateway_rest_api.contact-form-api.id
  stage_name = "prod"
}