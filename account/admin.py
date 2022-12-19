from django.contrib import admin
from .models import CustomUser, UserActivateTokens

admin.site.register(CustomUser)
admin.site.register(UserActivateTokens)