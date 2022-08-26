# misc
from django.shortcuts import render
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
# class based
from django.views import View


# Create your views here.
class MainView(View):
    def get(self, request):
        context = {}
        return render(request, 'dashboard/layouts/base.html', context)