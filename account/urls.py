from django.urls import path, include
from . import views




 

 

urlpatterns = [
    path('', views.TopView.as_view(), name='top'),
    
    path('login/', views.LoginView.as_view(), name='login'),

   
   
    path('logout/', views.Logout.as_view(), name='logout'),
    
    path('login_success/', views.Login_success.as_view(), name='login_success'),
    
    path('signup/', views.SignupView.as_view(), name='signup'),
   
   
    path('not_activate', views.NotActivateView.as_view(), name='not_activate'),
    path('activate_success/', views.ActivateSuccessView.as_view(), name='activate_success'),
    path('activate_failed/', views.ActivateFailedView.as_view(), name='activate_failed'),
    path('user/<uuid:activate_token>/activation/', views.activate_user),


]