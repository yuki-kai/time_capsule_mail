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
      ALLOWED_ORIGIN     = var.cloudfront_url
      TARGET_LAMBDA_ARN  = aws_lambda_function.create_ses.arn
      SCHEDULER_ROLE_ARN = aws_iam_role.scheduler_invoke_lambda_role.arn
    }
  }
}

# EventBridge SchedulerがSESをコールするLambdaを起動するためのロール
resource "aws_iam_role" "scheduler_invoke_lambda_role" {
  name               = "${var.env}-scheduler-invoke-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume_role.json
}

data "aws_iam_policy_document" "scheduler_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "scheduler_invoke_lambda_policy" {
  name = "${var.env}-scheduler-invoke-lambda-policy"
  role = aws_iam_role.scheduler_invoke_lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = "lambda:InvokeFunction",
        Resource = aws_lambda_function.create_ses.arn
      }
    ]
  })
}

resource "aws_iam_role" "create_schedule_lambda_role" {
  name               = "${var.env}-create-schedule-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.create_schedule_lambda_assume_role.json
}

data "aws_iam_policy_document" "create_schedule_lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# CloudWatchへのlogの書き込み権限を設定
resource "aws_iam_role_policy_attachment" "create_schedule_lambda_basic_execution" {
  role       = aws_iam_role.create_schedule_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda関数がEventBridge Schedulerを操作する権限
resource "aws_iam_role_policy" "create_schedule_lambda_scheduler_policy" {
  name = "${var.env}-create-schedule-lambda-scheduler-policy"
  role = aws_iam_role.create_schedule_lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "scheduler:CreateSchedule",
          "scheduler:GetSchedule",
          "scheduler:DeleteSchedule"
        ],
        Resource = "arn:aws:scheduler:ap-northeast-1:${var.account_id}:schedule/default/*"
      },
      {
        Effect = "Allow",
        Action = [
          "iam:PassRole"
        ],
        Resource = aws_iam_role.scheduler_invoke_lambda_role.arn
      }
    ]
  })
}
