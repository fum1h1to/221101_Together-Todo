import uuid

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone  # #時刻を使うときに必要なモジュール
from django.core.validators import FileExtensionValidator##ファイルの型を指定する
from account.models import CustomUser
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# Create your models here.


class Task(models.Model):
    

    ##これはForm.pyに書くのかな？
    def moviefile_size(value): ##動画サイズを設定する

        limit=536870912 ##512MBをbyteに変換
        if value.size>limit:

            raise ValidationError('動画のサイズが512MBを超えています。')

    
    def imagefile_size(value):##画像サイズを設定する

        limit=5242880##5MBをbyteに変換
        if value.size>limit:

            raise ValidationError('画像のサイズが5MBを超えています。')

    



   
    taskid=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) ##タスクID 主キー

    userid=models.ForeignKey(CustomUser, on_delete=models.CASCADE) ##ユーザID accountファイルからもらう


    taskName=models.CharField(

        verbose_name= _("タスクの名前"),
        blank=False, max_length=50,)##50文字までの文字の入力が可能

    deadline = models.DateTimeField(default=timezone.now,)##締切日 

    
    
    importance=models.IntegerField() ##重要度 
    
     
    note=models.TextField(
        verbose_name= _("メモ欄"),
        max_length=300,)

    
    isBocchi=models.BooleanField(verbose_name= _("ぼっち"),default=False)

    img = models.ImageField(upload_to='',validators=[FileExtensionValidator(['jpg','png', ],imagefile_size)],verbose_name= _("画像"),)  ###画像ファイル
    
    movie=models.FileField( upload_to='',verbose_name= _("動画"),validators=[FileExtensionValidator(['mp4','MPEG4','MOV', ],moviefile_size)],)
    #動画ファイル 動画の時間を制限する方法を探してみたけどなかなか見つからなかったのでまた探してみます。

    
    
    description=models.TextField( verbose_name= _("説明"),)

    status=models.IntegerField()
    

    

    
    
    


    

    

    
     



  

  





    
