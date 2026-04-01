from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Sum
from Accounts.models import Account




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
        validated_data.pop('prouser', None)
        return super().update(instance, validated_data)
    def to_representation(self, instance):
    # ১. প্রথমে প্রোফাইলের বেসিক ডাটা নিয়ে আসি
        response = super().to_representation(instance)
        user = instance.prouser
        
        if user:
            # ২. ইউজারের ডাটা এবং ৩. গ্রুপ ডাটা (আপনার কোড অনুযায়ী)
            
            response['prouser'] = UserSerializer(user).data
            response['groups'] = [g.name for g in user.groups.all()]
            
            # ৪. ছবির ফলব্যাক (আপনার কোড অনুযায়ী)
            if not instance.image:
                student = getattr(user, 'student_profile', None) or getattr(user, 'studentpersonal', None)
                if student and student.photo:
                    response['image'] = student.photo.url
                
                employee = getattr(user, 'employee_profile', None) or getattr(user, 'employeeprofile', None)
                if employee and employee.photo:
                    response['image'] = employee.photo.url

            # --- নতুন অংশ: এমপ্লয়ি ডেজিগনেশন ও ডিপার্টমেন্ট (এখানে যোগ করুন) ---
            employee = getattr(user, 'employee_profile', None) or getattr(user, 'employeeprofile', None)
            if employee:
                # ForeignKey থেকে নামগুলো টেনে আনা (মডেলে ফিল্ডের নাম 'name' হলে)
                response['emp_department'] = employee.department.name if employee.department else ""
                response['emp_designation'] = employee.designation.name if employee.designation else ""
                
                # যদি প্রোফাইল মডেলে designation খালি থাকে, তবে অফিসিয়ালটা বসিয়ে দাও
                if not response.get('designation'):
                    response['designation'] = response['emp_designation']

            # ৫. ফোন নম্বর (আপনার কোড অনুযায়ী)
            if not instance.phone:
                source = getattr(user, 'student_profile', None) or getattr(user, 'studentpersonal', None) or \
                        getattr(user, 'employee_profile', None) or getattr(user, 'employeeprofile', None)
                if source:
                    response['phone'] = getattr(source, 'mobile', "") or getattr(source, 'phone', "")

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
            'first_name', 'last_name', 'email', 
            'phone', 'location', 'designation', 'about', 'image'
        ]

    def update(self, instance, validated_data):
        # ১. রিকোয়েস্ট থেকে ইউজারকে বের করা (হিস্ট্রি ট্র্যাকিংয়ের জন্য)
        request_user = self.context.get('request').user

        # ২. Update User data
        user_data = validated_data.pop('prouser', {})
        user = instance.prouser
        
        if user_data:
            # ইউজার মডেলের জন্য হিস্ট্রি ইউজার সেট করা
            user._history_user = request_user 
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        # ৩. Update Profile data
        # প্রোফাইল মডেলের জন্য হিস্ট্রি ইউজার সেট করা
        instance._history_user = request_user
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

class ReligionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Religion
        fields = ["id", "name"]

class StudentPersonalListSerializer(serializers.ModelSerializer):
    # 'religion.name' থেকে ডাটা নিয়ে 'religion_name' ফিল্ডে রাখবে
    religion_name = serializers.CharField(source='religion.name', read_only=True)

    class Meta:
        model = StudentPersonal
        fields = "__all__"


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
    education_type_display = serializers.CharField(source='get_education_type_display', read_only=True)
    education_group_display = serializers.CharField(source='get_education_group_display', read_only=True)
    board_name = serializers.CharField(source='board.Board_Name', read_only=True)

    class Meta:
        model = EducationQualification
        fields = '__all__'

class EducationBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationBoard
        fields = ['id', 'Board_Name']



class UserProfileSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'groups', 'permissions']

    def get_groups(self, obj):
        # ইউজারের সব গ্রুপের নাম লিস্ট আকারে দেবে
        return [group.name for group in obj.groups.all()]

    def get_permissions(self, obj):
        # ইউজারের সব পারমিশন (গ্রুপ এবং ডিরেক্ট) লিস্ট আকারে দেবে
        return list(obj.get_all_permissions())


