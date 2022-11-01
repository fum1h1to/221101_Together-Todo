from django.views.generic import TemplateView

app_name = 'account'

class TopView(TemplateView):
    template_name = 'account/top.html'