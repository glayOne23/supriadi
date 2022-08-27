# misc
from django.shortcuts import render
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.mixins import AccessMixin
# class based
from django.views import View
from main_frontend import services


class RegisterLoginAksesMixin(AccessMixin):    
    def dispatch(self, request, *args, **kwargs):                        
        if request.session.get('api_access_token'):
            return redirect('home.main')
        return super().dispatch(request, *args, **kwargs)        


# Create your views here.
class HomeView(View):
    def get(self, request):
        context = {}
        return render(request, 'home/index.html', context)


class RegisterView(RegisterLoginAksesMixin, View):
    def get(self, request):
        context = {'locations': []}
        hasil, locations = services.supriadi.get_no_auth(request, '/v1/locations')        
        if hasil:    
            context['locations'] = locations       
        return render(request, 'home/register.html', context)                

    def post(self, request):        
        data = {
            "username": request.POST.get('nama'),
            "password": request.POST.get('password'),
            "phone": request.POST.get('phone'),
            "location_id": int(request.POST.get('location_id')),
        }
        hasil, register = services.supriadi.post_no_auth(request, '/v1/auth/signup', data=data)        
        if hasil:            
            hasil, login = services.supriadi.post_no_auth(request, '/v1/auth/signin', data=data)                    
            request.session['api_access_token'] = login['access_token']
            messages.success(request, 'Selamat! Anda berhasil melakukan registrasi dan masuk laman dashboard')
            return redirect('dashboard.main')            
        return redirect('home.register')        


class LoginView(RegisterLoginAksesMixin, View):
    def get(self, request):
        context = {}        
        return render(request, 'home/login.html', context)                        

    def post(self, request):        
        data = {
            "username": request.POST.get('nama'),
            "password": request.POST.get('password')
        }
        hasil, user = services.supriadi.post_no_auth(request, '/v1/auth/signin', data=data)        
        if hasil:
            request.session['api_access_token'] = user['access_token']
            messages.success(request, 'Selamat! Anda berhasil masuk laman dashboard')
            return redirect('dashboard.main')            
        return redirect('home.login')


class LogoutView(View):
    def get(self, request):
        context = {}
        del request.session['api_access_token']
        return redirect('home.main')