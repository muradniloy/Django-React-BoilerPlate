from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'notices', NoticeViewSet)
router.register(r'notice-categories', NoticeCategoryViewSet)
router.register(r'home-sliders', HomeSliderViewSet, basename='home-sliders')
router.register(r'slider-positions', SliderPositionViewSet)


urlpatterns = [
    path('important-links/', ImportantLinkListCreate.as_view(), name='link-list-create'),
    
    # নির্দিষ্ট একটি লিঙ্ক এডিট, ডিলিট বা ডিটেইলস দেখার জন্য
    path('important-links/<int:pk>/', ImportantLinkRetrieveUpdateDestroy.as_view(), name='link-detail'),
    path('admission-queries/', AdmissionQueryListCreate.as_view(), name='admission_query_api'),
    path('verify-id/', VerifyIDView.as_view(), name='verify_id'),
    
    # ওটিপি পাঠানো (SMS/Email)
    path('send-otp/', SendOTPView.as_view(), name='send_otp'),
    
    # ওটিপি ভেরিফাই করা
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    
    # ফাইনাল রেজিস্ট্রেশন সাবমিট
    path('register/', RegisterView.as_view(), name='register'),
    path('password-reset-check/', PasswordResetCheckView.as_view(), name='reset_check'),
    path('complete-password-reset/', CompletePasswordResetView.as_view(), name='complete_reset'),
    path('send-reset-otp/', SendPasswordResetOTPView.as_view(), name='send_reset_otp'),
    path('verify-reset-otp/', VerifyResetOTPView.as_view(), name='verify_reset_otp'),
# OTP er jonno tomar purono send-otp api tai use koro, shudhu reset page theke call korbe.
    path('', include(router.urls)),
]