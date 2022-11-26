import json
from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.http import require_http_methods
from django.core import serializers
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from todo.forms import TaskCreateForm, firstCheckForm
from .models import Task, Commission
from account.models import CustomUser
from django.conf import settings

from django.views.generic import ListView, DetailView

class Home(LoginRequiredMixin, TemplateView):
    template_name = 'todo/home.html'
    
    def get_context_data(self, **kwargs):
        if self.request.user.icon:
            iconpath = settings.MEDIA_URL + str(self.request.user.icon)
        else:
            iconpath = '/static/common/images/default_icon.jpeg'

        context = {
            'iconpath': iconpath,
            'MEDIA_URL': settings.MEDIA_URL
        }
        return context

class Other(LoginRequiredMixin, TemplateView):
    template_name = 'todo/other.html'

    def get_context_data(self, **kwargs):
        if self.request.user.icon:
            iconpath = settings.MEDIA_URL + str(self.request.user.icon)
        else:
            iconpath = '/static/common/images/default_icon.jpeg'

        context = {
            'iconpath': iconpath,
            'MEDIA_URL': settings.MEDIA_URL
        }
        return context

### test用のview ###
class test_todoListView(LoginRequiredMixin, ListView):
    template_name = 'test/todolist_test.html'
    model = Task
    context_object_name = "tasks"

    def get_queryset(self, **kwargs):
        queryset = super().get_queryset(**kwargs) # Task.objects.all() と同じ結果

        return queryset

@require_http_methods(['GET'])
@login_required
def test_update(request, taskid):
    task = Task.objects.get(taskid=taskid)
    return render(request, 'test/update_test.html', {'task': task})

### test用のviewここまで ###

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
        requestUsers = Commission.objects.listRequestedUserByTask(task['pk'])
        return_requestUsers = []
        for r_user in requestUsers:
            if r_user.icon:
                iconpath = str(settings.MEDIA_URL) + str(r_user.icon)
            else:
                iconpath = '/static/common/images/default_icon.jpeg'
            return_requestUsers.append(
                {
                    'userid': str(r_user.userid),
                    'iconpath': iconpath
                }
            )
        return_data.append({
            'taskid': task['pk'],
            'taskName': task['fields']['taskName'],
            'deadline': task['fields']['deadline'],
            'importance': task['fields']['importance'],
            'note': task['fields']['note'],
            'status': task['fields']['status'],
            'requestUsers': list(return_requestUsers),
            'img': task['fields']['img'],
            'movie': task['fields']['movie'],
            'description': task['fields']['description'],
        })

    context = {
        'result': True,
        'tasks': return_data
    }

    return JsonResponse(context)


@require_http_methods(['POST'])
@login_required
def update(request):
    '''
    updateに成功したらresult: Trueで返す
    updateに失敗したらresult: Falseとerrorの内容を送信する。
    ※49行目からのcreateの処理を参考に、、

    postされてくるもの
    - taskName
    - deadline
    - importance
    - note
    '''


    context = {
        'result': False,
        'error': {}
    }

    return JsonResponse(context)


@require_http_methods(['POST'])
@login_required
def delete(request):
    '''
    deleteに成功したらresult: Trueで返す
    deleteに失敗したらresult: Falseとerrorの内容を送信する。
    ※49行目からのcreateの処理を参考に、、

    postされてくるもの
    - taskid
    '''


    context = {
        'result': False,
    }

    return JsonResponse(context)


@require_http_methods(['POST'])
@login_required
def firstCheck(request):
    '''
    一次チェックをする。
    '''
    taskid = request.POST.get('taskid')

    task_data=firstCheckForm(data=request.POST, files=request.FILES)
    if task_data.is_valid():
        img = task_data.cleaned_data['img']
        movie = task_data.cleaned_data['movie']
        description = task_data.cleaned_data['description']

        Task.objects.insertFirstCheckData(taskid, img, movie, description)

        context = {
            'result': True,
        }

        return JsonResponse(context)

    else:
        error = dict(task_data.errors.items())
        context = {
            'result': False,
            'error': error,
        }

        return JsonResponse(context)

@require_http_methods(['POST'])
@login_required
def complete(request):
    '''
    依頼者がいないタスクを完了させる。
    '''
    taskid = request.POST.get('taskid')

    result = Task.objects.complete(taskid)
    if result:

        context = {
            'result': True,
        }

        return JsonResponse(context)

    else:
        context = {
            'result': False,
        }

        return JsonResponse(context)