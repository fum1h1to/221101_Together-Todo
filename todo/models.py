import uuid
import os

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone  # #時刻を使うときに必要なモジュール
from django.core.validators import FileExtensionValidator##ファイルの型を指定する
from account.models import CustomUser
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# Create your models here.

class TaskManager(models.Manager):
    '''
    タスクのマネージャー
    '''

    def create(self, user, taskName, deadline, importance, note, isBocchi, requestUsers):
        '''
        タスクの作成をする
        '''
        task = Task(userid=user,taskName=taskName,deadline=deadline,importance=importance,
                                note=note,isBocchi=isBocchi,)
        task.save()
        subject=f'{user.username}さんからタスクチェックの依頼が届きました.'
        message=f'アプリを開いてタスクを確認しましょう！\nタスク名: {taskName}\n期限日: {deadline}'

        for username in requestUsers:
            user = CustomUser.objects.get(username=username)
            Commission.objects.create(user, task)
            CustomUser.objects.send_email(user, subject, message)

    
    def showUserTasks(self, user):
        tasks = Task.objects.filter(userid=user).all()
        return list(tasks)
    
    
    def update(self,taskid,taskName,deadline,importance,note,):
        task = Task.objects.get(taskid=taskid)
        task.taskName = taskName
        task.deadline = deadline
        task.importance = importance
        task.note = note
        task.save()        
        subject='タスクが編集されました。'
        message='タスクを編集しました。アプリを開いて確認しましょう！'
        Commission.objects.sendEmailToTaskIdRelatingUserId(taskid, subject, message)
       
       
    def delete(self,taskid,):
        
        message='タスクを削除しました。タスクの依頼がなくなりました.'
        subject='タスクが削除されました。'            
        Commission.objects.sendEmailToTaskIdRelatingUserId(taskid, subject, message)
        Task.objects.filter(taskid=taskid).delete()
           

    def insertFirstCheckData(self, taskid, img, movie, description):
        task = Task.objects.get(taskid=taskid)
        task.status = 1
        task.img = img
        task.movie = movie
        task.description = description
        task.save()

    def complete_one(self, taskid):
        requestUsers = Commission.objects.listRequestedUserByTask(taskid)
        if len(requestUsers) != 0:
            return False

        task = Task.objects.get(taskid=taskid)
        task.status = 2
        task.save()

        return True


class Task(models.Model):
    def get_image_path(self, filename):
        """カスタマイズした画像パスを取得する.

        :param self: インスタンス (models.Model)
        :param filename: 元ファイル名
        :return: カスタマイズしたファイル名を含む画像パス
        """
        prefix = 'task/img/'
        name = str(uuid.uuid4()).replace('-', '')
        extension = os.path.splitext(filename)[-1]
        return prefix + name + extension
    
    def get_movie_path(self, filename):
        """カスタマイズした画像パスを取得する.

        :param self: インスタンス (models.Model)
        :param filename: 元ファイル名
        :return: カスタマイズしたファイル名を含む画像パス
        """
        prefix = 'task/movie/'
        name = str(uuid.uuid4()).replace('-', '')
        extension = os.path.splitext(filename)[-1]
        return prefix + name + extension
    
    def moviefile_size(value): ##動画サイズを設定する

        limit=536870912 ##512MBをbyteに変換
        if value.size > limit:
            raise ValidationError('動画のサイズが512MBを超えています。')

    def imagefile_size(value):##画像サイズを設定する

        limit=5242880 ##5MBをbyteに変換
        if value.size > limit:

            raise ValidationError('画像のサイズが5MBを超えています。')

    taskid=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) ##タスクID 主キー

    userid=models.ForeignKey(CustomUser, on_delete=models.CASCADE) ##ユーザID accountファイルからもらう
    
    taskName=models.CharField(
        verbose_name= _("タスクの名前"),
        blank=False, max_length=50,)##50文字までの文字の入力が可能
    
    deadline = models.DateTimeField(default=timezone.now, )##締切日 調べる。
    
    importance=models.IntegerField(default=0,validators= [MinValueValidator(0), MaxValueValidator(2)]) ##重要度  0,1,2で重要度の大きさを決める。 validatorsで指定 
    
    note=models.TextField(
        verbose_name= _("メモ欄"),
        max_length=300, blank=True,)
    
    isBocchi=models.BooleanField(verbose_name= _("ぼっち"),default=False)

    
    ###ここら辺の処理はまた違うときに作成される。
    img = models.ImageField(upload_to=get_image_path, validators=[FileExtensionValidator(['jpg','png']), imagefile_size],verbose_name= _("画像"),)  ###画像ファイル
    
    movie=models.FileField( upload_to=get_movie_path ,verbose_name= _("動画"),validators=[FileExtensionValidator(['mp4','MPEG4','MOV']), moviefile_size],)
    
    description=models.TextField( verbose_name= _("説明"), blank=True)

    status=models.IntegerField(default=0,validators= [MinValueValidator(0), MaxValueValidator(2)])
    
    objects=TaskManager()##これを書くことでTaskManager()外部（vieews）でも使えるようになる。

class CommissionManager(models.Manager):

    ## veiws.pyの処理をここに書く  関数を定義する・
    
    def create(self,userid, taskid):    
        ##コミッション版はTaskManagerがこの関数を呼び出す。
        ###処理を分かりやすくするため。
        ##データベースを作ってあげる。
        
        ##さっきの関数の引数でIsert INTO の処理を保存する。

        commission=Commission(userid=userid, taskid=taskid)
        commission.save()

    def sendEmailToTaskIdRelatingUserId(self, taskid, subject, message):
       
        requestUsers = Commission.objects.filter(taskid_id=taskid)
        
        for username in requestUsers:           
            user = CustomUser.objects.get(userid=username.userid_id)
            CustomUser.objects.send_email(user, subject, message)
        

    def listRequestedUserByTask(self, taskid):
        users = Commission.objects.filter(taskid=taskid).all().values_list('userid', flat=True)
        data = []
        for userid in users:
            data.append(CustomUser.objects.get(userid=userid))
        return list(data)

    def listUserRequestedTask(self, user):
        tasks = Commission.objects.filter(userid=user).exclude(completed=True).values_list('taskid', flat=True)
        data = []
        for taskid in tasks:
            task = Task.objects.get(taskid=taskid)
            if task.status == 1:
                data.append(Task.objects.get(taskid=taskid))
        return list(data)

    def complete(self, user, taskid):
        task = Task.objects.get(taskid=taskid)
        com = Commission.objects.get(userid=user, taskid=task)
        com.completed = True
        com.save()
        self.all_complete(taskid)
    
    def all_complete(self, taskid):
        commissions = Commission.objects.filter(taskid=taskid).all()
        for com in commissions:
            if not com.completed:
                return
        
        task = Task.objects.get(taskid=taskid)
        task.status = 2
        task.save()


class Commission(models.Model):
    commissionid=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    taskid=models.ForeignKey(Task, on_delete=models.CASCADE)##タスクIDを外部からもらう
    
    userid=models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    completed = models.BooleanField(default=False)

    ###Commisionのデータベースを定義している。

    objects = CommissionManager()


    

    

    
     



  

  





    
