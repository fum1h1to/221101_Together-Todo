from django.views.generic import TemplateView
from django.shortcuts import render, redirect

from account.forms import SignupForm
from .models import UserActivateTokens
from django.http import HttpResponse

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

class LoginView(TemplateView):
    template_name = 'account/login.html'

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
