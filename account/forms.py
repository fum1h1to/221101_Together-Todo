from django import forms
from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, UsernameField
from django.utils.translation import gettext_lazy as _

from account.models import UserActivateTokens
from account.models import CustomUser

User = get_user_model()

class SignupForm(UserCreationForm):
    username = forms.CharField(
        label= _("ユーザ名"),
        widget=forms.TextInput(
            attrs={
                "autofocus": True,
                "class": "form-control"
            }
        )
    )
    email = forms.EmailField(
        label=_("メールアドレス"),
        widget=forms.EmailInput(
            attrs={
                "autofocus": True,
                "class": "form-control"
            }
        )
    )
    password1 = forms.CharField(
        label=_("パスワード"),
        strip=False,
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", "class": "form-control"}),
        help_text=password_validation.password_validators_help_text_html(),
    )
    password2 = forms.CharField(
        label=_("パスワード（確認用）"),
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", "class": "form-control"}),
        strip=False,
        help_text=_("Enter the same password as before, for verification."),
    )
    
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

    def clean_username(self):
        '''
        usernameとなっているがemailのフォーマットチェック
        '''
        email = self.cleaned_data['username']
        CustomUser.objects.checkEmailValidate(email)
        return email