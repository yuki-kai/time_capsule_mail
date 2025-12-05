# ドメインのIDタイプを指定
resource "aws_ses_domain_identity" "ses_domain" {
  domain = var.domain_name
}

# DKIMの設定
resource "aws_ses_domain_dkim" "ses_dkim" {
  domain = var.domain_name

  depends_on = [
    aws_ses_domain_identity.ses_domain
  ]
}

# DKIMのCNAMEレコードをRoute53に登録
resource "aws_route53_record" "ses_dkim" {
  count   = 3
  zone_id = aws_route53_zone.zone.zone_id
  name    = "${element(aws_ses_domain_dkim.ses_dkim.dkim_tokens, count.index)}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = "600"
  records = ["${element(aws_ses_domain_dkim.ses_dkim.dkim_tokens, count.index)}.dkim.amazonses.com"]
}
