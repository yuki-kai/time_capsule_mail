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

module "website" {
  source = "../../modules/static_site"

  env                 = "stage"
  apigateway_endpoint = module.request_schedule_lambda.apigateway_endpoint
}

module "request_schedule_lambda" {
  source = "../../modules"

  env            = "stage"
  cloudfront_url = module.website.cloudfront_url
}

output "website_url" {
  description = "WebサイトのURL"
  value       = module.website.cloudfront_url
}
