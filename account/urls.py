from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.TopView.as_view(), name='top'),
]