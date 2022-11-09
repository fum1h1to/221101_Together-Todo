from django.db import models
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin, UserManager
from django.core.validators import MinValueValidator, MaxValueValidator, EmailValidator
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.utils.translation import gettext_lazy as _
import uuid

class UserManager(UserManager):
  '''
  ユーザのデータベースを操作するためのクラス
  ユーザに関わる詳細な処理はここに書いて行く

  ※なお、views.pyなどの外部から扱う場合は、このクラスをimportするのではなく。
  CustomUser.object.{関数名}とする。
  ex) send_email()を使いたい場合、
  CustomUser.object.send_email(userid, subject, message)
  '''

  use_in_migrations = True

  def _create_user(self, username, email, password, **extra_fields):
    '''
    ユーザ作成の補助的な関数
    '''
    username = self.model.normalize_username(username)
    email = self.normalize_email(email)
    user = self.model(username=username, email=email, **extra_fields)
    user.set_password(password)
    user.save(using=self._db)
    return user

  def create_user(self, username, email, password=None, **extra_fields):
    '''
    一般ユーザを作成する関数
    '''
    extra_fields.setdefault("is_staff", False)
    extra_fields.setdefault("is_superuser", False)
    return self._create_user(username, email, password, **extra_fields)

  def create_superuser(self, username, email, password=None, **extra_fields):
    '''
    管理者ユーザを作成する関数
    '''
    extra_fields.setdefault("status", 1)
    extra_fields.setdefault("is_active", True)
    extra_fields.setdefault("is_staff", True)
    extra_fields.setdefault("is_superuser", True)

    if extra_fields.get("is_staff") is not True:
      raise ValueError("Superuser must have is_staff=True.")
    if extra_fields.get("is_superuser") is not True:
      raise ValueError("Superuser must have is_superuser=True.")

    return self._create_user(username, email, password, **extra_fields)

  def login(self, request, user):
    '''
    ユーザをログインさせる。
    '''
    login(request, user)
  
  def logout(self, request):
    '''
    ユーザをログアウトさせる。
    '''
    logout(request)

  def send_email(self, userid, subject, message):
    '''
    ユーザに対して何かしらのメールを送る関数
    '''
    subject = subject
    message = message
    from_email = settings.DEFAULT_FROM_EMAIL
    user = self.filter(userid=userid).first()
    to = [ user.email ]
    send_mail(subject, message, from_email, to)


class CustomUser(AbstractBaseUser, PermissionsMixin):
  '''
  ユーザのデータベース定義

  ※djangoのデフォルトでUserというクラスがあるけど、それは扱わないので注意
  このクラスを扱う

  Attributes:
    userid
    username
    email
    status
    is_staff
    is_active
  '''

  userid = models.UUIDField(
    default=uuid.uuid4,
    primary_key=True,
    editable=False
  )

  username = models.CharField(
    _("username"),
    max_length=8,
    unique=True,
    validators = [UnicodeUsernameValidator()], 
    #不正な文字列が含まれていないかチェック。
  )

  email = models.EmailField(
    _('email'),
    unique=True,
    validators = [EmailValidator()]
    #Emailであるかどうかのチェック。
  )

  # icon=

  status = models.IntegerField(
    _('status'),
    default=0,
    validators= [MinValueValidator(0), MaxValueValidator(2)]
    #最小値が0で最大値が3になるようにチェック
  )

  is_staff = models.BooleanField(
    _("staff status"),
    default=False,
    help_text=_("Designates whether the user can log into this admin site."),
  )

  is_active = models.BooleanField(
    _("active"),
    default=False,
    help_text=_(
      "Designates whether this user should be treated as active. "
      "Unselect this instead of deleting accounts."
    ),
  )

  # views.pyでUserモデルの情報を取得する際などで利用する。
  objects = UserManager()
  
  EMAIL_FIELD = 'email'
  USERNAME_FIELD = 'email'
  REQUIRED_FIELDS = ["username"]

  class Meta:
    verbose_name = _("User") # 管理画面でuserと表示させるための処理
    verbose_name_plural = _("Users") #上記と同じ



class UserActivateTokensManager(models.Manager):
  '''
  ユーザアクティベート用のデータベースを操作するためのクラス
  ユーザアクティベートに関わる詳細な処理はここに書いて行く

  ※なお、views.pyなどの外部から扱う場合は、このクラスをimportするのではなく。
  UserActivateTokens.object.{関数名}とする。
  '''

  def send_activate_url(self, user):
    '''
    activate用のURLを発行、そして送信
    '''

    user_activate_token = UserActivateTokens.objects.create(
      user=user,
      expired_at=datetime.now()+timedelta(minutes=settings.ACTIVATION_EXPIRED_MINUTES),
    )
    subject = 'Please Activate Your Account'
    message = f'URLにアクセスしてユーザーアクティベーション。\n {settings.HOST_URL}user/{user_activate_token.activate_token}/activation/'

    CustomUser.objects.send_email(user.userid, subject, message)

  def activate_user_by_token(self, activate_token):
    '''
    userをアクティベートする処理。
    '''

    user_activate_token = self.filter(
      activate_token=activate_token,
      expired_at__gte=datetime.now() # __gte = greater than equal
    ).first()
    if hasattr(user_activate_token, 'user'):
      user = user_activate_token.user
      user.status = 1
      user.is_active = True
      user.save()

      self.send_activate_success(user)
      return user
  
  def send_activate_success(self, user):
    '''
    アクティベート成功のメール送信
    '''

    subject = 'Activated! Your Account!'
    message = 'ユーザーが使用できるようになりました'

    CustomUser.objects.send_email(user.userid, subject, message)


class UserActivateTokens(models.Model):
  '''
  ユーザアクティベート用のデータベース定義

  Attributes:
    token_id
    user
    activate_token
    expired_at
  '''

  token_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  activate_token = models.UUIDField(default=uuid.uuid4)
  expired_at = models.DateTimeField()

  objects = UserActivateTokensManager()