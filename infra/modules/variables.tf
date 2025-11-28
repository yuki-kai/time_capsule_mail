variable "env" {
  description = "stageかprodの実行環境"
  type        = string
  default     = "stage"
}

variable "cloudfront_url" {
  description = "CloudFrontのURL"
  type        = string
}

variable "account_id" {
  description = ""
  type        = string
}
