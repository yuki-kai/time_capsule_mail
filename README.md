# time_capsule_mail

## 概要
未来の自分にメールを送るサービス。


## 環境構築
1. AWSのコンソールで`SES > 設定 > ID`で`yuki-fourseasons.com`のドメインがあることを確認する。  
なければ「IDの作成」から上記のドメインでIDを作成する。入力項目はデフォルトのままで良い。  
作成されたCNAMEをConoHaの管理画面からDNSに登録する。

2. `infra/environments/common`ディレクトリで`terraform plan`で共通リソースが反映されていることを確認する。  
反映されていなければ`terraform apply`を実施。
※共通リソースの更新をした場合は

3. `lambda_functions`ディレクトリで移動して`npm install && npm run build`を実行
4. `website`ディレクトリで移動して`npm install && npm run build`を実行
5. `stage`または`prod`ディレクトリに移動して`terraform apply`を実行


## システム構成図
![](infra/system-diagram.svg)


## 参考にした資料
- [取得したドメインをAWS Route53, SESで使用する](https://zenn.dev/kompeito/articles/431844db213a54)
- [Route53でサブドメインごとにアクセスするリージョンを振り分けてみた](https://dev.classmethod.jp/articles/regions-accessed-subdomain-route53/)
