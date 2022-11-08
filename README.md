# how to
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
    $ python manage.py makemigration
    $ python manage.py migrate
    $ python manage.py runserver 0.0.0.0:8888
    ```

4. ブラウザで開く

    ```http://localhost:8888```にアクセスする。
