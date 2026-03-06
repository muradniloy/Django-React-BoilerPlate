from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.password_validation import validate_password
from rest_framework.decorators import action, authentication_classes, permission_classes
from django.core.exceptions import ValidationError
from rest_framework import generics, mixins, viewsets, views, status, permissions, filters
from rest_framework.response import Response
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
import django_filters
from django_filters.rest_framework import DjangoFilterBackend # এটি ইনস্টল থাকতে হবে
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action, api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, MultiPartParser, FormParser, JSONParser
from rest_framework.authentication import SessionAuthentication
from itertools import chain
from operator import attrgetter

# --- Local Imports ---
from .serializer import *
from .models import *
from MyShop.authenticate import CustomAuthentication 

# সেন্ট্রাল অথেন্টিকেশন কনফিগ
COMMON_AUTH = [CustomAuthentication]

# ==========================
# 1. Product & Category Views
# ==========================

class ProductViewSet(ModelViewSet):
    queryset = Products.objects.all().order_by('-id')
    serializer_class = ProductsSerializer

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        products = Products.objects.filter(Category=pk).order_by('-id')
        paginator = PageNumberPagination()
        paginator.page_size = 9
        page = paginator.paginate_queryset(products, request)
        serializer = ProductsSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

class ProductView(generics.GenericAPIView, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    queryset = Products.objects.all().order_by("-id")
    serializer_class = ProductSerializer
    lookup_field = "id"

    def get(self, request, id=None):
        return self.retrieve(request) if id else self.list(request)

class CatergoryView(viewsets.ViewSet):
    def list(self, request):
        query = Category.objects.all().order_by("-id")
        return Response(CategorySerializer(query, many=True).data)
    
    def retrieve(self, request, pk=None):
        query = get_object_or_404(Category, id=pk)
        serializers_data = CategorySerializer(query).data
        prods = Products.objects.filter(Category_id=serializers_data['id'])
        serializers_data["CategoryProducts"] = ProductSerializer(prods, many=True).data
        return Response([serializers_data])

# ==========================
# 2. User & Profile Views
# ==========================

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all().order_by('-id') 
    serializer_class = ProfileSerializer
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]

class ProfileAPIView(APIView):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(Profile, prouser=request.user)
        return Response(ProfileSerializer(profile).data)

class ProfileUpdateAPIView(APIView):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        profile = get_object_or_404(Profile, prouser=request.user)
        profile._history_user = request.user 
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return Response(ProfileSerializer(updated).data)
        return Response(serializer.errors, status=400)

class UserInfoView(APIView):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

# ==========================
# 3. Student Personal & Address
# ==========================

# views.py ফাইলে এটি যোগ করুন


class StudentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'  # এটি থাকলে ?page_size=200 কাজ করবে
    max_page_size = 200

from django.db.models import Q, Exists, OuterRef
# আপনার প্রোজেক্টের সঠিক মডেল এবং সিরিয়ালাইজার ইম্পোর্ট নিশ্চিত করুন
# from .models import PaymentContact 

class StudentListView(generics.ListAPIView):
    serializer_class = StudentPersonalListSerializer
    pagination_class = StudentPagination

    def get_queryset(self):
        # রিলেশনশিপ ফিল্ড 'studentadmission'
        queryset = StudentPersonal.objects.all().order_by('-id')

        search_query = self.request.query_params.get('search', None)
        program_name = self.request.query_params.get('program', None)
        session_name = self.request.query_params.get('session', None)
        approved_status = self.request.query_params.get('approved', None)
        # নতুন পেমেন্ট স্ট্যাটাস ফিল্টার
        payment_status = self.request.query_params.get('payment_status', None)

        # ১. সার্চ লজিক
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) | 
                Q(last_name__icontains=search_query) |
                Q(studentadmission__student_id_no__icontains=search_query)
            )

        # ২. প্রোগ্রাম ফিল্টার
        if program_name:
            queryset = queryset.filter(studentadmission__Program_Name__Program_Name=program_name)

        # ৩. সেশন ফিল্টার
        if session_name:
            queryset = queryset.filter(studentadmission__Session__Session_Name=session_name)

        # ৪. অ্যাপ্রুভাল ফিল্টার
        if approved_status is not None and approved_status != "":
            is_approved = approved_status.lower() == 'true'
            queryset = queryset.filter(studentadmission__approved=is_approved)

        # ৫. পজিশন/পেমেন্ট স্ট্যাটাস ফিল্টার (নতুন যোগ করা হয়েছে)
        if payment_status:
            # PaymentContact মডেলে স্টুডেন্ট আছে কি নেই তা চেক করার জন্য সাবকুয়েরি
            from .models import PaymentContact # আপনার প্রোজেক্টের পাথ অনুযায়ী ইম্পোর্ট করুন
            payment_exists = PaymentContact.objects.filter(student=OuterRef('pk'))
            
            if payment_status.lower() == 'complete':
                # যাদের পেমেন্ট কন্টাক্ট ডাটা আছে
                queryset = queryset.annotate(has_payment=Exists(payment_exists)).filter(has_payment=True)
            elif payment_status.lower() == 'incomplete':
                # যাদের পেমেন্ট কন্টাক্ট ডাটা নেই
                queryset = queryset.annotate(has_payment=Exists(payment_exists)).filter(has_payment=False)

        return queryset
    
