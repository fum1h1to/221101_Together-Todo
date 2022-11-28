from django.urls import path
from . import views

urlpatterns = [
    path('todo/home/', views.Home.as_view(), name='home'),
    path('todo/other/', views.Other.as_view(), name='other'),
    path('todo/create/', views.create, name='todo_create'),
    path('todo/show/', views.show, name='todo_show'),
    path('todo/update/', views.update, name='todo_update'),
    path('todo/delete/', views.delete, name='todo_delete'),
    path('todo/firstCheck/', views.firstCheck, name='todo_first_check'),
    path('todo/complete/', views.task_complete_one, name='todo_complete'),

    path('request/list/', views.commission_list, name='request_list'),
    path('request/complete/', views.commission_complete, name='request_complete'),
]