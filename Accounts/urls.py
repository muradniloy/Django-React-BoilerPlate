from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


# --- DRF Router ---
router = DefaultRouter()

router.register(r'account-transactions', AccountTransactionViewSet)
#accounting related

urlpatterns = [
    # --- Authentication & User ---
    
    # --- Router URLs ---
    path('', include(router.urls)),
]