from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.Home.as_view(), name='home'),
    path('create_test/', views.test_create, name='create_test'),
    path('create/', views.create, name='todo_create'),
]