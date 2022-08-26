# misc
from django.shortcuts import render
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
# class based
from django.views import View


# Create your views here.
class HomeView(View):
    def get(self, request):
        context = {}
        return render(request, 'home/index.html', context)


class RegisterView(View):
    def get(self, request):
        context = {}
        return render(request, 'home/register.html', context)                


class LoginView(View):
    def get(self, request):
        context = {}
        return render(request, 'home/login.html', context)                        


class LogoutView(View):
    def get(self, request):
        context = {}
        return redirect('home.main')