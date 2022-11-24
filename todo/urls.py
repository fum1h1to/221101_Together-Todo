from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.Home.as_view(), name='home'),
    path('create/', views.create, name='todo_create'),
    path('show/', views.show, name='todo_show'),
    path('update/', views.update, name='todo_update'),
    path('delete/', views.delete, name='todo_delete'),
    path('firstCheck/', views.firstCheck, name='todo_first_check'),

    # テスト用
    path('test_todolist/', views.test_todoListView.as_view(), name='test_todolist'),
    path('test_todolist/<str:taskid>/', views.test_update , name='test_update')
]