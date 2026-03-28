from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import *
from .serializers import *
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny # যদি পারমিশন লাগে
import random
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import requests # এটি আগে ইনস্টল করেছেন
from django.core.mail import send_mail
from django.conf import settings
from MyShop.models import StudentPersonal, EmployeeProfile, StudentAdmission



class NoticeCategoryViewSet(viewsets.ModelViewSet):
    queryset = NoticeCategory.objects.all()
    serializer_class = NoticeCategorySerializer

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by('-published_date')
    serializer_class = NoticeSerializer


class AdmissionQueryListCreate(generics.ListCreateAPIView):
    queryset = AdmissionQuery.objects.all().order_by('-created_at')
    serializer_class = AdmissionQuerySerializer
    
    # ওয়েবসাইট থেকে যে কেউ কোয়েরি করতে পারবে, তাই AllowAny
    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]

# গেট (List) এবং পোস্ট (Create) এর জন্য
class ImportantLinkListCreate(generics.ListCreateAPIView):
    queryset = ImportantLink.objects.all().order_by('priority') # প্রায়োরিটি অনুযায়ী সাজানো
    serializer_class = ImportantLinkSerializer

# রিট্রিভ, আপডেট এবং ডিলিট এর জন্য
class ImportantLinkRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = ImportantLink.objects.all()
    serializer_class = ImportantLinkSerializer

class HomeSliderViewSet(viewsets.ModelViewSet):
    # শুধুমাত্র একটিভ স্লাইডারগুলো সিরিয়াল অনুযায়ী ফিল্টার করবে
    queryset = HomeSlider.objects.filter(active=True).order_by('order')
    serializer_class = HomeSliderSerializer
    permission_classes = [AllowAny]

class SliderPositionViewSet(viewsets.ModelViewSet):
    queryset = SliderPosition.objects.all()
    serializer_class = SliderPositionSerializer
    # যদি সবার জন্য উন্মুক্ত রাখতে চান তবে permission_classes বদলাতে পারেন



class SendOTPView(APIView):
    def post(self, request):
        mobile = request.data.get('mobile')
        email = request.data.get('email')
        method = request.data.get('method') # 'sms' অথবা 'email'
        
        otp = str(random.randint(100000, 999999))
        OTPStorage.objects.update_or_create(mobile=mobile, defaults={'otp': otp})

        if method == 'sms':
            # SMS.net.bd Logic
            payload = {'api_key': 'YOUR_KEY', 'msg': f"Your OTP is {otp}", 'to': mobile}
            requests.post("https://api.sms.net.bd/sendsms", data=payload)
            return Response({"success": "OTP sent via SMS!"})

        elif method == 'email':
            # Email Logic
            send_mail(
                'Registration OTP',
                f'Your OTP is {otp}',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return Response({"success": "OTP sent via Email!"})

        return Response({"error": "Invalid method"}, status=400)



@method_decorator(csrf_exempt, name='dispatch')
class VerifyIDView(APIView):
    def post(self, request):
        role = request.data.get('role')  # 'student' অথবা 'employee'
        unique_id = request.data.get('unique_id')

        profile = None

        if role == 'student':
            # StudentAdmission টেবিল থেকে student_id_no দিয়ে সার্চ করা হচ্ছে
            admission = StudentAdmission.objects.filter(student_id_no=unique_id).select_related('student').first()
            if admission:
                profile = admission.student # রিলেটেড StudentPersonal অবজেক্টটি নেওয়া হলো
                
        elif role == 'employee':
            # Employee-এর ক্ষেত্রে যদি আলাদা টেবিল থাকে
            profile = EmployeeProfile.objects.filter(employee_id=unique_id).first()
            
        else:
            return Response({"error": "Invalid role selected"}, status=status.HTTP_400_BAD_REQUEST)

        # ১. প্রোফাইল না পাওয়া গেলে
        if not profile:
            return Response({"error": "This ID does not exist!"}, status=status.HTTP_404_NOT_FOUND)

        # ২. আইডি যদি ইতিমধ্যে কোনো User অ্যাকাউন্টের সাথে লিঙ্ক করা থাকে
        if profile.user:
            return Response({"error": "This ID is already registered!"}, status=status.HTTP_400_BAD_REQUEST)

        # ৩. সব ঠিক থাকলে ডাটা রিটার্ন
        return Response({
            "name": f"{profile.first_name} {profile.last_name}",
            "mobile": profile.mobile,
            "email": profile.email,
        })
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]
    # Registration logic-এর ভেতরে (Register APIView-তে)
    def post(self, request):
        unique_id = request.data.get('unique_id')
        role = request.data.get('role')
        
        if role == 'employee':
            # ১. প্রোফাইল খুঁজে বের করা
            profile = EmployeeProfile.objects.get(employee_id=unique_id)
            
            # ২. প্রোফাইলের ডাটা দিয়ে ইউজার তৈরি
            user = User.objects.create_user(
                username=request.data.get('username'), # ইউজার যেটা ইনপুট দিবে
                email=profile.email,                   # প্রোফাইল থেকে অটো সেট হবে
                first_name=profile.first_name,         # প্রোফাইল থেকে অটো সেট হবে
                last_name=profile.last_name,           # প্রোফাইল থেকে অটো সেট হবে
                password=request.data.get('password')
            )
            
            # ৩. প্রোফাইলের সাথে ইউজারকে লিঙ্ক করা
            profile.user = user
            profile.save()
            
            return Response({"success": "Account created and linked with profile!"})



class VerifyOTPView(APIView):
    def post(self, request):
        mobile = request.data.get('mobile')
        user_otp = request.data.get('otp')

        if not mobile or not user_otp:
            return Response({"error": "Mobile number and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        # ডাটাবেজ থেকে ওই মোবাইল নম্বরের সর্বশেষ ওটিপি খুঁজে বের করা
        record = OTPStorage.objects.filter(mobile=mobile, otp=user_otp).first()

        if record:
            if record.is_valid():
                # ভেরিফিকেশন সফল হলে ওটিপি রেকর্ডটি মুছে ফেলা (সিকিউরিটির জন্য)
                record.delete() 
                return Response({"success": True, "message": "OTP Verified Successfully!"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "OTP has expired! Please resend."}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"error": "Invalid OTP! Please try again."}, status=status.HTTP_400_BAD_REQUEST)