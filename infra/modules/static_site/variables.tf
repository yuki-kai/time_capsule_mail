variable "env" {
  description = "stageかprodの実行環境"
  type        = string
  default     = "stage"
}

variable "apigateway_endpoint" {
  description = "API Gatewayのエンドポイント"
  type        = string
}

variable "website_domain_name" {
  description = "CloudFrontのカスタムドメイン（ACMおよびaliasesに使用）"
  type        = string
}
