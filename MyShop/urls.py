from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import * 

# DRF Router
router = DefaultRouter()
router.register(r'category', CatergoryView, basename='category')
router.register(r'products', ProductViewSet, basename='products')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'divisions', DivisionViewSet)

urlpatterns = [
    # JWT Auth
    path('token/', MyTokenView.as_view(), name='token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('signup/', SignUpView.as_view(), name='signup'),

    # Normal A'PIs
    path('product/', ProductView.as_view(), name='product'),
    path('product/<int:id>/', ProductView.as_view(), name='product-detail'),
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateAPIView.as_view(), name='profile-update'),
    path("allstudent/", StudentListView.as_view(), name="student-list"),
    path("religion/", ReligionListAPIView.as_view()),
    path('student/<int:pk>/', StudentDetailUpdateAPIView.as_view(), name='student-detail-update'),
    path('districts/', DistrictListCreateAPIView.as_view(), name='district-list-create'),
    path('districts/<int:id>/', DistrictRetrieveUpdateAPIView.as_view(), name='district-detail'),

    # Upazilla (district wise)
    path('upazillas/', UpazillaListCreateAPIView.as_view(), name='upazilla-list-create'),
    path('upazillas/<int:id>/', UpazillaRetrieveUpdateAPIView.as_view(), name='upazilla-detail'),
    path("student_address/<int:student_id>/", StudentAddressDetailCreateUpdate.as_view()),

    path('education/student/<int:student_id>/', EducationQualificationView.as_view()),
    # নতুন তৈরির জন্য
    path('education/add/', EducationQualificationView.as_view()),
    # আপডেটের জন্য
    path('education/update/<int:pk>/', EducationQualificationView.as_view()),




    # Router URLs
    path('', include(router.urls)),
]
