locals {
  origin_id = "timeCapsuleMailOrigin"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = local.origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  enabled             = true # ディストリビューションを有効化
  aliases             = ["${var.website_domain_name}"]
  is_ipv6_enabled     = true # IPv6 を有効化
  comment             = "CloudFront Distribution for S3 bucket in Tokyo region"
  default_root_object = "index.html" # ルートにアクセスした際のデフォルトファイル

  # デフォルトのキャッシュ動作設定（GET/HEAD のみ許可し、HTTPS にリダイレクト）
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.origin_id

    forwarded_values {
      query_string = false # クエリパラメータをキャッシュのキーに含めない

      cookies {
        forward = "none" # クッキーを転送しない
      }
    }

    viewer_protocol_policy = "redirect-to-https" # HTTP を HTTPS にリダイレクト
  }

  # 地理的制限の設定（制限なし）
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # 料金クラスの設定（安価なリージョンのみ使用）
  price_class = "PriceClass_100"

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = var.env_aws_acm_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  custom_error_response {
    error_code             = 403
    response_code          = 200
    response_page_path     = "/"
    error_caching_min_ttl  = 0
  }
  custom_error_response {
    error_code             = 404
    response_code          = 200
    response_page_path     = "/"
    error_caching_min_ttl  = 0
  }
}

// OAC
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "${var.env}-time-capsule-mail-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
