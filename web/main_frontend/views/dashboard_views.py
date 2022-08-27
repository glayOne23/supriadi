# misc
from django.shortcuts import render
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.mixins import AccessMixin
from django.http import Http404, HttpResponseForbidden, HttpResponseRedirect
# class based
from django.views import View
from main_frontend import services


class DashboardAksesMixin(AccessMixin):    
    def dispatch(self, request, *args, **kwargs):                        
        if request.session.get('api_access_token'):
            return super().dispatch(request, *args, **kwargs)
        return redirect('home.main')

# Create your views here.
class MainView(DashboardAksesMixin, View):
    def get(self, request):
        context = {}
        hasil, data = services.supriadi.get(request, '/v1/suicidals', request.session.get('api_access_token'))                        
        if hasil:            
            context['analitics'] = data
            context['analitics_len'] = len(data)
        return render(request, 'dashboard/index.html', context)