class StudentAdmissionSerializer(serializers.ModelSerializer):
    # 'student' আইডি এর বদলে পুরো অবজেক্ট পাঠাবে
    student = StudentPersonalSerializer(read_only=True) 
    
    # ড্রপডাউনের নাম দেখানোর জন্য (আপনার আগের কোড অনুযায়ী)
    Program_Name_display = serializers.ReadOnlyField(source='Program_Name.Program_Name')
    Session_display = serializers.ReadOnlyField(source='Session.Session_Name')

    class Meta:
        model = StudentAdmission
        fields = '__all__'


class GlobalAuditLogSerializer(serializers.Serializer):
    history_id = serializers.IntegerField()
    history_date = serializers.DateTimeField()
    history_type = serializers.CharField()
    changed_by = serializers.SerializerMethodField()
    model_name = serializers.SerializerMethodField()
    changes = serializers.SerializerMethodField()
    object_repr = serializers.SerializerMethodField()

    def get_changed_by(self, obj):
        return obj.history_user.username if obj.history_user else "System"

    def get_model_name(self, obj):
        try:
            return obj.instance.__class__.__name__ if obj.instance else "Unknown"
        except Exception:
            return "Unknown"

    def get_object_repr(self, obj):
        try:
            if obj.instance:
                # Forces string conversion to handle Decimals or other types
                return str(obj.instance.__str__())
            return "N/A"
        except (ObjectDoesNotExist, Exception):
            return "Object No Longer Exists"

    def get_changes(self, obj):
        delta = []
        
        # 1. Handling Updates (Type: ~)
        if obj.history_type == '~':
            prev_record = obj.prev_record
            if prev_record:
                try:
                    diff = obj.diff_against(prev_record)
                    for change in diff.changes:
                        delta.append({
                            'field': change.field,
                            'old': str(change.old),
                            'new': str(change.new)
                        })
                except Exception:
                    pass
        
        # 2. Handling New Entries (Type: +)
        elif obj.history_type == '+':
            for field in obj.instance._meta.fields:
                field_name = field.name
                try:
                    # Using getattr safely to prevent DoesNotExist crash
                    value = getattr(obj, field_name, None)
                    if value is not None:
                        delta.append({
                            'field': field_name,
                            'old': "None (New Entry)",
                            'new': str(value)
                        })
                except (ObjectDoesNotExist, Exception):
                    delta.append({
                        'field': field_name,
                        'old': "None (New Entry)",
                        'new': "Related Object Deleted"
                    })
                    
        # 3. Handling Deletions (Type: -)
        elif obj.history_type == '-':
            for field in obj.instance._meta.fields:
                field_name = field.name
                try:
                    value = getattr(obj, field_name, None)
                    if value is not None:
                        delta.append({
                            'field': field_name,
                            'old': str(value),
                            'new': "Deleted"
                        })
                except (ObjectDoesNotExist, Exception):
                    delta.append({
                        'field': field_name,
                        'old': "Related Object Deleted",
                        'new': "Deleted"
                    })
                    
        return delta
class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'


class MainHeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainHead
        fields = '__all__'

class PaymentHeadSerializer(serializers.ModelSerializer):
    # ডিসপ্লে করার জন্য নাম
    category_name = serializers.ReadOnlyField(source='payment_category.main_head_name')
    
    # এটি রিড-রাইট উভয় সাপোর্ট করবে যাতে সেভ করার সময় সমস্যা না হয়
    # MainHead হলো আপনার ফরেন কি মডেলের নাম
    payment_category = serializers.PrimaryKeyRelatedField(
        queryset=MainHead.objects.all(), 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = PaymentHead
        # 'headType' এবং 'opening_date' ফিল্ডগুলো অবশ্যই যোগ করতে হবে
        fields = [
            'id', 
            'head_code', 
            'head_name', 
            'opening_date', 
            'payment_category', 
            'category_name', 
            'headType'
        ]
        
class FeeRateSerializer(serializers.ModelSerializer):
    # ক্যাটাগরির আইডিটি ফ্রন্টএন্ডে পাঠানোর জন্য এটি যোগ করুন
    category_id = serializers.ReadOnlyField(source='payment_head.payment_category.id')
    
    category_name = serializers.ReadOnlyField(source='payment_head.payment_category.main_head_name')
    category_code = serializers.ReadOnlyField(source='payment_head.payment_category.main_head_code')

    head_code = serializers.ReadOnlyField(source='payment_head.head_code')
    head_name = serializers.ReadOnlyField(source='payment_head.head_name')

    class Meta:
        model = FeeRate
        fields = '__all__' # এখানে category_id অটোমেটিক ইনক্লুড হয়ে যাবে


class PaymentContactSerializer(serializers.ModelSerializer):
    # স্টুডেন্ট ইনফো
    photo = serializers.ImageField(source='student.photo', read_only=True)
    student_name = serializers.ReadOnlyField(source='student.first_name')
    
    # ফি ইনফো
    fee_head_name = serializers.ReadOnlyField(source='fees.payment_head.head_name')
    # আপনার মডেল অনুযায়ী পাথটি নিশ্চিত করুন (fees -> payment_head -> payment_category -> main_head_name)
    category_name = serializers.ReadOnlyField(source='fees.payment_head.payment_category.main_head_name') 
    original_amount = serializers.ReadOnlyField(source='fees.amount')
    
    # চয়েস ফিল্ডের ডিসপ্লে ভ্যালু
    paymentType_display = serializers.CharField(source='get_paymentType_display', read_only=True)
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)

    class Meta:
        model = PaymentContact
        fields = [
            'id', 
            'student', 
            'student_name', 
            'photo', 
            'fees', 
            'fee_head_name', 
            'category_name', 
            'contact_date', 
            'paymentType', 
            'paymentType_display', 
            'discount_type', 
            'discount_type_display', 
            'discount_value', 
            'quantity',  # <--- এই ফিল্ডটি যোগ করা হলো
            'amount', 
            'original_amount'
        ]

