from django import forms
from .models import Task



class TaskCreateForm(forms.ModelForm):


  ##userid以外の
    class Meta:
        model=Task
        fields=['taskName','deadline','importance','note','isBocchi']



class TaskUpdateForm(forms.ModelForm):


  ##userid以外の
    class Meta:
        model=Task
        fields=['taskName','deadline','importance','note',]



class firstCheckForm(forms.ModelForm):
  img = forms.ImageField(required=False)
  movie = forms.FileField(required=False)
  
  class Meta:
    model = Task
    fields=['img', 'movie', 'description']
