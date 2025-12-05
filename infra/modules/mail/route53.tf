# Route53のホストゾーンを作成
resource "aws_route53_zone" "zone" {
  name = "${var.env}-${var.domain_name}"
}
