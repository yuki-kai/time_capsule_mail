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

# us-east-1 (バージニア北部) のエイリアスプロバイダ
provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

# common環境のstateからルートドメイン情報を参照
data "terraform_remote_state" "common" {
  backend = "local"
  config = {
    path = "../common/terraform.tfstate"
  }
}

locals {
  website_domain_name = "www.time-capsule-mail.yuki-fourseasons.com"
}

module "website" {
  source = "../../modules/static_site"

  env                 = "prod"
  apigateway_endpoint = module.request_schedule_lambda.apigateway_endpoint

  website_domain_name = local.website_domain_name
  hosted_zone_id      = data.terraform_remote_state.common.outputs.root_domain_zone_id
  env_aws_acm_arn     = data.terraform_remote_state.common.outputs.prod_domain

  providers = {
    aws          = aws
    aws.virginia = aws.virginia
  }
}

module "request_schedule_lambda" {
  source = "../../modules"

  env                 = "prod"
  cloudfront_url      = module.website.cloudfront_url
  account_id          = data.aws_caller_identity.current.account_id
  website_domain_name = local.website_domain_name
}

output "website_url" {
  description = "WebサイトのURL"
  value       = module.website.cloudfront_url
}
