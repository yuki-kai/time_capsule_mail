output "apigateway_endpoint" {
  description = "API Gatewayのエンドポイント"
  value       = "${aws_api_gateway_stage.env.invoke_url}/${aws_api_gateway_resource.resource.path_part}"
}
