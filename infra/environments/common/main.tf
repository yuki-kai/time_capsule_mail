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

locals {
  domain_name = "yuki-fourseasons.com"
}

# Route53のルートのホストゾーンを作成
resource "aws_route53_zone" "main" {
  name = local.domain_name
}

# ドメインのIDタイプを指定
resource "aws_ses_domain_identity" "ses_domain" {
  domain = local.domain_name
}

# DKIMの設定
resource "aws_ses_domain_dkim" "ses_dkim" {
  domain = local.domain_name

  depends_on = [
    aws_ses_domain_identity.ses_domain
  ]
}

# DKIMのCNAMEレコードをRoute53に登録
resource "aws_route53_record" "ses_dkim" {
  count   = 3
  zone_id = aws_route53_zone.main.zone_id
  name    = "${element(aws_ses_domain_dkim.ses_dkim.dkim_tokens, count.index)}._domainkey.${local.domain_name}"
  type    = "CNAME"
  ttl     = "600"
  records = ["${element(aws_ses_domain_dkim.ses_dkim.dkim_tokens, count.index)}.dkim.amazonses.com"]
}

output "root_domain_zone_id" {
  description = "ルートホストゾーンのzone_id"
  value       = aws_route53_zone.main.zone_id
}

output "root_domain_name" {
  description = "管理対象のドメイン名"
  value       = local.domain_name
}
