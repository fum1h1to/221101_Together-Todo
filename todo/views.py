from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.http import require_http_methods
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


@require_http_methods(['GET'])
@login_required
def test_create(request):
    form = TaskCreateForm()
    context = { 'form': form }
    return render(request, 'test/create_test.html', context)


@require_http_methods(['POST'])
@login_required
def create(request):
    user=request.user
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
        randomUsers = CustomUser.objects.choiceUserRandom(user, bocchi)
        requestUsers = []
        for user in randomUsers:
            requestUsers.append(user.username)
    else:
        bocchi_valid = False
    
    requestUser_valid = False
    if len(requestUsers) > 10:
        requestUser_valid = False
    
    task_data=TaskCreateForm(data=request.POST)

    if task_data.is_valid() and bocchi_valid and requestUser_valid: ##フォーマットをチェックする
    # if False:
    
        ###タスクを作成する処理  無理ならエラーを返す。
        Task.objects.create(user, taskName,deadline,importance,note,isBocchi,requestUsers) ##TaskManager()のcreate()が呼び出される。
        
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