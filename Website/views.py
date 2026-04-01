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
from rest_framework import permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import requests # এটি আগে ইনস্টল করেছেন
from django.core.mail import send_mail
from django.conf import settings
from MyShop.models import StudentPersonal, EmployeeProfile, StudentAdmission, Profile
from django.db.models import Q  # এটি অবশ্যই ইমপোর্ট করতে হবে
from django.contrib.auth.models import User, Group
from rest_framework.decorators import api_view
from .utils import send_sms_gate

class PasswordResetCheckView(APIView):
    authentication_classes = [] 
    permission_classes = [permissions.AllowAny] 

    def post(self, request):
        role = request.data.get('role')
        unique_id = request.data.get('unique_id')
        mobile = request.data.get('mobile')

        if not all([role, unique_id, mobile]):
            return Response({"error": "সবগুলো ঘর পূরণ করুন!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member_data = None
            
            # Employee চেক
            if role == 'employee':
                member = EmployeeProfile.objects.filter(
                    employee_id=unique_id, 
                    mobile=mobile,
                    active=True 
                ).first()
                if member:
                    # চেক করছি ইউজার অ্যাকাউন্ট আছে কি না
                    if member.user:
                        member_data = {
                            "name": f"{member.first_name} {member.last_name}",
                            "email": member.user.email
                        }
                    else:
                        return Response({"error": "এই আইডির বিপরীতে কোনো অ্যাকাউন্ট খোলা হয়নি!"}, status=status.HTTP_404_NOT_FOUND)
                else:
                    return Response({"error": "এমপ্লয়ি রেকর্ড পাওয়া যায়নি!"}, status=status.HTTP_404_NOT_FOUND)

            # Student চেক
            elif role == 'student':
                admission = StudentAdmission.objects.filter(
                    student_id_no=unique_id, 
                    student__mobile=mobile,
                    student__active=True
                ).select_related('student').first()

                if admission:
                    student = admission.student
                    if student.user:
                        member_data = {
                            "name": f"{student.first_name} {student.last_name}",
                            "email": student.user.email
                        }
                    else:
                        return Response({"error": "এই ছাত্রের কোনো অ্যাকাউন্ট নেই!"}, status=status.HTTP_404_NOT_FOUND)
                else:
                    return Response({"error": "ছাত্রের রেকর্ড পাওয়া যায়নি!"}, status=status.HTTP_404_NOT_FOUND)

            # যদি মেম্বার পাওয়া যায় তবে ডেটা রিটার্ন করবে ওটিপি পাঠানোর জন্য
            if member_data:
                return Response(member_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"RESET CHECK ERROR: {str(e)}")
            return Response({"error": "সার্ভার এরর!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CompletePasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        role = request.data.get('role')
        unique_id = request.data.get('unique_id')
        new_password = request.data.get('password')

        try:
            if role == 'employee':
                profile = EmployeeProfile.objects.get(employee_id=unique_id)
                user = profile.user
            else:
                admission = StudentAdmission.objects.get(student_id_no=unique_id)
                user = admission.student.user

            if user:
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)
            
            return Response({"error": "User not found!"}, status=404)

        except Exception as e:
            return Response({"error": "Error, Password reset not completed"}, status=400)

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


class VerifyIDView(APIView):
    authentication_classes = [] 
    permission_classes = [permissions.AllowAny] 

    def post(self, request):
        role = request.data.get('role')
        unique_id = request.data.get('unique_id')
        mobile = request.data.get('mobile')

        if not all([role, unique_id, mobile]):
            return Response({"error": "Missing fields!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response_data = {"is_registered": False}

            if role == 'employee':
                member = EmployeeProfile.objects.filter(
                    employee_id=unique_id, 
                    mobile=mobile,
                    active=True 
                ).first()
                
                if member:
                    response_data.update({
                        "name": f"{member.first_name} {member.last_name}",
                        "email": member.email,
                        "photo": member.photo.url if member.photo else None,
                        "designation": str(member.designation) if member.designation else "N/A",
                        "joining_date": member.joining_date.strftime('%d %b, %Y') if member.joining_date else "N/A",
                        "is_registered": member.user is not None
                    })
                else:
                    return Response({"error": "Employee not found!"}, status=status.HTTP_404_NOT_FOUND)
                
            elif role == 'student':
                admission = StudentAdmission.objects.filter(
                    student_id_no=unique_id, 
                    student__mobile=mobile,
                    student__active=True
                ).select_related('student', 'Program_Name', 'Session').first()

                if admission:
                    student = admission.student
                    # ডট নোটেশন এর বদলে safe চেক
                    p_name = admission.Program_Name.Program_Name if admission.Program_Name else "N/A"
                    sess = str(admission.Session) if admission.Session else "N/A"
                    
                    response_data.update({
                        "name": f"{student.first_name} {student.last_name}",
                        "email": student.email,
                        "photo": student.photo.url if student.photo else None,
                        "program": p_name,
                        "session": sess,
                        "reg_no": admission.student_id_no, # unique_id টাই এখানে reg_no হিসেবে দেখাচ্ছি
                        "is_registered": student.user is not None
                    })
                else:
                    return Response({"error": "Student record matching ID & Mobile not found!"}, status=status.HTTP_404_NOT_FOUND)

            if response_data.get("is_registered"):
                return Response({
                    "is_registered": True,
                    "message": "Already registered!",
                    "name": response_data["name"]
                }, status=status.HTTP_200_OK)

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            # এররটি টার্মিনালে প্রিন্ট হবে যাতে আপনি দেখতে পারেন আসলে কী সমস্যা
            print(f"DEBUG ERROR: {str(e)}")
            return Response({"error": f"Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]

    def post(self, request):
        unique_id = request.data.get('unique_id')
        role = request.data.get('role')
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email') # ফ্রন্টএন্ড থেকে আসা ইমেইল

        # ১. ডাটা ভ্যালিডেশন
        if not all([unique_id, role, username, password]):
            return Response({"error": "সবগুলো ফিল্ড পূরণ করা আবশ্যক!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = None
            
            # --- EMPLOYEE REGISTRATION ---
            if role == 'employee':
                profile = EmployeeProfile.objects.get(employee_id=unique_id)
                
                user = User.objects.create_user(
                    username=username,
                    email=email if email else profile.email,
                    first_name=profile.first_name,
                    last_name=profile.last_name,
                    password=password
                )
                
                profile.user = user
                profile.save()

                # 'Fresh_Employee' গ্রুপে যুক্ত করা
                group, _ = Group.objects.get_or_create(name='Fresh_Employee')
                user.groups.add(group)
                
                return Response({"success": "Employee account created and added to Fresh_Employee group!"}, status=status.HTTP_201_CREATED)

            # --- STUDENT REGISTRATION ---
            elif role == 'student':
                admission = StudentAdmission.objects.select_related('student').get(student_id_no=unique_id)
                profile = admission.student # StudentPersonal মডেল
                
                user = User.objects.create_user(
                    username=username,
                    email=email if email else profile.email,
                    first_name=profile.first_name,
                    last_name=profile.last_name,
                    password=password
                )
                
                profile.user = user
                profile.save()

                # 'Fresh_Student' গ্রুপে যুক্ত করা
                group, _ = Group.objects.get_or_create(name='Fresh_Student')
                user.groups.add(group)

                return Response({"success": "Student account created and added to Fresh_Student group!"}, status=status.HTTP_201_CREATED)

            else:
                return Response({"error": "Invalid role specified!"}, status=status.HTTP_400_BAD_REQUEST)

        except (EmployeeProfile.DoesNotExist, StudentAdmission.DoesNotExist):
            return Response({"error": "প্রদত্ত আইডির বিপরীতে কোনো প্রোফাইল পাওয়া যায়নি!"}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            # যদি ইউজার তৈরি হয়ে যায় কিন্তু কোনো কারণে প্রোফাইল লিঙ্ক করতে এরর হয়, তবে ইউজার ডিলিট করে দেওয়া নিরাপদ
            if user:
                user.delete()
            return Response({"error": f"Registration Failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SendOTPView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        mobile = request.data.get('mobile')
        email = request.data.get('email')
        method = request.data.get('method') # 'sms' or 'email'
        
        if not method:
            return Response({"error": "OTP method is required!"}, status=status.HTTP_400_BAD_REQUEST)

        # ওটিপি জেনারেট করা
        otp = str(random.randint(100000, 999999))
        
        # MultipleObjectsReturned এরর এড়াতে সরাসরি নতুন রেকর্ড তৈরি করছি
        # এতে ডাটাবেসে মোবাইল এবং ইমেইল উভয়ই সেভ থাকবে
        OTPStorage.objects.create(
            mobile=mobile,
            email=email,
            otp=otp
        )

        # --- Terminal Debug Print ---
        print("\n" + "="*40)
        print(f"DEBUG: NEW OTP CREATED")
        print(f"TARGET: {email if method == 'email' else mobile}")
        print(f"CODE: {otp}") 
        print("="*40 + "\n")

        try:
            if method == 'email' and email:
                send_mail(
                    'Registration OTP',
                    f'Your verification code is: {otp}',
                    settings.EMAIL_HOST_USER,
                    [email],
                    fail_silently=False,
                )
                return Response({"success": "OTP sent via Email!"}, status=status.HTTP_200_OK)
            elif method == 'sms' and mobile:
                msg = f"Your Registration OTP is {otp}"
                send_sms_gate(mobile, msg) # জাস্ট এক লাইনে কল করুন
                return Response({"success": "OTP sent via SMS!"}, status=200)

            
            return Response({"error": "Contact info missing for selected method"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"DEBUG: Error sending OTP -> {e}")
            return Response({"error": "System failed to send OTP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class SendPasswordResetOTPView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        mobile = request.data.get('mobile')
        email = request.data.get('email')
        method = request.data.get('method') # 'sms' or 'email'
        
        if not method:
            return Response({"error": "OTP method is required!"}, status=status.HTTP_400_BAD_REQUEST)

        # ওটিপি জেনারেট করা
        otp = str(random.randint(100000, 999999))
        
        # ডাটাবেসে সেভ করা (রেজিস্ট্রেশনের মতোই লজিক)
        OTPStorage.objects.create(
            mobile=mobile,
            email=email,
            otp=otp
        )

        # --- Terminal Debug Print ---
        print("\n" + "="*40)
        print(f"DEBUG: PASSWORD RESET OTP")
        print(f"TARGET: {email if method == 'email' else mobile}")
        print(f"CODE: {otp}") 
        print("="*40 + "\n")

        try:
            if method == 'email' and email:
                send_mail(
                    'Password Reset OTP',
                    f'Your password reset code is: {otp}. Do not share it with anyone.',
                    settings.EMAIL_HOST_USER,
                    [email],
                    fail_silently=False,
                )
                return Response({"success": "Reset OTP sent via Email!"}, status=status.HTTP_200_OK)

            elif method == 'sms' and mobile:
                # SMS.net.bd API Logic
                payload = {
                    'api_key': 'YOUR_API_KEY_HERE', 
                    'msg': f"Your Password Reset OTP is {otp}", 
                    'to': mobile
                }
                # requests.post("https://api.sms.net.bd/sendsms", data=payload)
                return Response({"success": "Reset OTP sent via SMS!"}, status=status.HTTP_200_OK)
            
            return Response({"error": "Contact info missing for selected method"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"DEBUG: Error sending Reset OTP -> {e}")
            return Response({"error": "Failed to send reset OTP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyResetOTPView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        mobile = request.data.get('mobile')
        email = request.data.get('email')
        user_otp = str(request.data.get('otp')) if request.data.get('otp') else ""

        print(f"\n--- VERIFYING OTP ---")
        print(f"Checking for Mobile: {mobile} OR Email: {email} with OTP: {user_otp}")

        if not user_otp:
            return Response({"error": "OTP is required"}, status=status.HTTP_400_BAD_REQUEST)

        # ১. ওটিপি খোঁজার লজিক (ইমেইল অথবা মোবাইল যেকোনো একটিতে মিললেই হবে)
        # .order_by('-created_at').first() নিশ্চিত করে আমরা সবচেয়ে নতুন ওটিপি নিচ্ছি
        record = OTPStorage.objects.filter(
            (Q(mobile=mobile) | Q(email=email)), 
            otp=user_otp
        ).order_by('-created_at').first()

        if record:
            # ২. টাইম ভ্যালিডিটি চেক
            if record.is_valid():
                # ৩. সফল হলে ওই ইউজার/মোবাইলের সব পুরনো ওটিপি ডিলিট করে দিন
                OTPStorage.objects.filter(Q(mobile=mobile) | Q(email=email)).delete()
                
                print("SUCCESS: OTP Verified & Database Cleaned!")
                return Response({
                    "success": True, 
                    "message": "OTP matched successfully!"
                }, status=status.HTTP_200_OK)
            else:
                print("FAILED: OTP Found but Expired.")
                return Response({"error": "OTP has expired! Please resend."}, status=status.HTTP_400_BAD_REQUEST)
        
        # ৪. যদি কোনো রেকর্ড না পাওয়া যায়
        print("FAILED: No record matches this OTP.")
        return Response({"error": "Invalid OTP code! Please try again."}, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        mobile = request.data.get('mobile')
        email = request.data.get('email')
        user_otp = str(request.data.get('otp')) if request.data.get('otp') else ""

        print(f"\n--- VERIFYING OTP ---")
        print(f"Checking for Mobile: {mobile} OR Email: {email} with OTP: {user_otp}")

        if not user_otp:
            return Response({"error": "OTP is required"}, status=status.HTTP_400_BAD_REQUEST)

        # ১. ওটিপি খোঁজার লজিক (ইমেইল অথবা মোবাইল যেকোনো একটিতে মিললেই হবে)
        # .order_by('-created_at').first() নিশ্চিত করে আমরা সবচেয়ে নতুন ওটিপি নিচ্ছি
        record = OTPStorage.objects.filter(
            (Q(mobile=mobile) | Q(email=email)), 
            otp=user_otp
        ).order_by('-created_at').first()

        if record:
            # ২. টাইম ভ্যালিডিটি চেক
            if record.is_valid():
                # ৩. সফল হলে ওই ইউজার/মোবাইলের সব পুরনো ওটিপি ডিলিট করে দিন
                OTPStorage.objects.filter(Q(mobile=mobile) | Q(email=email)).delete()
                
                print("SUCCESS: OTP Verified & Database Cleaned!")
                return Response({
                    "success": True, 
                    "message": "OTP matched successfully!"
                }, status=status.HTTP_200_OK)
            else:
                print("FAILED: OTP Found but Expired.")
                return Response({"error": "OTP has expired! Please resend."}, status=status.HTTP_400_BAD_REQUEST)
        
        # ৪. যদি কোনো রেকর্ড না পাওয়া যায়
        print("FAILED: No record matches this OTP.")
        return Response({"error": "Invalid OTP code! Please try again."}, status=status.HTTP_400_BAD_REQUEST)