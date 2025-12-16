terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      # モジュール内で aws.virginia を使うための受け口
      configuration_aliases = [aws.virginia]
    }
  }
}
