variable "env" {
  description = "stageかprodの実行環境"
  type        = string
  default     = "stage"
}

variable "cloudfront_url" {
  description = "CloudFrontのURL"
  type        = string
}
