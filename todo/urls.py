from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.Home.as_view(), name='home'),
    path('create/', views.create, name='todo_create'),
    path('show/', views.show, name='todo_show'),
]