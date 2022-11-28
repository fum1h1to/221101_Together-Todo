import json
from django.views.generic import TemplateView
from django.shortcuts import render, redirect
from account.forms import SignupForm, LoginForm, UserChangeForm
from .models import UserActivateTokens
from django.contrib.auth.views import LoginView, LogoutView
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core import serializers

from .models import CustomUser
from django.conf import settings

app_name = 'account'

def activate_user(request, activate_token):
    activated_user = UserActivateTokens.objects.activate_user_by_token(
        activate_token)
    if activated_user:
        try:
            CustomUser.objects.login(request, activated_user)
            return render(request, 'account/activate_success.html')
        except:
            pass
    return render(request, 'account/activate_failed.html')
   
class TopView(TemplateView):
    template_name = 'account/top.html'


class LoginView(LoginView):  
    form_class = LoginForm
    template_name = 'account/login.html'


def logout(request):
    CustomUser.objects.logout(request)
    return redirect('top')


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


##################################
# ↓ APIのような挙動をするもの
##################################

@require_http_methods(['POST'])
@login_required
def checkPassword(request):
    password = request.POST.get('password')

    if password is not None:
        result = CustomUser.objects.checkPassword(request.user, password)

        if result:
            context = {
                'result': True
            }
            return JsonResponse(context)
    context = {
        'result': False
    }
    return JsonResponse(context)

@require_http_methods(['POST'])
@login_required
def update(request):    
    user_data = UserChangeForm(data=request.POST, files=request.FILES, instance=request.user)
    
    if user_data.is_valid():
        
        icon = user_data.cleaned_data["icon"]
        username = user_data.cleaned_data["username"]
        email = user_data.cleaned_data["email"]
        password = user_data.cleaned_data["password"]
        CustomUser.objects.update(request.user, icon, username, email, password)

        context = {
            'result': True
        }
        return JsonResponse(context)

    else:
        
        context = {
            'result': False,
            'error': dict(user_data.errors.items())
        }

        return JsonResponse(context)

@require_http_methods(['POST'])
@login_required
def delete(request):
    try:
        CustomUser.objects.delete(request.user)
        context = {
            'result': True
        }
        print('context')
        return JsonResponse(context)
    except:
        context = {
            'result': False,
            'message': 'エラーが発生しました。'
        }
        return JsonResponse(context)


@require_http_methods(['POST'])
@login_required
def find(request):
    searchname = request.POST.get('searchname')
    finduser = CustomUser.objects.findByUsername(request.user, searchname)

    result = []
    for user in finduser:
        if user.icon:
            iconpath = str(settings.MEDIA_URL) + str(user.icon)
        else:
            iconpath = '/static/common/images/default_icon.jpeg'

        result.append({ 
            'username': user.username,
            'iconpath': iconpath
        })

    context = {
        'finduser': result
    }
    return JsonResponse(context)
