import json
import html
from django.db import transaction
from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.http import require_http_methods
from django.core import serializers
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from todo.forms import TaskCreateForm, firstCheckForm, TaskUpdateForm
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

##################################
# ↓ APIのような挙動をするもの
##################################

@require_http_methods(['POST'])
@login_required
def create(request):
    '''
    タスクを作成する

    postされてくるもの
    - taskName: タスクの名前
    - deadline: 期限日
    - importance: 重要度
    - note: メモ
    - requestUsers: チェックを依頼するユーザ
    - bocchi: ボッチモードであればその人数。でなければ、0
    '''
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
    
        ###タスクを作成する処理  無理ならエラーを返す。
        try:   
            with transaction.atomic():
                Task.objects.create(create_user, taskName,deadline,importance,note,isBocchi,requestUsers) ##TaskManager()のcreate()が呼び出される。

            context = {
                'result': True,
            }
            return JsonResponse(context)

        except:
            # サーバに何かエラーが起きた場合
            context = {
                'result': False,
                'status': 2,
                'error': {}
            }
            return JsonResponse(context)

    else:
        error = dict(task_data.errors.items())
        if not bocchi_valid:
            error['bocchi'] = '人数が不正です。'
        
        if not requestUser_valid:
            error['requestUsers'] = '依頼者は10人までです。'

        # フォーマットエラーの場合
        context = {
            'result':False,
            'status': 1,
            'error': error
        }

        return JsonResponse(context)

@require_http_methods(['POST'])
@login_required
def show(request):
    '''
    ユーザIDに紐づくタスクを取得する
    '''
    user = request.user

    try:
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
                'taskName': html.escape(task['fields']['taskName']),
                'deadline': task['fields']['deadline'],
                'importance': task['fields']['importance'],
                'note': html.escape(task['fields']['note']),
                'status': task['fields']['status'],
                'requestUsers': list(return_requestUsers),
                'img': task['fields']['img'],
                'movie': task['fields']['movie'],
                'description': html.escape(task['fields']['description']),
            })

    except:
        # サーバに何かエラーが起きた場合
        context = {
            'result': False,
            'status': 2,
            'error': {}
        }

        return JsonResponse(context)

    context = {
        'result': True,
        'tasks': return_data
    }

    return JsonResponse(context)


@require_http_methods(['POST'])
@login_required
def update(request):
    '''
    タスクをupdateする処理

    postされてくるもの
    - taskid
    - taskName
    - deadline
    - importance
    - note
    '''
    taskid = request.POST.get('taskid')
    taskName = request.POST.get('taskName')
    deadline = request.POST.get('deadline')
    importance = request.POST.get('importance')
    note = request.POST.get('note')

    task_data=TaskUpdateForm(data=request.POST)##フォーマットを判定

    if task_data.is_valid(): 

        try:
            with transaction.atomic():
                Task.objects.update( taskid, taskName,deadline,importance,note,) 
        
            context = {
                'result': True,
            }
            return JsonResponse(context)

        except:
            # サーバに何かエラーが起きた場合
            context = {
                'result': False,
                'status': 2,
                'error': {}
            }
            return JsonResponse(context)
        
    else:
        # フォーマットエラーの場合
        context = {
            'result': False,
            'status': 1,
            'error': dict(task_data.errors.items())
        }

        return JsonResponse(context)

@require_http_methods(['POST'])
@login_required
def delete(request, ):
    '''
    タスクの削除処理

    postされてくるもの
    - taskid
    '''
    taskid=request.POST.get('taskid') ##Postでtaskidをもらう
    task = Task.objects.get(taskid=taskid)##もらったtaskidでtaskidを取得する。
    try:    
        
        with transaction.atomic():
            Task.objects.delete(task.taskid,)

        context = {
            'result': True,
        }
        return JsonResponse(context)

    except:
        # サーバに何かエラーが起きた場合
        context={
            'result': False,
            'status': 2,
            'error': {}
        }
        return JsonResponse(context)        


@require_http_methods(['POST'])
@login_required
def firstCheck(request):
    '''
    一次チェックをする。

    postされてくるもの
    - taskid
    - img
    - movie
    - description
    '''
    taskid = request.POST.get('taskid')

    task_data=firstCheckForm(data=request.POST, files=request.FILES)
    if task_data.is_valid():
        img = task_data.cleaned_data['img']
        movie = task_data.cleaned_data['movie']
        description = task_data.cleaned_data['description']

        try:    
            with transaction.atomic():
                Task.objects.insertFirstCheckData(taskid, img, movie, description)

            context = {
                'result': True,
            }

            return JsonResponse(context)
        except:
            # サーバに何かエラーが起きた場合
            context={
                'result': False,
                'status': 2,
                'error': {}
            }
            return JsonResponse(context) 

    else:
        # フォーマットエラーの場合
        error = dict(task_data.errors.items())
        context = {
            'result': False,
            'status': 1,
            'error': error,
        }

        return JsonResponse(context)

@require_http_methods(['POST'])
@login_required
def task_complete_one(request):
    '''
    依頼者がいないタスクを完了させる。

    postされてくるもの
    - taskid
    '''
    taskid = request.POST.get('taskid')

    try:
        with transaction.atomic():
            result = Task.objects.complete_one(taskid)
    
    except:
        context = {
            'result': False,
            'status': 2,
            'error': {}
        }

        return JsonResponse(context)

    if result:

        context = {
            'result': True,
        }

        return JsonResponse(context)

    else:
        context = {
            'result': False,
            'status': 1,
            'error': {}
        }

        return JsonResponse(context)


@require_http_methods(['POST'])
@login_required
def commission_complete(request):
    '''
    送られてきたuseridとtaskidに基づいて、チェックをする。

    postされてくるもの
    - taskid
    '''
    taskid = request.POST.get('taskid')

    try:
        with transaction.atomic():
            Commission.objects.complete(request.user, taskid)

        context = {
            'result': True,
        }

        return JsonResponse(context)

    except:
        context = {
            'result': False,
            'status': 2,
            'error': {}
        }

        return JsonResponse(context)

@require_http_methods(['POST'])
@login_required
def commission_list(request):
    '''
    userIdに基づいたチェックを依頼されたタスクを抽出し結果を返す。
    '''
    try:
        tasks = Commission.objects.listUserRequestedTask(request.user)
        json_tasks = json.loads(serializers.serialize("json", tasks))
        return_data = []
        for task in json_tasks:
            r_userid = task['fields']['userid']
            r_user = CustomUser.objects.get(userid=r_userid)
            if r_user.icon:
                iconpath = str(settings.MEDIA_URL) + str(r_user.icon)
            else:
                iconpath = '/static/common/images/default_icon.jpeg'
            user = {r_user.username: iconpath}

            imgpath = ''
            if task['fields']['img']:
                imgpath = str(settings.MEDIA_URL) + str(task['fields']['img'])

            moviepath = ''
            if task['fields']['movie']:
                moviepath = str(settings.MEDIA_URL) + str(task['fields']['movie'])

            return_data.append({
                'taskid': task['pk'],
                'user': user,
                'taskName': html.escape(task['fields']['taskName']),
                'deadline': task['fields']['deadline'],
                'importance': task['fields']['importance'],
                'status': task['fields']['status'],
                'img': imgpath,
                'movie': moviepath,
                'description': html.escape(task['fields']['description']),
            })

        context = {
            'result': True,
            'tasks': return_data
        }

        return JsonResponse(context)
    
    except:
        # サーバに何かエラーが起きた場合
        context = {
            'result': False,
            'status': 2,
            'error': {}
        }