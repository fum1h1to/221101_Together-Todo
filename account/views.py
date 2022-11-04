from django.views.generic import TemplateView
from django.shortcuts import render, redirect

from account.forms import SignupForm,LoginForm
from together_todo.settings import LOGIN_REDIRECT_URL
from .models import UserActivateTokens
from django.http import HttpResponse


from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin

from django.contrib.auth.models import User

app_name = 'account'

def activate_user(request, activate_token):
    activated_user = UserActivateTokens.objects.activate_user_by_token(
        activate_token)
    if hasattr(activated_user, 'is_active'):
        if activated_user.is_active:
            UserActivateTokens.objects.send_activate_success(activated_user)
            return render(request, 'account/activate_success.html')
    return render(request, 'account/activate_failed.html')
   
class TopView(TemplateView):
    template_name = 'account/top.html'




class Login_success(LoginRequiredMixin, TemplateView):
    template_name = 'account/login_success.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context



class LoginView(LoginView):

  
    form_class = LoginForm
    template_name = 'account/login.html'
    




class Logout_success(LogoutView):
    
    template_name='account/logout_success.html'
    form_class = LoginForm
    

##追加
class OtherView(LoginRequiredMixin, TemplateView):
    template_name = 'login_app/other.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['users'] = User.objects.exclude(username=self.request.user.username)
        return context






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
