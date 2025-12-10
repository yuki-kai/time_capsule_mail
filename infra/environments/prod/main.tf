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

# common環境のstateからルートドメイン情報を参照
data "terraform_remote_state" "common" {
  backend = "local"
  config = {
    path = "../common/terraform.tfstate"
  }
}

module "website" {
  source = "../../modules/static_site"

  env                 = "prod"
  apigateway_endpoint = module.request_schedule_lambda.apigateway_endpoint
}

module "request_schedule_lambda" {
  source = "../../modules"

  env            = "prod"
  cloudfront_url = module.website.cloudfront_url
  account_id     = data.aws_caller_identity.current.account_id
}

module "mail" {
  source = "../../modules/mail"

  env                 = "prod"
  root_domain_name    = data.terraform_remote_state.common.outputs.root_domain_name
  root_domain_zone_id = data.terraform_remote_state.common.outputs.root_domain_zone_id
}

output "website_url" {
  description = "WebサイトのURL"
  value       = module.website.cloudfront_url
}
