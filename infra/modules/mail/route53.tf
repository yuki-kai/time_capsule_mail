# Route53のホストゾーンを作成
resource "aws_route53_zone" "env" {
  name = "${var.env}.${var.root_domain_name}"
}

# 3. 親ゾーンにNSレコードを追加して、サブドメインへ権限委譲する
resource "aws_route53_record" "env_ns" {
  zone_id = var.root_domain_zone_id # 親ゾーンのID
  name    = aws_route53_zone.env.name
  type    = "NS"
  ttl     = 300

  records = aws_route53_zone.env.name_servers
}
