"""main_frontend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from main_frontend.views import home_views
from main_frontend.views import dashboard_views


urlpatterns = [
    # path('admin/', admin.site.urls),
    path('', home_views.HomeView.as_view(), name='home.main'),
    path('register/', home_views.RegisterView.as_view(), name='home.register'),
    path('login/', home_views.LoginView.as_view(), name='home.login'),
    path('logout/', home_views.LogoutView.as_view(), name='home.logout'),
    path('dashboard/', dashboard_views.MainView.as_view(), name='dashboard.main'),
]
