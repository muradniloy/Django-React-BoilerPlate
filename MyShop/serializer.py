from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Products
        fields = "__all__"
        depth = 1

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'first_name', 'last_name', 'email')
        extra_kwargs = {"passwprd": {"write_only":True, 'required':True}}

        
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"
        read_only_fields = ['prouser']

    def create(self, validated_data):
        validated_data['prouser'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('prouser', None)  # ignore if somehow passed
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['prouser'] = UserSerializer(instance.prouser).data
        return response

class CategorisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'CategoryTitle']


class ProductsSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(
        source='category.CategoryTitle', read_only=True
    )

    class Meta:
        model = Products
        fields = '__all__'



class ProfileUpdateSerializer(serializers.ModelSerializer):
    # User fields
    first_name = serializers.CharField(source='prouser.first_name', required=False)
    last_name = serializers.CharField(source='prouser.last_name', required=False)
    email = serializers.EmailField(source='prouser.email', required=False)

    class Meta:
        model = Profile
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'location',
            'designation',
            'about',
            'image'
        ]

    def update(self, instance, validated_data):
        # Update User data
        user_data = validated_data.pop('prouser', {})
        user = instance.prouser

        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Update Profile data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

class ReligionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Religion
        fields = ["id", "name"]
class StudentPersonalListSerializer(serializers.ModelSerializer):
    religion_name = serializers.CharField(source='religion.name', read_only=True)

    class Meta:
        model = StudentPersonal
        fields = "__all__"

from rest_framework import serializers
from .models import StudentPersonal, Religion

class StudentPersonalSerializer(serializers.ModelSerializer):
    religion_name = serializers.CharField(source='religion.name', read_only=True)
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = StudentPersonal
        fields = "__all__"

from rest_framework import serializers
from .models import Division, District, Upazilla

# -------------------
# Division
# -------------------
class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = ['id', 'name']  # backward compatible, simple


# -------------------
# District
# -------------------
class DistrictSerializer(serializers.ModelSerializer):
    # read-only name of division
    division_name = serializers.CharField(source='division.name', read_only=True)

    class Meta:
        model = District
        # include both FK id and name for backward compatibility
        fields = ['id', 'name', 'division', 'division_name']


# -------------------
# Upazilla
# -------------------
class UpazillaSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)
    division_name = serializers.CharField(source='district.division.name', read_only=True)
    district_division_id = serializers.IntegerField(source='district.division.id', read_only=True)

    class Meta:
        model = Upazilla
        # include both FK id and read-only names
        fields = [
            'id', 'name', 
            'district',           # FK for POST / PUT
            'district_name',      # read-only for display
            'division_name',      # read-only for display
            'district_division_id' # read-only id for filtering chain
        ]



# class StudentAddressSerializer(serializers.ModelSerializer):
#     division = DivisionSerializer(read_only=True)
#     district = DistrictSerializer(read_only=True)
#     upazilla = UpazillaSerializer(read_only=True)

#     Present_Division = DivisionSerializer(read_only=True)
#     Present_District = DistrictSerializer(read_only=True)
#     Present_Upazilla = UpazillaSerializer(read_only=True)

#     student = StudentPersonalSerializer(read_only=True)

#     class Meta:
#         model = StudentAddress
#         fields = "__all__"

# class StudentAddressSerializer(serializers.ModelSerializer):
#     division = DivisionSerializer(read_only=True)
#     district = DistrictSerializer(read_only=True)
#     upazilla = UpazillaSerializer(read_only=True)

#     Present_Division = DivisionSerializer(read_only=True)
#     Present_District = DistrictSerializer(read_only=True)
#     Present_Upazilla = UpazillaSerializer(read_only=True)

#     student = StudentPersonalSerializer(read_only=True)

#     class Meta:
#         model = StudentAddress
#         fields = "__all__"

# class StudentAddressSerializer(serializers.ModelSerializer):
#     division = serializers.PrimaryKeyRelatedField(queryset=Division.objects.all())
#     district = serializers.PrimaryKeyRelatedField(queryset=District.objects.all(), required=False, allow_null=True)
#     upazilla = serializers.PrimaryKeyRelatedField(queryset=Upazilla.objects.all(), required=False, allow_null=True)
    
#     Present_Division = serializers.PrimaryKeyRelatedField(queryset=Division.objects.all(), required=False, allow_null=True)
#     Present_District = serializers.PrimaryKeyRelatedField(queryset=District.objects.all(), required=False, allow_null=True)
#     Present_Upazilla = serializers.PrimaryKeyRelatedField(queryset=Upazilla.objects.all(), required=False, allow_null=True)

#     student = serializers.PrimaryKeyRelatedField(queryset=StudentPersonal.objects.all())

#     class Meta:
#         model = StudentAddress
#         fields = "__all__"

# class StudentAddressSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = StudentAddress
#         fields = "__all__"
#         read_only_fields = ['student'] # এটি থাকলে 'required' এরর আসবে না

# serializers.py
class StudentAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAddress
        fields = "__all__"
        read_only_fields = ['student']
        
    # GET রিকোয়েস্টের সময় বিস্তারিত ডাটা দেখানোর জন্য
    def to_representation(self, instance):
        response = super().to_representation(instance)
        # স্টুডেন্ট, ডিভিশন ইত্যাদির অবজেক্ট ডাটা ইনজেক্ট করা
        response['division'] = {"id": instance.division.id, "name": instance.division.name} if instance.division else None
        response['district'] = {"id": instance.district.id, "name": instance.district.name} if instance.district else None
        response['upazilla'] = {"id": instance.upazilla.id, "name": instance.upazilla.name} if instance.upazilla else None
     
        response['Present_Division'] = {"id": instance.Present_Division.id, "name": instance.Present_Division.name} if instance.Present_Division else None
        response['Present_District'] = {"id": instance.Present_District.id, "name": instance.Present_District.name} if instance.Present_District else None
        response['Present_Upazilla'] = {"id": instance.Present_Upazilla.id, "name": instance.Present_Upazilla.name} if instance.Present_Upazilla else None
        # একইভাবে অন্যদের জন্য করুন...
        
        # স্টুডেন্টের বিস্তারিত তথ্য (ফটো এবং নামের জন্য)
        if instance.student:
            response['student'] = {
                "id": instance.student.id,
                "first_name": instance.student.first_name,
                "last_name": instance.student.last_name,
                "photo": instance.student.photo.url if instance.student.photo else None,
                "email": instance.student.email
            }
        return response
    
class EducationQualificationSerializer(serializers.ModelSerializer):
    # board ফিল্ডটি যদি EducationBoard মডেলের সাথে যুক্ত থাকে
    board_name = serializers.ReadOnlyField(source='board.Board_Name') 
    education_type_display = serializers.CharField(source='get_education_type_display', read_only=True)
    education_group_display = serializers.CharField(source='get_education_group_display', read_only=True)

    class Meta:
        model = EducationQualification
        fields = '__all__'
        # depth = 1 ব্যবহার করবেন না, এটি ড্রপডাউন ম্যাচিংয়ে সমস্যা করে