class StudentPaymentSerializer(serializers.ModelSerializer):
    # এগুলো শুধু ডাটা দেখানোর (Read-only) জন্য, তাই ফর্মের মেইন 'amount' বা 'discount_value' ডিস্টার্ব হবে না
    student_full_name = serializers.SerializerMethodField(read_only=True)
    student_id_no = serializers.SerializerMethodField(read_only=True)
    student_photo = serializers.SerializerMethodField(read_only=True)
    head_name = serializers.ReadOnlyField(source='fees.payment_head.payment_head_name', default="General Fee")
    all_heads = serializers.SerializerMethodField(read_only=True)
    
    # ইনভয়েস লেভেলের ক্যালকুলেটেড ফিল্ড (Display Only)
    original_fee_rate = serializers.SerializerMethodField(read_only=True)
    total_discount_amount = serializers.SerializerMethodField(read_only=True)
    total_invoice_amount = serializers.SerializerMethodField(read_only=True)
    total_due_amount = serializers.SerializerMethodField(read_only=True)
    net_payable_amount = serializers.SerializerMethodField(read_only=True)
    collected_by_name = serializers.ReadOnlyField(source='collected_by.username')
    account_display = serializers.SerializerMethodField()

   

    class Meta:
        model = StudentPayment
        # '__all__' থাকলে মডেলের সব অরিজিনাল ফিল্ড (amount, discount_value) ফর্মে কাজ করবে
        fields = '__all__'
        read_only_fields = ['collected_by', 'invoice_no']

    # --- ফর্মের জন্য প্রয়োজনীয় অরিজিনাল ফাংশনগুলো ---
    def get_student_full_name(self, obj):
        return f"{obj.student.first_name}" if obj.student else "Unknown Student"
    
    def get_account_display(self, obj):
        if obj.account:
            # এটি "Main Cash (Cash In Hand)" বা "DBBL (Bank Account)" রিটার্ন করবে
            return f"{obj.account.account_name} ({obj.account.bank_name})"
        return "N/A"

    def get_student_id_no(self, obj):
        if obj.student:
            admission = obj.student.studentadmission_set.first()
            return admission.student_id_no if admission else "N/A"
        return "N/A"

    def get_student_photo(self, obj):
        try:
            return obj.student.photo.url if obj.student and obj.student.photo else None
        except:
            return None

    def get_all_heads(self, obj):
        heads = StudentPayment.objects.filter(
            invoice_no=obj.invoice_no
        ).values_list('fees__payment_head__head_name', flat=True).distinct()
        return list(heads)

    # --- ক্যালকুলেশন ফাংশনগুলো (টেবিলের জন্য) ---

    def get_original_fee_rate(self, obj):
        total = StudentPayment.objects.filter(
            invoice_no=obj.invoice_no
        ).aggregate(total=Sum('fees__amount'))['total']
        return float(total) if total else 0.0

    def get_total_discount_amount(self, obj):
        payments = StudentPayment.objects.filter(invoice_no=obj.invoice_no)
        total_discount = 0
        for p in payments:
            if not p.fees: continue
            fee_amount = float(p.fees.amount)
            d_type = p.discount_type 
            d_val = float(p.discount_value) if p.discount_value else 0.0
            
            if d_type == "2": # %
                total_discount += (fee_amount * d_val) / 100
            else: # Flat
                total_discount += d_val
        return round(total_discount, 2)
    
    def get_net_payable_amount(self, obj):
        # ১. অরিজিনাল ফি রেট বের করা (আগের ফাংশন থেকে সাহায্য নেওয়া যেতে পারে অথবা সরাসরি)
        original = StudentPayment.objects.filter(
            invoice_no=obj.invoice_no
        ).aggregate(total=Sum('fees__amount'))['total'] or 0
        
        # ২. ডিসকাউন্ট অ্যামাউন্ট বের করা (পার্সেন্টেজ ও ফ্ল্যাট লজিকসহ)
        payments = StudentPayment.objects.filter(invoice_no=obj.invoice_no)
        total_discount = 0
        for p in payments:
            if p.fees:
                fee_val = float(p.fees.amount)
                d_val = float(p.discount_value) if p.discount_value else 0.0
                if p.discount_type == "2": # Percentage
                    total_discount += (fee_val * d_val) / 100
                else: # Flat
                    total_discount += d_val
        
        # ৩. ক্যালকুলেশন: Original - Discount
        net_payable = float(original) - float(total_discount)
        
        return round(net_payable, 2)

    def get_total_invoice_amount(self, obj):
        # এটি এখন পেইড অ্যামাউন্টের সাম দেখাবে টেবিলে
        total = StudentPayment.objects.filter(
            invoice_no=obj.invoice_no
        ).aggregate(total=Sum('amount'))['total']
        return float(total) if total else 0.0
    
    def get_total_due_amount(self, obj):
        # ওই ইনভয়েস নম্বরের অধীনে থাকা সব আইটেমের new_due যোগ করা হচ্ছে
        total_due = StudentPayment.objects.filter(
            invoice_no=obj.invoice_no
        ).aggregate(total=Sum('new_due'))['total'] or 0
        
        # যেহেতু ডাটাবেসে ভ্যালুগুলো ফ্লোট বা ডেসিমাল হতে পারে, রাউন্ড করে দিচ্ছি
        return round(float(total_due), 2) if total_due > 0 else 0.0
    
class StudentSearchSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    value = serializers.IntegerField(source='id')
    student_id_no = serializers.SerializerMethodField()
    program = serializers.SerializerMethodField()
    mobile = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()

    class Meta:
        model = StudentPersonal
        fields = ['value', 'label', 'photo', 'student_id_no', 'program', 'mobile', 'first_name', 'last_name']

    def get_student_admission(self, obj):
        return obj.studentadmission_set.first()

    def get_student_id_no(self, obj):
        admission = self.get_student_admission(obj)
        return admission.student_id_no if admission and admission.student_id_no else "N/A"

    def get_program(self, obj):
        admission = self.get_student_admission(obj)
        if admission and admission.Program_Name:
            # আপনার এরর অনুযায়ী এখানে admission.Program_Name.Program_Name হতে পারে
            # অথবা সবচেয়ে সেফ হলো str(admission.Program_Name)
            return str(admission.Program_Name) 
        return "Not Enrolled"

    def get_label(self, obj):
        std_id = self.get_student_id_no(obj)
        return f"{obj.first_name} - {std_id} ({obj.mobile})"

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        # মডেলের সব ফিল্ড ব্যবহার করার জন্য '__all__' দিন
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        # আপনার মডেলের ৮টি ফিল্ডই এখানে নিশ্চিত করা হয়েছে
        fields = [
            'id', 
            'account_name', 
            'account_type', 
            'bank_name', 
            'account_number', 
            'branch', 
            'opening_balance', 
            'current_balance', 
            'is_active'
        ]
        
        # current_balance সাধারণত অটো-ক্যালকুলেটেড হয়, তাই এটি read_only রাখা নিরাপদ
        read_only_fields = ['id']

class EmployeeProfileSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    designation_name = serializers.ReadOnlyField(source='designation.name')
    
    # এটি এখন প্রোফাইল মডেল থেকেই নাম দেখাবে যদি ইউজার না থাকে
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeProfile
        fields = '__all__'
        read_only_fields = ['employee_id', 'user']

    def get_full_name(self, obj):
        if obj.user:
            return obj.user.get_full_name()
        return f"{obj.first_name} {obj.last_name}" if obj.first_name else "Unnamed Employee"
    
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = '__all__'

