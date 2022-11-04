from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

from account.models import UserActivateTokens

User = get_user_model()

class SignupForm(UserCreationForm):
    username = forms.CharField(label= "ユーザ名")
    email = forms.EmailField(label="メールアドレス")
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]

        if commit:
            user.save()
            UserActivateTokens.objects.send_activate_url(user)

        return user


##追加
class LoginForm(AuthenticationForm):
 pass