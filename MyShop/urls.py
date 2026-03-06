from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from .tokenView import *

# --- DRF Router ---
router = DefaultRouter()
router.register(r'category', CatergoryView, basename='category')
router.register(r'products', ProductViewSet, basename='products')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'divisions', DivisionViewSet, basename='divisions')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'programs', ProgramViewSet, basename='programs')
router.register(r'sessions', SessionViewSet, basename='sessions')

#accounting related
router.register(r'main-heads', MainHeadViewSet)
router.register(r'payment-heads', PaymentHeadViewSet)
router.register(r'fee-rates', FeeRateViewSet, basename='feerate')
router.register(r'payment-contacts', PaymentContactViewSet, basename='payment-contact')
router.register(r'student-payments', StudentPaymentViewSet, basename='student-payment')
router.register(r'invoice-verify', InvoiceVerificationViewSet, basename='invoice-verify')
urlpatterns = [
    # --- Authentication & User ---
    path('token/', MyTokenView.as_view(), name='token'),
    path('token/refresh/', MyTokenRefreshView.as_view(), name='token_refresh'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/me/', UserInfoView.as_view(), name='user_me'),
    path('profile/', ProfileAPIView.as_view(), name='profile-get'),
    path('profile/update/', ProfileUpdateAPIView.as_view(), name='profile-update'),
    
    # --- Logs ---
    path('logs/', GlobalAuditLogView.as_view(), name='global_logs'),

    # --- Product APIs ---
    path('product/', ProductView.as_view(), name='product-list'),
    path('product/<int:id>/', ProductView.as_view(), name='product-detail'),

    # --- Student Personal Info ---
    path("allstudent/", StudentListView.as_view(), name="student-list"),
    path("religion/", ReligionListAPIView.as_view(), name="religion-list"),
    path("religion/<int:pk>/", ReligionListAPIView.as_view(), name="religion-detail"), # এটি যোগ করুন
    
    path('student/', StudentDetailUpdateAPIView.as_view(), name='student-create'), # POST এর জন্য
    path('student/<int:pk>/', StudentDetailUpdateAPIView.as_view(), name='student-detail'), # GET/PUT এর জন্য

    # স্টুডেন্ট সার্চ করার জন্য স্পেসিফিক ইউআরএল (যদি রাউটারে অটো না পায়)
    path('student-payments/search_students/', 
         StudentPaymentViewSet.as_view({'get': 'search_students'}), 
         name='student-search'),
    # --- Student Admission (ViewSet Mapping) ---
    path('student-admission/<int:student_id>/', 
         StudentAdmissionViewSet.as_view({
             'get': 'retrieve_by_student',
             'post': 'create_or_update_by_student',
             'put': 'update_by_student'
         }), name='student-admission-detail'),

    # --- Location APIs ---
    path('districts/', DistrictListCreateAPIView.as_view(), name='district-list-create'),
    path('districts/<int:id>/', DistrictRetrieveUpdateAPIView.as_view(), name='district-detail'),
    path('upazillas/', UpazillaListCreateAPIView.as_view(), name='upazilla-list-create'),
    path('upazillas/<int:id>/', UpazillaRetrieveUpdateAPIView.as_view(), name='upazilla-detail'),
    path("student_address/<int:student_id>/", StudentAddressDetailCreateUpdate.as_view(), name='student-address'),

    # ডাটা গেট (GET) এবং বাল্ক অ্যাড (POST) করার জন্য
    path('education/add/', EducationQualificationView.as_view(), name='edu-add'),
    
    # নির্দিষ্ট রেকর্ড আপডেট (PUT) বা ডিলিট করার জন্য
    path('education/update/<int:pk>/', EducationQualificationView.as_view(), name='edu-update'),

    path('boards/', board_list, name='board_list'),
    path('boards/<int:pk>/', board_detail, name='board_detail'), # এটি নতুন যোগ করুন
    path('education-suggestions/', education_suggestions, name='edu_suggestions'),

    # --- Router URLs ---
    path('', include(router.urls)),
]