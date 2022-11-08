from django.views.generic import TemplateView
from django.shortcuts import render, redirect
from account.forms import SignupForm,LoginForm
from .models import UserActivateTokens
from django.contrib.auth.views import LoginView, LogoutView

from .models import CustomUser

app_name = 'account'

def activate_user(request, activate_token):
    activated_user = UserActivateTokens.objects.activate_user_by_token(
        activate_token)
    if activated_user:
        CustomUser.objects.login(request, activated_user)
        return render(request, 'account/activate_success.html')
    return render(request, 'account/activate_failed.html')
   
class TopView(TemplateView):
    template_name = 'account/top.html'


class LoginView(LoginView):  
    form_class = LoginForm
    template_name = 'account/login.html'


class Logout(LogoutView):
    
    template_name='account/logout.html'


class SignupView(TemplateView):
    template_name = 'account/signup.html'

    def get(self, request, *args, **kwargs):
        form = SignupForm()
        context = {
            'form': form
        }

        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('not_activate')
        
        context = {
            'form': form
        }
        return self.render_to_response(context)


class ActivateSuccessView(TemplateView):
    template_name = 'account/activate_success.html'

class ActivateFailedView(TemplateView):
    template_name = 'account/activate_failed.html'

class NotActivateView(TemplateView):
    template_name = 'account/not_activate.html'
