terraform {
  backend "s3" {
    bucket = "nm-travelease-terraformstate"
    key = "global/s3/terraform.tfstate"
    region = "ap-south-1"
    dynamodb_table = "travelease-tfstate-table"
  }
}