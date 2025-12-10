variable "env" {
  description = "stageかprodの実行環境"
  type        = string
  default     = "stage"
}

variable "root_domain_name" {
  description = "ルートドメイン名"
  type        = string
}

variable "root_domain_zone_id" {
  description = "ルートドメイン名"
  type        = string
}