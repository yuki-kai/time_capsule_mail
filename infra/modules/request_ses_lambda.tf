# EventBridgeスケジューラが実行するLambda関数
resource "aws_lambda_function" "create_ses" {
  function_name    = "${var.env}CreateSes"
  filename         = data.archive_file.main.output_path
  role             = aws_iam_role.ses_access_lambda_role.arn
  source_code_hash = data.archive_file.main.output_base64sha256
  runtime          = "nodejs22.x"
  handler          = "createSes.handler"
}

resource "aws_iam_role" "ses_access_lambda_role" {
  name               = "${var.env}-ses-request-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.create_ses_lambda_assume_role.json
}

data "aws_iam_policy_document" "create_ses_lambda_assume_role" {
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
resource "aws_iam_role_policy_attachment" "create_ses_lambda_basic_execution" {
  role       = aws_iam_role.ses_access_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "ses_access_attachment" {
  role       = aws_iam_role.ses_access_lambda_role.name
  policy_arn = aws_iam_policy.ses_access_policy.arn
}

resource "aws_iam_policy" "ses_access_policy" {
  name   = "${var.env}-ses-access-policy"
  policy = data.aws_iam_policy_document.lambda_ses_access_role.json
}

data "aws_iam_policy_document" "lambda_ses_access_role" {
  statement {
    actions = [
      "ses:SendEmail",
      "ses:SendRawEmail",
    ]
    resources = ["arn:aws:ses:ap-northeast-1:${var.account_id}:identity/*"]
  }
}
