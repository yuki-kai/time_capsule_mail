terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
  }

  required_version = ">= 1.2"
}

provider "aws" {
  region = "ap-northeast-1"
}

data "aws_caller_identity" "current" {}

module "website" {
  source = "../../modules/static_site"

  env                 = "stage"
  apigateway_endpoint = module.request_schedule_lambda.apigateway_endpoint
}

module "request_schedule_lambda" {
  source = "../../modules"

  env            = "stage"
  cloudfront_url = module.website.cloudfront_url
  account_id     = data.aws_caller_identity.current.account_id
}

module "mail" {
  source = "../../modules/mail"

  env         = "stage"
  domain_name = "yuki-fourseasons.com"
}

output "website_url" {
  description = "WebサイトのURL"
  value       = module.website.cloudfront_url
}
