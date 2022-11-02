from django.db import models
from datetime import datetime, timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin, UserManager
from django.core.validators import MinValueValidator, MaxValueValidator, EmailValidator
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.utils.translation import gettext_lazy as _
import uuid

class UserManager(UserManager):
  use_in_migrations = True

  def _create_user(self, username, email, password, **extra_fields):
    username = self.model.normalize_username(username)
    email = self.normalize_email(email)
    user = self.model(username=username, email=email, **extra_fields)
    user.set_password(password)
    user.save(using=self._db)
    return user

  def create_user(self, username, email, password=None, **extra_fields):
    extra_fields.setdefault("is_staff", False)
    extra_fields.setdefault("is_superuser", False)
    return self._create_user(username, email, password, **extra_fields)

  def create_superuser(self, username, email, password=None, **extra_fields):
    extra_fields.setdefault("is_staff", True)
    extra_fields.setdefault("is_superuser", True)

    if extra_fields.get("is_staff") is not True:
      raise ValueError("Superuser must have is_staff=True.")
    if extra_fields.get("is_superuser") is not True:
      raise ValueError("Superuser must have is_superuser=True.")

    return self._create_user(username, email, password, **extra_fields)

  def send_email(self, userid, subject, message):
    subject = subject
    message = message
    from_email = settings.DEFAULT_FROM_EMAIL
    user = self.filter(userid=userid).first()
    to = [ user.email ]
    send_mail(subject, message, from_email, to)


class CustomUser(AbstractBaseUser, PermissionsMixin):

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
  USERNAME_FIELD = 'username'
  REQUIRED_FIELDS = ["email"]

  class Meta:
    verbose_name = _("User") # 管理画面でuserと表示させるための処理
    verbose_name_plural = _("Users") #上記と同じ


# ユーザアクティベート用データベースのmanager
class UserActivateTokensManager(models.Manager):

  # activate用のURLを発行、そして送信
  def send_activate_url(self, user):
    user_activate_token = UserActivateTokens.objects.create(
      user=user,
      expired_at=datetime.now()+timedelta(minutes=settings.ACTIVATION_EXPIRED_MINUTES),
    )
    subject = 'Please Activate Your Account'
    message = f'URLにアクセスしてユーザーアクティベーション。\n {settings.DEVELOP_URL}user/{user_activate_token.activate_token}/activation/'

    CustomUser.objects.send_email(user.userid, subject, message)

  # userをアクティベートする処理。
  def activate_user_by_token(self, activate_token):
    user_activate_token = self.filter(
      activate_token=activate_token,
      expired_at__gte=datetime.now() # __gte = greater than equal
    ).first()
    if hasattr(user_activate_token, 'user'):
      user = user_activate_token.user
      user.status = 1
      user.is_active = True
      user.save()
      return user
  
  # アクティベート成功のメール送信
  def send_activate_success(self, user):
    subject = 'Activated! Your Account!'
    message = 'ユーザーが使用できるようになりました'

    CustomUser.objects.send_email(user.userid, subject, message)

# ユーザアクティベート用のデータベース
class UserActivateTokens(models.Model):
  token_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  activate_token = models.UUIDField(default=uuid.uuid4)
  expired_at = models.DateTimeField()

  objects = UserActivateTokensManager()