from rest_framework import serializers
from .models import *
from MyShop.models import EmployeeProfile, StudentPersonal
from django.contrib.auth.models import User

class NoticeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NoticeCategory
        fields = '__all__'

class NoticeSerializer(serializers.ModelSerializer):
    # ক্যাটাগরির নাম এবং স্লাগ সরাসরি অ্যাক্সেস করার জন্য
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')

    class Meta:
        model = Notice
        fields = '__all__' # এখানে category_name এবং category_slug যোগ হয়ে যাবে




class ImportantLinkSerializer(serializers.ModelSerializer):
    # ইমেজ ফিল্ডটি অপশনাল রাখার জন্য required=False দিন
    icon = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = ImportantLink
        fields = ['id', 'title', 'url', 'icon', 'svg_icon', 'priority', 'is_active', 'created_at']



class AdmissionQuerySerializer(serializers.ModelSerializer):
    # ড্রপডাউনে দেখানোর জন্য এমপ্লয়ির নাম রিড-অনলি হিসেবে রাখা যেতে পারে
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.user.get_full_name')

    class Meta:
        model = AdmissionQuery
        fields = '__all__'

class HomeSliderSerializer(serializers.ModelSerializer):
    # এটি নিশ্চিত করবে যে positions শুধু ID-র একটি অ্যারে [1, 2] হিসেবে আসবে
    positions = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=SliderPosition.objects.all()
    )

    class Meta:
        model = HomeSlider
        fields = '__all__'
    
class SliderPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SliderPosition
        fields = '__all__'
       


class RegistrationSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True)
    unique_id = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'unique_id']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.pop('role')
        unique_id = validated_data.pop('unique_id')
        
        # ইউজার তৈরি
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # প্রোফাইল আপডেট লজিক
        if role == 'student':
            StudentPersonal.objects.filter(student_id=unique_id).update(user=user)
        elif role == 'employee':
            EmployeeProfile.objects.filter(employee_id=unique_id).update(user=user)

        return user