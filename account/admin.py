from django.contrib import admin
from .models import CustomUser, UserActivateTokens
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


class UserAdmin(BaseUserAdmin):
    ordering = ('userid',)
    list_display = ('email', 'userid', 'is_active', 'password')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Information', {'fields': ('username',)}),
        (
            'Permissions',
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                )
            }
        ),
        ('Important dates', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
           'classes': ('wide',),
           'fields': ('email', 'password1', 'password2'),
        }),
    )


class UserActivateTokensAdmin(admin.ModelAdmin):
    list_display = ('token_id', 'user', 'activate_token', 'expired_at')



admin.site.register(CustomUser, UserAdmin)
admin.site.register(UserActivateTokens, UserActivateTokensAdmin)