from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, UsernameField
from django.utils.translation import gettext_lazy as _

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


class LoginForm(AuthenticationForm):
    username = UsernameField(
        required=True,
        widget=forms.TextInput(
            attrs={
                "autofocus": True,
                "class": "form-control"
            }
        )
    )
    password = forms.CharField(
        label=_("Password"),
        strip=False,
        widget=forms.PasswordInput(
            attrs={
                "autocomplete": "current-password",
                "class": "form-control"
            }
        ),
    )