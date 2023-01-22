# Members 
[kuyu0827](https://github.com/kuyu0827)
[foodcourt1](https://github.com/foodcourt1)
[muji1213](https://github.com/muji1213)
[fum1h1to][https://github.com/fum1h1to)

# 構築手順マニュアル

## 開発環境の構築
開発環境にはdockerを用いています。

1. Dockerをインストールする

2. コンテナの作成
    ```
    $ docker-compose up -d
    ```

3. サーバの起動
    まずは、pythonのコンテナに接続
    ```
    $ docker exec -it togeter-todo-python bash
    ```

    そして、サーバを起動<br>
    ※```.env```ファイルがないと起動できません。
    ```
    $ python manage.py makemigrations
    $ python manage.py migrate
    $ python manage.py runserver 0.0.0.0:8888
    ```

4. ブラウザで開く

    ```http://localhost:8888```にアクセスする。

## メールの送信について
メールの送信処理は、GoogleのSMTPを用いて処理しています。<br>
DEMOの際に使用したgoogleアカウントは2022年12月31日をもって削除するため、以降このアプリを動かしたい場合は、下記の手順でメールを送信できるよう設定する必要があります。

### Gmailを使ってメールを送るようにする
0. 必要な場合、メール送信用のgoogleアカウントを作成する。
1. ChromeでGmailにログインします。
2. 自分のアイコンをクリックして「Google アカウントの管理」をクリックします。
3. 画面左側のメニューから「セキュリティ」を選択します。
4. 「Googleへのログイン」の「2段階認証プロセス」を画面の指示に従い有効にします。（すでに完了している場合は、不要）
5. セキュリティのページの「Googleへのログイン」の「アプリ　パスワード」を選択します。
6. 「デバイスを選択」から「その他」を選択して名前を入力します。
7. 「生成」ボタンをクリックすると「お使いのデバイスのアプリ パスワード」が生成されるのでそのパスワードをメモしておきます。

### ```settings.py```及び```.env```への反映。
重要な情報を```settings.py```に反映する際は```.env```を介して反映しています。<br>
```.env```の該当する行に先ほどメモしたパスワード等を反映します。

```
EMAIL_HOST_USER="パスワード生成時に使用したGmailのメールアドレス"
EMAIL_HOST_PASSWORD="Googleで生成したパスワード"
```

例は下記となります。（このコードを反映しても動作しません）
```
DJANGO_SECRET_KEY="&4i$jd_qg&1*6tm65pq(%)*=l*yf9p^=nqqnqcr!u9w_qvsml("
DATABASES_NAME="todo"
DATABASES_USER="todoadmin"
DATABASES_PASSWORD="hogehoge"
DATABASES_HOST="db"
DATABASES_PORT="5432"
EMAIL_HOST="smtp.gmail.com"
EMAIL_HOST_PORT="587"
EMAIL_HOST_USER="test.together.todo@gmail.com"
EMAIL_HOST_PASSWORD="abcdefjklmnopqrs"
```
