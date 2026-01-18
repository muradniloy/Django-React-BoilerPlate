from django.shortcuts import render
from rest_framework import generics, mixins, viewsets, views, status
from .serializer import *
from .models import *
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.decorators import action, api_view
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404


class ProductView(generics.GenericAPIView, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    queryset = Products.objects.all().order_by("-id")
    serializer_class = ProductSerializer
    lookup_field = "id"

    def get(self, request, id=None):
        if id:
            return self.retrieve(request)
        else:
            return self.list(request)
        
class CatergoryView(viewsets.ViewSet):
    def list(self, request):
        query = Category.objects.all().order_by("-id")
        serializers = CategorySerializer(query, many=True)
        return Response(serializers.data)
    
    def retrieve(self, request, pk=None):
        query = Category.objects.get(id=pk)
        serializers = CategorySerializer(query)
        serializers_data = serializers.data
        all_data = []
        CategoryProducts = Products.objects.filter(Category_id=serializers_data['id'])
        CategoryProducts_serializer = ProductSerializer(CategoryProducts, many=True)
        serializers_data["CategoryProducts"] = CategoryProducts_serializer.data
        all_data.append(serializers_data)
        return Response(all_data)

class ProfileView(views.APIView):
    authentication_classes=[TokenAuthentication, ]
    permission_classes=[IsAuthenticated, ]
    def get(self, request):
        try:
            query = Profile.objects.get(prouser=request.user)
            serializers = ProfileSerializer(query)
            response_msg = {"error": False, "data": serializers.data}
        except:
            response_msg = {"error": True, "message": "User is not authenticate !!"}
        
        return Response(response_msg)



class ProductViewSet(ModelViewSet):
    """
    /api/product/
    """
    queryset = Products.objects.all().order_by('-id')
    serializer_class = ProductsSerializer
    # ✅ settings.py pagination auto apply হবে


class CategoryViewSet(ModelViewSet):
    """
    /api/category/
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """
        /api/category/{id}/products/
        """
        products = Products.objects.filter(Category=pk).order_by('-id')


        paginator = PageNumberPagination()
        paginator.page_size = 9

        page = paginator.paginate_queryset(products, request)
        serializer = ProductsSerializer(page, many=True)
        category = Category.objects.get(id=pk)
        category_serializer = CategorySerializer(category)

        return paginator.get_paginated_response({
            "category": category_serializer.data,
            "results": serializer.data
        })



# ✅ CSRF free login API
@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenObtainPairView(TokenObtainPairView):
    pass

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class MyTokenView(TokenObtainPairView):
    authentication_classes = []   # 🔥 MOST IMPORTANT
    permission_classes = [AllowAny]




class ProfileAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = Profile.objects.get(prouser=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

class ProfileUpdateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        try:
            profile = Profile.objects.get(prouser=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)
        
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            # Return full profile after update
            full_serializer = ProfileSerializer(profile)
            return Response(full_serializer.data)
        return Response(serializer.errors, status=400)



@method_decorator(csrf_exempt, name='dispatch')
class SignUpView(generics.GenericAPIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")

        if not username or not email or not password:
            return Response({"detail": "All fields required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"detail": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"detail": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        # 1️⃣ Create User
        user = User.objects.create_user(username=username, email=email, 
                                        password=password, first_name=first_name,
                                        last_name=last_name)
        # 2️⃣ Create Profile at the same time
        Profile.objects.create(prouser=user)  # default empty bio

        return Response({"detail": "User & Profile created successfully"}, status=status.HTTP_201_CREATED)

class StudentListView(APIView):
    def get(self, request):
        students = StudentPersonal.objects.all().order_by("-id")
        serializer = StudentPersonalListSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ReligionListAPIView(APIView):
    def get(self, request):
        religions = Religion.objects.all()
        serializer = ReligionSerializer(religions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StudentDetailUpdateAPIView(APIView):
    def get(self, request, pk):
        try:
            student = StudentPersonal.objects.get(pk=pk)
            serializer = StudentPersonalSerializer(student)
            return Response(serializer.data)
        except StudentPersonal.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            student = StudentPersonal.objects.get(pk=pk)
        except StudentPersonal.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        # partial=True allows missing fields (e.g., old photo not sent)
        serializer = StudentPersonalSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DivisionViewSet(ModelViewSet):
    queryset = Division.objects.all().order_by('id')
    serializer_class = DivisionSerializer

class DistrictRetrieveUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    lookup_field = 'id'
    
class DistrictListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = DistrictSerializer

    def get_queryset(self):
        division_id = self.request.query_params.get('division')
        queryset = District.objects.select_related('division').all().order_by('division')
        if division_id:
            queryset = queryset.filter(division_id=division_id)
        return queryset
   
# views.py
class UpazillaListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = UpazillaSerializer

    def get_queryset(self):
        division_id = self.request.query_params.get('division')
        district_id = self.request.query_params.get('district')
        queryset = Upazilla.objects.select_related('district__division').all().order_by('district__division', 'district')
        if division_id:
            queryset = queryset.filter(district__division_id=division_id)
        if district_id:
            queryset = queryset.filter(district_id=district_id)
        return queryset

class UpazillaRetrieveUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Upazilla.objects.all()
    serializer_class = UpazillaSerializer
    lookup_field = 'id'

# from django.shortcuts import get_object_or_404
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
# from rest_framework import generics, status
# from rest_framework.response import Response
# from .models import StudentAddress, StudentPersonal

# @method_decorator(csrf_exempt, name='dispatch')
# class StudentAddressDetailCreateUpdate(generics.GenericAPIView):
#     serializer_class = StudentAddressSerializer

#     # ================== GET ==================
#     def get(self, request, student_id):
#         get_object_or_404(StudentPersonal, id=student_id)
#         try:
#             address = StudentAddress.objects.get(student_id=student_id)
#             serializer = self.serializer_class(address)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except StudentAddress.DoesNotExist:
#             return Response({"detail": "Address not found"}, status=status.HTTP_404_NOT_FOUND)

#     # ================== POST ==================
#     def post(self, request, student_id):
#         get_object_or_404(StudentPersonal, id=student_id)

#         if StudentAddress.objects.filter(student_id=student_id).exists():
#             return Response({"detail": "Address already exists"}, status=status.HTTP_400_BAD_REQUEST)

#         data = request.data.copy()
#         data["student"] = student_id

#         serializer = self.serializer_class(data=data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

#     # ================== PUT ==================
#     def put(self, request, student_id):
#         address = get_object_or_404(StudentAddress, student_id=student_id)
#         serializer = StudentAddressSerializer(address, data=request.data, partial=True)  # ✅ partial=True
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class StudentAddressDetailCreateUpdate(generics.GenericAPIView):
    serializer_class = StudentAddressSerializer

    def get_object(self, student_id):
        return StudentAddress.objects.filter(student_id=student_id).first()

    def get(self, request, student_id):
        obj = self.get_object(student_id)
        if obj:
            serializer = self.serializer_class(obj)
            return Response(serializer.data)
        return Response({"detail": "Address not found"}, status=404)

    def post(self, request, student_id):
        if StudentAddress.objects.filter(student_id=student_id).exists():
            return Response({"detail": "Address already exists"}, status=400)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # সরাসরি student_id পাস করুন
            serializer.save(student_id=student_id) 
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request, student_id):
        obj = self.get_object(student_id)
        if not obj:
            return Response({"detail": "Address not found"}, status=404)

        # এখানে data.copy() করার দরকার নেই
        serializer = self.serializer_class(obj, data=request.data, partial=True)
        
        if serializer.is_valid():
            # সেভ করার সময় student_id টি দিয়ে দিন যাতে রিলেশন ঠিক থাকে
            serializer.save(student_id=student_id)
            return Response(serializer.data)
        
        print("Put Errors:", serializer.errors)
        return Response(serializer.errors, status=400)
    

class EducationQualificationView(APIView):
    
    # নির্দিষ্ট স্টুডেন্টের সব এডুকেশন পাওয়ার জন্য
    def get(self, request, student_id):
        qualifications = EducationQualification.objects.filter(student_id=student_id)
        serializer = EducationQualificationSerializer(qualifications, many=True)
        return Response(serializer.data)

    # নতুন এডুকেশন অ্যাড করার জন্য
    def post(self, request):
        serializer = EducationQualificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # এডুকেশন আপডেট করার জন্য
    def put(self, request, pk):
        qualification = get_object_or_404(EducationQualification, pk=pk)
        serializer = EducationQualificationSerializer(qualification, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def bulk_update_education(request, student_id):
    # ১. ওই স্টুডেন্টের আগের সব এডুকেশন ডাটা ডিলিট করে দেওয়া (ক্লিন স্টার্ট)
    EducationQualification.objects.filter(student_id=student_id).delete()
    
    # ২. ফ্রন্টএন্ড থেকে পাঠানো লিস্টটি নেওয়া
    educations_data = request.data.get('educations', [])
    
    # ৩. ডাটা সেভ করা
    for edu in educations_data:
        # student_id অবজেক্ট হিসেবে সেট করা
        edu['student'] = student_id 
        serializer = EducationQualificationSerializer(data=edu)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=400)
            
    return Response({"message": "Successfully Updated!"}, status=200)