variable "env" {
  description = "stageかprodの実行環境"
  type        = string
  default     = "stage"
}
variable "domain_name" {
  description = "ドメイン名"
  type        = string
}
