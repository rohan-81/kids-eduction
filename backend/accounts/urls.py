from django.urls import path
from .views import RegisterView, LoginView, UserMeView, LogoutView, SessionView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserMeView.as_view(), name='user-me'),
    path('session/', SessionView.as_view(), name='session'),
]

