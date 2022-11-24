from django import forms
from .models import Task



class TaskCreateForm(forms.ModelForm):


  ##userid以外の
    class Meta:
        model=Task
        fields=['taskName','deadline','importance','note','isBocchi']

class firstCheckForm(forms.ModelForm):
  
  class Meta:
    model = Task
    fields=['img', 'movie', 'description']