class StudentDetailUpdateAPIView(APIView):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        student = get_object_or_404(StudentPersonal, pk=pk)
        return Response(StudentPersonalSerializer(student).data)

    def post(self, request):
        serializer = StudentPersonalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request, pk):
        student = get_object_or_404(StudentPersonal, pk=pk)
        serializer = StudentPersonalSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class StudentAddressDetailCreateUpdate(generics.GenericAPIView):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]
    serializer_class = StudentAddressSerializer

    def get(self, request, student_id):
        address = StudentAddress.objects.filter(student_id=student_id).first()
        if not address: return Response({"detail": "Not found"}, status=404)
        return Response(self.get_serializer(address).data)

    def post(self, request, student_id):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student_id=student_id)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request, student_id):
        address = get_object_or_404(StudentAddress, student_id=student_id)
        serializer = self.get_serializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(student_id=student_id)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)



class StudentAdmissionViewSet(viewsets.ModelViewSet):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]
    queryset = StudentAdmission.objects.all()
    serializer_class = StudentAdmissionSerializer

    def retrieve_by_student(self, request, student_id=None):
        admission = get_object_or_404(StudentAdmission, student_id=student_id)
        return Response(self.get_serializer(admission).data)

    def create_or_update_by_student(self, request, student_id=None):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student_id=student_id)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update_by_student(self, request, student_id=None):
        admission = get_object_or_404(StudentAdmission, student_id=student_id)
        serializer = self.get_serializer(admission, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(student_id=student_id)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# ==========================
# 5. Settings & Audit Logs
# ==========================

class GlobalAuditLogView(APIView):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]

    def get(self, request):
        all_logs = sorted(
            chain(
                StudentPersonal.history.all(), StudentAddress.history.all(),
                EducationQualification.history.all(), StudentAdmission.history.all(),
                Division.history.all(), District.history.all(), Upazilla.history.all(),
                Profile.history.all(), PaymentHead.history.all(), MainHead.history.all(),
                FeeRate.history.all(), PaymentContact.history.all()

            ),
            key=attrgetter('history_date'), reverse=True
        )
        serializer = GlobalAuditLogSerializer(all_logs[:100], many=True)
        return Response(serializer.data)
    
class DivisionViewSet(ModelViewSet):
    authentication_classes = [CustomAuthentication] 
    permission_classes = [IsAuthenticated]
    queryset = Division.objects.all().order_by('id')
    serializer_class = DivisionSerializer

class DistrictListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]
    serializer_class = DistrictSerializer
    def get_queryset(self):
        div_id = self.request.query_params.get('division')
        return District.objects.filter(division_id=div_id) if div_id else District.objects.all()

class UpazillaListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]
    serializer_class = UpazillaSerializer
    def get_queryset(self):
        dis_id = self.request.query_params.get('district')
        return Upazilla.objects.filter(district_id=dis_id) if dis_id else Upazilla.objects.all()

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET', 'POST'])
def board_list(request):
    if request.method == 'GET':
        boards = EducationBoard.objects.all().order_by('id')
        serializer = EducationBoardSerializer(boards, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = EducationBoardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def board_detail(request, pk):
    board = get_object_or_404(EducationBoard, pk=pk)
    
    if request.method == 'GET':
        serializer = EducationBoardSerializer(board)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = EducationBoardSerializer(board, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        board.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
def education_suggestions(request):
    # React থেকে query এবং type নামে ডাটা আসবে
    q = request.GET.get('query', '') 
    field = request.GET.get('type', '')
    
    if len(q) < 4: 
        return JsonResponse([], safe=False)
    
    # ডাইনামিক ফিল্টার
    results = EducationQualification.objects.filter(**{f"{field}__icontains": q}).values_list(field, flat=True).distinct()[:10]
    
    return JsonResponse(list(results), safe=False)

# ==========================
# 6. Program & Session Views
# ==========================

# views.py ফাইলে পরিবর্তন করুন
class ProgramViewSet(viewsets.ModelViewSet): # ReadOnlyModelViewSet পরিবর্তন করে ModelViewSet দিন
    """
    প্রোগ্রাম লিস্ট, অ্যাড, আপডেট এবং ডিলিট করার জন্য।
    """
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]
    queryset = Program.objects.all().order_by('Program_Name')
    serializer_class = ProgramSerializer

class SessionViewSet(viewsets.ModelViewSet):
    authentication_classes = COMMON_AUTH
    permission_classes = [IsAuthenticated]
    serializer_class = SessionSerializer

    def get_queryset(self):
        return Session.objects.all().order_by('-id')



@method_decorator(csrf_exempt, name='dispatch')
class SignUpView(generics.GenericAPIView):
    # সাইনআপ সাধারণত পাবলিক থাকে, তাই এখানে পারমিশন খালি রাখা হয়েছে
    permission_classes = [permissions.AllowAny] 

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")

        # ১. ডাটা ভ্যালিডেশন
        if not username or not email or not password:
            return Response({"detail": "সবগুলো ফিল্ড পূরণ করা বাধ্যতামূলক।"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"detail": "এই ইউজারনেমটি ইতিমধ্যে ব্যবহার করা হয়েছে।"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"detail": "এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে।"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # ২. পাসওয়ার্ড ভ্যালিডেশন (Django Default)
            validate_password(password)
            
            # ৩. ইউজার তৈরি করা
            user = User.objects.create_user(
                username=username, 
                email=email, 
                password=password, 
                first_name=first_name,
                last_name=last_name
            )
            
            # ৪. ইউজারের জন্য প্রোফাইল তৈরি করা
            Profile.objects.create(prouser=user)

            return Response({
                "detail": "অ্যাকাউন্ট এবং প্রোফাইল সফলভাবে তৈরি হয়েছে!",
                "username": user.username
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.shortcuts import get_object_or_404

class ReligionListAPIView(APIView):
    authentication_classes = [CustomAuthentication] 
    permission_classes = [IsAuthenticated]

    # ডাটা পাওয়ার জন্য (লিস্ট এবং সিঙ্গেল অবজেক্ট উভয়ই)
    def get(self, request, pk=None):
        if pk:
            religion = get_object_or_404(Religion, pk=pk)
            serializer = ReligionSerializer(religion)
            return Response(serializer.data)
        
        religions = Religion.objects.all().order_by('id')
        serializer = ReligionSerializer(religions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # নতুন ডাটা সেভ করার জন্য (POST)
    def post(self, request):
        serializer = ReligionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ডাটা আপডেট করার জন্য (PUT)
    def put(self, request, pk):
        religion = get_object_or_404(Religion, pk=pk)
        serializer = ReligionSerializer(religion, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ডাটা ডিলিট করার জন্য (DELETE)
    def delete(self, request, pk):
        religion = get_object_or_404(Religion, pk=pk)
        religion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
            
class DistrictRetrieveUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    # ✅ কুকি-বেজড অথেন্টিকেশন এবং লগইন করা ইউজার নিশ্চিত করা
    authentication_classes = [CustomAuthentication]
    permission_classes = [IsAuthenticated]
    
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    lookup_field = 'id'  # URL এ আমরা <int:id> ব্যবহার করছি তাই এখানে 'id' হবে

    def perform_update(self, serializer):
        # [Saved Instruction] simple-history ইউজার ট্র্যাকিং
        serializer.save(_history_user=self.request.user)

class UpazillaRetrieveUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    # ✅ কুকি-বেজড অথেন্টিকেশন নিশ্চিত করা
    authentication_classes = [CustomAuthentication]
    permission_classes = [IsAuthenticated]
    
    queryset = Upazilla.objects.all()
    serializer_class = UpazillaSerializer
    lookup_field = 'id'

    def perform_update(self, serializer):
        # simple-history এর মাধ্যমে কোন ইউজার আপডেট করেছে তা রেকর্ড করা
        serializer.save(_history_user=self.request.user)

class MainHeadViewSet(viewsets.ModelViewSet):
    queryset = MainHead.objects.all().order_by('-id')
    serializer_class = MainHeadSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['main_head_code', 'main_head_name']

class PaymentHeadViewSet(viewsets.ModelViewSet):
    queryset = PaymentHead.objects.all()
    serializer_class = PaymentHeadSerializer
    pagination_class = None  # এটি pagination ডিজেবল করবে যাতে সব ডাটা পাওয়া যায়
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = {
        'headType': ['exact'],
        'payment_category__main_head_name': ['exact', 'icontains'],
    }
    
    search_fields = ['head_name', 'head_code', 'payment_category__main_head_name']
    ordering_fields = ['head_code', 'head_name', 'payment_category__main_head_name', 'headType']
    ordering = ['head_code']

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        # কুকিগুলো মুছে ফেলার জন্য ডিলিট কমান্ড পাঠান
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        # যদি সেশন থাকে সেটিও ডিলিট করুন
        response.delete_cookie('csrftoken')
        return response


# কাস্টম ফিল্টার ক্লাস
class FeeRateFilter(django_filters.FilterSet):
    # payment_head এর মাধ্যমে category নাম ফিল্টার করা হচ্ছে
    category = django_filters.CharFilter(
        field_name="payment_head__payment_category__main_head_name", 
        lookup_expr='icontains'
    )

    class Meta:
        model = FeeRate
        fields = ['category']

class FeeRateViewSet(viewsets.ModelViewSet):
    queryset = FeeRate.objects.all().order_by('-id')
    serializer_class = FeeRateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_class = FeeRateFilter
    
    # সার্চের জন্য রিলেশন পাথ ঠিক করা হলো
    search_fields = [
        'payment_head__head_name', 
        'payment_head__payment_category__main_head_name'
    ]
    
    # সর্টিং এর জন্য পাথ
    ordering_fields = [
        'id', 
        'amount', 
        'payment_head__head_name', 
        'payment_head__payment_category__main_head_name'
    ]



class PaymentContactViewSet(viewsets.ModelViewSet):
    queryset = PaymentContact.objects.all()
    serializer_class = PaymentContactSerializer

    # ১. ডাটা সেভ করার জন্য (Bulk Save)
    @action(detail=False, methods=['post'])
    def bulk_save(self, request):
        student_id = request.data.get('student_id')
        contacts_data = request.data.get('contacts', [])

        if not student_id:
            return Response({"detail": "Student ID missing"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                PaymentContact.objects.filter(student_id=student_id).delete()
                for item in contacts_data:
                    PaymentContact.objects.create(
                        student_id=student_id,
                        fees_id=int(item.get('fees')),
                        contact_date=item.get('contact_date'),
                        paymentType=item.get('paymentType', '1'),
                        quantity=int(item.get('quantity', 1)),
                        discount_type=item.get('discount_type', '1'),
                        discount_value=float(item.get('discount_value', 0)),
                        original_amount=float(item.get('baseAmount', 0)) if item.get('baseAmount') else None
                    )
            return Response({"message": "Successfully updated"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # ২. ডাটা রিঅ্যাক্ট পেজে দেখানোর জন্য
    @action(detail=False, methods=['get'], url_path='by-student/(?P<student_id>[^/.]+)')
    def by_student(self, request, student_id=None):
        contacts = PaymentContact.objects.filter(student_id=student_id)
        serializer = self.get_serializer(contacts, many=True)
        return Response(serializer.data)

    # ৩. নতুন যুক্ত করা অ্যাকশন: পেমেন্টের সময় কন্টাক্ট অ্যামাউন্ট আপডেট করার জন্য
    @action(detail=False, methods=['patch'], url_path='update-amount')
    def update_amount(self, request):
        student_id = request.data.get('student')
        fee_id = request.data.get('fees')
        new_amount = request.data.get('amount')

        if not all([student_id, fee_id, new_amount]):
            return Response({"detail": "Missing data (student, fees, or amount)"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # নির্দিষ্ট স্টুডেন্ট এবং ফি হেডের কন্টাক্ট খুঁজে বের করা
            contact = PaymentContact.objects.filter(student_id=student_id, fees_id=fee_id).first()
            
            if contact:
                contact.amount = float(new_amount)
                contact.save() # এটি সেভ করলে আপনার মডেলের বাকি ক্যালকুলেশন কাজ করবে
                return Response({"message": "Contract amount updated successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Contract not found"}, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# CSRF স্কিপ করার জন্য (যেহেতু COMMON_AUTH এ সেশন থাকতে পারে)
class UnsafeSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request): return None

class EducationQualificationView(APIView):
    # তোমার আগের COMMON_AUTH এর সাথে CSRF-মুক্ত সেশন যোগ করা হলো
    authentication_classes = [UnsafeSessionAuthentication] + [CustomAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get(self, request):
        student_id = request.query_params.get('student_id')
        if student_id:
            qs = EducationQualification.objects.filter(student_id=student_id)
            serializer = EducationQualificationSerializer(qs, many=True, context={'request': request})
            return Response(serializer.data)
        return Response([])

    def post(self, request):
        """ বাল্ক ডাটা সেভ করার জন্য """
        # যদি ডাটা লিস্ট আকারে আসে (Bulk)
        data_list = request.data if isinstance(request.data, list) else [request.data]
        saved_data = []

        for item in data_list:
            # আইডি থাকলে আপডেট, না থাকলে ক্রিয়েট
            edu_id = item.get('id')
            if edu_id:
                instance = get_object_or_404(EducationQualification, pk=edu_id)
                serializer = EducationQualificationSerializer(instance, data=item, partial=True)
            else:
                serializer = EducationQualificationSerializer(data=item)
            
            if serializer.is_valid():
                serializer.save()
                saved_data.append(serializer.data)
            else:
                return Response(serializer.errors, status=400)
        
        return Response(saved_data, status=201)

    def put(self, request, pk):
        """ একক রেকর্ড আপডেটের জন্য """
        instance = get_object_or_404(EducationQualification, pk=pk)
        serializer = EducationQualificationSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class StudentPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentPaymentSerializer
    filter_backends = [filters.SearchFilter]
    
    search_fields = [
        'invoice_no', 
        'student__first_name', 
        'student__last_name', 
        'student__mobile',
        'student__studentadmission__student_id_no'
    ]

    def get_queryset(self):
        # মডেল অনুযায়ী সঠিক রিলেশন পাথ: 
        # fees (FeeRate) -> payment_head (PaymentHead) -> payment_category (MainHead)
        queryset = StudentPayment.objects.select_related(
            'student', 
            'fees', 
            'fees__payment_head', 
            'fees__payment_head__payment_category'
        ).all()
        
        # ইউআরএল প্যারামিটার থেকে ফিল্টার ভ্যালু নেওয়া
        params = self.request.query_params
        start_date = params.get('start_date')
        end_date = params.get('end_date')
        category_name = params.get('category_name') # MainHead name
        fees_id = params.get('fees_id')             # FeeRate ID
        student_id = params.get('student')

        # ১. ডেট রেঞ্জ ফিল্টার
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        
        # ২. স্টুডেন্ট আইডি ফিল্টার
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # ৩. ক্যাটাগরি ফিল্টার (সঠিক পাথ অনুযায়ী)
        if category_name:
            queryset = queryset.filter(
                fees__payment_head__payment_category__main_head_name=category_name
            )

        # ৪. স্পেসিফিক ফি হেড (FeeRate) ফিল্টার
        if fees_id:
            queryset = queryset.filter(fees_id=fees_id)

        # ৫. ডিসেন্ডিং সর্টিং (নতুন আইডি সবার আগে আসবে)
        # distinct() ব্যবহার করা হয়েছে যাতে একই ইনভয়েসের মাল্টিপল এন্ট্রি ডুপ্লিকেট রো তৈরি না করে
        return queryset.order_by('-id').distinct()
    @action(detail=False, methods=['get'])
    def search_students(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])

        students = StudentPersonal.objects.filter(
            Q(first_name__icontains=query) | 
            Q(studentadmission__student_id_no__icontains=query) |
            Q(mobile__icontains=query)
        ).distinct()[:10]

        results = []
        for s in students:
            admission = s.studentadmission_set.first()
            
            # Program/Course ফিল্ডটি খুঁজে বের করা
            program_name = 'N/A'
            if admission:
                # যদি ফিল্ডের নাম 'program' না হয়ে অন্য কিছু হয় (যেমন 'course'), সেটি চেক করুন
                # নিচের লাইনটি Safe Navigation ব্যবহার করছে
                if hasattr(admission, 'program') and admission.program:
                    program_name = admission.program.name if hasattr(admission.program, 'name') else str(admission.program)
                elif hasattr(admission, 'course') and admission.course:
                    program_name = admission.course.name if hasattr(admission.course, 'name') else str(admission.course)
                elif hasattr(admission, 'class_name') and admission.class_name:
                    program_name = str(admission.class_name)

            results.append({
                'id': s.id,
                'value': s.id,
                'label': f"{s.first_name} (#{admission.student_id_no if admission else 'N/A'})",
                'first_name': s.first_name,
                'student_id_no': admission.student_id_no if admission else 'N/A',
                'mobile': s.mobile,
                'photo': s.photo.url if s.photo else None,
                'program': program_name  # এখন আর এরর আসবে না
            })
        return Response(results)

@authentication_classes([]) 
@permission_classes([permissions.AllowAny])
class InvoiceVerificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StudentPayment.objects.all()
    serializer_class = StudentPaymentSerializer
   
    authentication_classes = [] 
    permission_classes = [permissions.AllowAny]

    @action(
        detail=False, 
        methods=['get'], 
        url_path='verify/(?P<student_id>[^/.]+)/(?P<invoice_no>[^/.]+)',
        authentication_classes=[], # অ্যাকশনের ভেতর আবার নিশ্চিত করা
        permission_classes=[permissions.AllowAny]
    )
    def verify_invoice(self, request, student_id=None, invoice_no=None):
        try:
            # select_related ব্যবহার করা হয়েছে যাতে ৩টি টেবিল থেকে ডাটা একসাথে আসে
            payments = StudentPayment.objects.filter(
                student_id=student_id, 
                invoice_no=invoice_no
            ).select_related('fees__payment_head__payment_category', 'student').order_by('id')

            if not payments.exists():
                return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)

            student = payments[0].student
            payment_list = []
            total_fee_calc = 0.0

            for p in payments:
                # মেইন ফি ক্যালকুলেশন: FeeRate এর অরিজিনাল অ্যামাউন্ট
                m_fee = float(p.fees.amount if p.fees else 0)
                total_fee_calc += m_fee
                
                # রিলেশনশিপ থেকে নাম বের করা
                # p.fees (FeeRate) -> payment_head (PaymentHead) -> head_name
                h_name = p.fees.payment_head.head_name if p.fees and p.fees.payment_head else "Fees"
                
                # p.fees -> payment_head -> payment_category (MainHead) -> main_head_name
                c_name = "General"
                if p.fees and p.fees.payment_head and p.fees.payment_head.payment_category:
                    c_name = p.fees.payment_head.payment_category.main_head_name

                payment_list.append({
                    "category_name": c_name,
                    "head_name": h_name,
                    "mainFeeAmount": round(m_fee, 2),
                    "old_due": float(p.old_due or 0),
                    "discount_value": float(p.discount_value or 0),
                    "amount": float(p.amount or 0),
                    "new_due": float(p.new_due or 0),
                    "payment_date": p.payment_date,
                })

            total_paid = sum(item['amount'] for item in payment_list)
            total_due = payment_list[-1]['new_due']

            return Response({
                "student": StudentPersonalSerializer(student).data if student else {},
                "payments": payment_list,
                "summary": {
                    "total_fee": round(total_fee_calc, 2),
                    "total_paid": round(total_paid, 2),
                    "total_due": round(total_due, 2)
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc() 
            return Response({"error": f"Server Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)