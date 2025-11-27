data "archive_file" "main" {
  type        = "zip"
  source_dir  = "../../../lambda_functions/dist"
  output_path = "../../../lambda_functions/dist/output.zip"
}

# API Gatewayからのリクエストを受け、EventBridgeスケジューラを登録するLambda関数
resource "aws_lambda_function" "create_schedule" {
  function_name    = "${var.env}CreateSchedule"
  filename         = data.archive_file.main.output_path
  source_code_hash = data.archive_file.main.output_base64sha256
  role             = aws_iam_role.create_schedule_lambda_role.arn
  runtime          = "nodejs22.x"
  handler          = "createSchedule.handler"
  
  environment {
    variables = {
      ALLOWED_ORIGIN = var.cloudfront_url
    }
  }
}

resource "aws_iam_role" "create_schedule_lambda_role" {
  name               = "${var.env}-create-schedule-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# CloudWatchへのlogの書き込み権限を設定
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.create_schedule_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
