import json
from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.http import require_http_methods
from django.core import serializers
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from todo.forms import TaskCreateForm
from .models import Task
from account.models import CustomUser

class Home(LoginRequiredMixin, TemplateView):
    template_name = 'todo/home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context

##処理内容 
##viewsはhtmlからもらったあとどうするかの処理を書いている。

@require_http_methods(['POST'])
@login_required
def create(request):
    create_user=request.user
    taskName = request.POST.get('taskName')
    deadline = request.POST.get('deadline')
    importance = request.POST.get('importance')
    note = request.POST.get('note')
    requestUsers = request.POST.getlist('requestUsers') # useridを渡す

    bocchi_valid = True # formではチェックできないvalidチェックに関して。
    bocchi = int(request.POST.get('bocchi'))
    if bocchi == 0:
        isBocchi = False
    elif 0 < bocchi and bocchi <= 10:
        isBocchi = True
        randomUsers = CustomUser.objects.choiceUserRandom(create_user, bocchi)
        requestUsers = []
        for user in randomUsers:
            requestUsers.append(user.username)
    else:
        bocchi_valid = False
    
    requestUser_valid = True
    if len(requestUsers) > 10:
        requestUser_valid = False
    
    task_data=TaskCreateForm(data=request.POST)

    if task_data.is_valid() and bocchi_valid and requestUser_valid: ##フォーマットをチェックする
    # if False:
    
        ###タスクを作成する処理  無理ならエラーを返す。
        Task.objects.create(create_user, taskName,deadline,importance,note,isBocchi,requestUsers) ##TaskManager()のcreate()が呼び出される。
        
        context = {
            'result':True,
        }
        return JsonResponse(context)
        
    else:
        error = dict(task_data.errors.items())
        if not bocchi_valid:
            error['bocchi'] = '人数が不正です。'
        
        if not requestUser_valid:
            error['requestUsers'] = '依頼者は10人までです。'

        context = {
            'result':False,
            'error': error
        }

        return JsonResponse(context)


@require_http_methods(['POST'])
@login_required
def show(request):

    user = request.user

    tasks = Task.objects.showUserTasks(user)
    json_tasks = json.loads(serializers.serialize("json", tasks))
    return_data = []
    for task in json_tasks:
        return_data.append({
            'taskName': task['fields']['taskName'],
            'deadline': task['fields']['deadline'],
            'importance': task['fields']['importance'],
            'note': task['fields']['note'],
            'status': task['fields']['status'],
        })

    context = {
        'result': True,
        'tasks': return_data
    }

    return JsonResponse(context)