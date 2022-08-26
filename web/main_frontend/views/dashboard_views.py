# misc
from django.shortcuts import render
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.mixins import AccessMixin
from django.http import Http404, HttpResponseForbidden, HttpResponseRedirect
# class based
from django.views import View


class DashboardAksesMixin(AccessMixin):
    """ Class Mixin untuk memfilter hak akses mata kuliah
    """     
    def dispatch(self, request, *args, **kwargs):                
        # if str(request.session.get('auth_user')):         
        if 10 == 10:                     
            return super().dispatch(request, *args, **kwargs)        
        return HttpResponseForbidden()

# Create your views here.
class MainView(DashboardAksesMixin, View):
    def get(self, request):
        context = {}
        return render(request, 'dashboard/index.html', context)