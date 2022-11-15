from django import forms
from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, UsernameField
from django.utils.translation import gettext_lazy as _

from account.models import UserActivateTokens, CustomUser

User = get_user_model()

class SignupForm(UserCreationForm):
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
    pass

class UserChangeForm(forms.ModelForm):
    icon = forms.ImageField(required=False)
    username = forms.CharField(required=False)
    email = forms.EmailField(required=False)
    password = forms.CharField(required=False)

    class Meta:
        model = User
        fields = ['icon', 'username', 'email', 'password']