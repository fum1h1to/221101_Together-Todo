from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from todo.forms import TaskCreateForm
from .models import Task

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
    if request.POST.get('isBocchi') == 'on':
        isBocchi = True
    else:
        isBocchi = False
    requestUsers=request.POST.getlist('requestUsers') # useridを渡す

    
    task_data=TaskCreateForm(data=request.POST)

    if task_data.is_valid(): ##フォーマットをチェックする 
    
   ###タスクを作成する処理  無理ならエラーを返す。
   ##TaskManager()の関数名だけを書く。
        Task.objects.create(user, taskName,deadline,importance,note,isBocchi,requestUsers) ##TaskManager()のcreate()が呼び出される。
        
        context = {
            'result':True,
        }
        return JsonResponse(context)
        
    else:
        context = {
            'result':False,
            'error': dict(task_data.errors.items())
        }

        return JsonResponse(context)


        ##sudo 