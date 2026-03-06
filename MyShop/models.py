from django.db import models
from simple_history.models import HistoricalRecords
from django.contrib.auth.models import User
from simple_history import register
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from PIL import Image
import io
from django.core.files.base import ContentFile
from django.db import models
from decimal import Decimal
from django.core.validators import MinValueValidator
import datetime
from django.utils import timezone


register(User, inherit=True)
class Profile (models.Model):
    prouser=models.OneToOneField(User, on_delete=models.CASCADE)
    image=models.ImageField(upload_to='Profile_Images/', blank=True, null=True, verbose_name='Profile Picture')
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    designation = models.CharField(max_length=255, blank=True)
    about = models.TextField(blank=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.prouser.username
    
class Category(models.Model):
    CategoryTitle = models.CharField(max_length=100, verbose_name="Category Titile")
    date = models.DateField(auto_now_add=True)
    def __str__(self):
        return self.CategoryTitle
    
class Products(models.Model):
    ProductTitle = models.CharField(max_length=100)
    date = models.DateField(auto_now_add=True)
    Category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True)
    ProductImage=models.ImageField(upload_to="Product_Image/")
    MarketPrice=models.PositiveIntegerField()
    SellingPrice=models.PositiveIntegerField()
    Description=models.TextField()
    
    def __str__(self):
        return self.ProductTitle

class Cart(models.Model):
    customer =  models.ForeignKey(Profile, on_delete=models.CASCADE)
    total = models.PositiveIntegerField()
    complit = models.BooleanField(default=False)
    date = models.DateField(auto_now_add=True)
    def __str__(self):
        return f"Cart ID=={self.id}==Card=={self.complit}==Order Person=={self.customer.prouser}"


class CartProduct(models.Model):
    cart =  models.ForeignKey(Cart, on_delete=models.CASCADE)
    Products =  models.ManyToManyField(Products)
    Price = models.PositiveIntegerField()
    Quantity = models.PositiveIntegerField()
    SubTotal = models.PositiveIntegerField()
    def __str__(self):
        return f"Cart=={self.cart.id}==CartProduct=={self.id}==Quantity{self.Quantity}"
        
ORDER_STATUS = {
    ("Order Received", "Order Received"),
    ("Order Processing", "Order Processing"),
    ("On the way", "On the way"),
    ("Order Completed", "Order Completed"),
    ("Order Canceled", "Order Canceled"),
}

class Order(models.Model):
    cart = models.OneToOneField(Cart, on_delete=models.CASCADE)
    address = models.CharField(max_length=250)
    mobile = models.CharField(max_length=16)
    email = models.CharField(max_length=100)
    total = models.PositiveIntegerField()
    discount = models.PositiveIntegerField()
    order_status = models.CharField(ORDER_STATUS, max_length=22, choices=ORDER_STATUS, default="Order Received")
    date = models.DateField(auto_now_add=True)
    payment = models.BooleanField(default=False)

    def __str__(self):
        return f"Order ID=={self.id}==Card=={self.cart.id}==Order Person=={self.cart.customer.prouser}"

class Religion(models.Model):
    name=models.CharField(max_length=100, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.name

class StudentPersonal(models.Model):
    gender = [
        ("m","Male"),
        ("f","Female"),
        ("o","Others"),
    ]
    photo = models.ImageField(upload_to='uploads/', blank=True, null=True)
    first_name=models.CharField(max_length=100)
    last_name=models.CharField(max_length=100)
    fathers_name=models.CharField(max_length=100, null=True)
    mothers_name=models.CharField(max_length=100, null=True)
    email=models.EmailField()
    mobile=models.CharField(null=True, blank=True, max_length=100)
    gender=models.CharField(max_length=20, choices=gender, default=None)
    religion=models.ForeignKey(Religion, on_delete=models.CASCADE, null=True)
    date_of_birth=models.DateField(blank=True, null=True)
    birth_id=models.CharField(max_length=10, null=True, blank=True)
    guardian_name=models.CharField(max_length=100, blank=True, null=True)
    guardian_mobile=models.IntegerField(null=True, blank=True)
    active = models.BooleanField(default=True, blank=True)
    history = HistoricalRecords()

    
    def __str__(self):
        return self.first_name
    
class EducationBoard(models.Model):
    Board_Name = models.CharField(max_length=100, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.Board_Name



class EducationQualification(models.Model):
    EDUCATION_TYPES = [
        ("s", "SSC"), ("h", "HSC"), ("b", "Bachelor"),
        ("d", "Diploma"), ("m", "Masters"),
    ]
    
    GROUPS = [
        ("s", "Science"), ("a", "Arts"), ("c", "Commerce"),
        ("t", "Technical"), ("n", "Nursing"),
    ]

    student = models.ForeignKey('StudentPersonal', on_delete=models.CASCADE)
    education_type = models.CharField(choices=EDUCATION_TYPES, max_length=20)
    education_group = models.CharField(choices=GROUPS, max_length=20)
    course_name = models.CharField(max_length=100, null=True)
    institution_name = models.CharField(max_length=100, null=True)
    roll = models.IntegerField(null=True, blank=True)
    registration_no = models.IntegerField(null=True, blank=True)
    result = models.FloatField(null=True, blank=True)
    board = models.ForeignKey(EducationBoard, null=True, on_delete=models.CASCADE)
    passing_year = models.IntegerField(null=True)
    history = HistoricalRecords()
    
    # নতুন ফিল্ড: ফাইল আপলোড (PDF এবং Image সমর্থিত)
    educational_file = models.FileField(
        upload_to='student_docs/%Y/%m/',
        null=True,
        blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])]
    )

    def save(self, *args, **kwargs):
        # যদি ফাইল থাকে এবং সেটি যদি ইমেজ হয় (jpg, jpeg, png)
        if self.educational_file and any(self.educational_file.name.lower().endswith(ext) for ext in ['jpg', 'jpeg', 'png']):
            img = Image.open(self.educational_file)
            
            # ইমেজ কনভার্ট করা (RGB তে যেন PNG কাজ করে)
            if img.mode != 'RGB':
                img = img.convert('RGB')

            # মেমোরিতে ইমেজ সেভ করা এবং কোয়ালিটি কমিয়ে সাইজ ২০০ কেবি করার চেষ্টা
            output = io.BytesIO()
            # কোয়ালিটি কমিয়ে ২০০ কেবির নিচে নামানোর লজিক
            img.save(output, format='JPEG', quality=60, optimize=True) 
            output.seek(0)

            # নতুন ফাইল হিসেবে সেট করা
            self.educational_file = ContentFile(output.read(), name=self.educational_file.name)

        super().save(*args, **kwargs)

    def clean(self):
        # ফাইলের সাইজ যদি ২০০ কেবির বেশি হয় তবে এরর দিবে (বিশেষ করে PDF এর জন্য)
        if self.educational_file:
            limit = 300 * 1024 # 200 KB
            if self.educational_file.size > limit:
                # ইমেজের ক্ষেত্রে আমরা save মেথডে ছোট করছি, কিন্তু PDF হলে সরাসরি বাধা দেয়া ভালো
                if self.educational_file.name.endswith('.pdf'):
                    raise ValidationError("PDF ফাইলের সাইজ ২০০ কেবির বেশি হতে পারবে না।")

    def __str__(self):
        return f"{self.student.first_name} - {self.get_education_type_display()}"
    
class Country(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.name

class Division(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.name

class District(models.Model):
    division = models.ForeignKey(Division, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.name
    
class Upazilla (models.Model):
    district = models.ForeignKey(District, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.name
    
class StudentAddress(models.Model):
    student = models.ForeignKey(StudentPersonal, on_delete=models.CASCADE)
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name='Permanant_Division', null=True)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='Permanant_District', null=True)
    upazilla = models.ForeignKey(Upazilla, on_delete=models.CASCADE, related_name='Permanant_Upazilla', null=True)
    Post_Office = models.CharField(max_length=100, null=True, verbose_name='Permanant_Post_Office')
    Village = models.CharField(max_length=100, null=True, verbose_name='Permanant_Village')
    Present_Division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name='Present_Division', null=True )
    Present_District = models.ForeignKey(District, on_delete=models.CASCADE, related_name='Present_District', null=True)
    Present_Upazilla = models.ForeignKey(Upazilla, on_delete=models.CASCADE, related_name='Present_Upazilla', null=True)
    Present_Post_Office = models.CharField(max_length=100, null=True, verbose_name='Present_Post_Office')
    Present_Village = models.CharField(max_length=100, null=True, verbose_name='Presemt_Village')
    history = HistoricalRecords()

    def __str__(self):
        return self.student.first_name

class Program(models.Model):
    Program_Name=models.CharField(max_length=100, null=True, verbose_name='Program_Name')
    Program_Code=models.CharField(max_length=100, null=True, verbose_name='Program_Code')
    active=models.BooleanField(default=True, null=True)
    history = HistoricalRecords()
    def __str__(self):
        return self.Program_Name
    
class Session(models.Model):
    Session_Name=models.CharField(max_length=100, null=True, verbose_name='Session_Name')
    Session_Code=models.CharField(max_length=100, null=True, verbose_name='Session_Code')
    active=models.BooleanField(default=True, null=True)
    history = HistoricalRecords()
    def __str__(self):
        return self.Session_Name

class StudentAdmission(models.Model):
    student = models.ForeignKey(StudentPersonal, on_delete=models.CASCADE)
    Program_Name = models.ForeignKey(Program, on_delete=models.CASCADE, null=True)
    Date_of_admission = models.DateField(blank=True, null=True)
    Session = models.ForeignKey(Session, on_delete=models.CASCADE, null=True)
    # Approved না হওয়া পর্যন্ত ID Null থাকতে পারে, তাই null=True, blank=True করা হয়েছে
    student_id_no = models.CharField(max_length=200, unique=True, editable=False, null=True, blank=True)
    Admission_roll = models.IntegerField(null=True)
    test_score = models.IntegerField(null=True)
    merit_score = models.IntegerField(null=True)
    merit_position = models.IntegerField(null=True)
    approved = models.BooleanField(default=False, null=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        # ১. যদি এপ্রুভ না থাকে (False/None), তবে আইডি রিমুভ করে দাও
        if not self.approved:
            self.student_id_no = None
        
        # ২. যদি এপ্রুভড হয়
        else:
            condition_changed = False
            if self.pk:
                # ডাটাবেজ থেকে আগের ডাটা চেক করা
                old_instance = StudentAdmission.objects.get(pk=self.pk)
                
                # যদি আগে এপ্রুভড না থাকে অথবা সেশন/প্রোগ্রাম পরিবর্তন হয়
                if (not old_instance.approved or 
                    old_instance.Program_Name != self.Program_Name or 
                    old_instance.Session != self.Session):
                    condition_changed = True
            else:
                # নতুন এন্ট্রি এবং এপ্রুভড ট্রু থাকলে
                condition_changed = True

            # ৩. আইডি জেনারেশন লজিক
            if not self.student_id_no or condition_changed:
                short_session_code = str(self.Session.Session_Code)[-2:] if self.Session and self.Session.Session_Code else "00"
                program_code = self.Program_Name.Program_Code if self.Program_Name else "UNK"
                
                id_prefix = f"{program_code}-{short_session_code}"
                
                # লাস্ট আইডি খুঁজে বের করা (শুধুমাত্র যাদের আইডি আছে তাদের মধ্যে)
                last_entry = StudentAdmission.objects.filter(
                    student_id_no__startswith=id_prefix
                ).exclude(pk=self.pk).order_by('student_id_no').last()

                if last_entry and last_entry.student_id_no:
                    try:
                        parts = last_entry.student_id_no.split('-')
                        # প্রিফিক্স বাদে শেষের নম্বরটি বের করা
                        # যদি id_prefix এ ড্যাশ থাকে তবে split লজিক সেভাবে কাজ করবে
                        last_number_str = last_entry.student_id_no.replace(id_prefix, "")
                        new_number = int(last_number_str) + 1
                    except (ValueError, IndexError):
                        new_number = 1
                else:
                    new_number = 1

                new_id = f"{id_prefix}{new_number:04d}"

                # ডুপ্লিকেট চেক (Safety Loop)
                while StudentAdmission.objects.filter(student_id_no=new_id).exclude(pk=self.pk).exists():
                    new_number += 1
                    new_id = f"{id_prefix}{new_number:04d}"

                self.student_id_no = new_id

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.first_name} - {self.student_id_no or 'Pending'}"

class MainHead(models.Model):
    main_head_code = models.CharField(max_length=10,  unique=True)
    main_head_name=models.CharField(max_length=100, unique=True)
    history = HistoricalRecords()
  
    def __str__(self):
        return self.main_head_name


class PaymentHead(models.Model):
    type = [
        ("1","Income"),
        ("2","Expense")
        ]
    head_code = models.CharField(max_length=10,  unique=True)
    head_name=models.CharField(max_length=100, unique=True)
    opening_date=models.DateField(blank=True, null=True)
    payment_category=models.ForeignKey(MainHead, on_delete=models.CASCADE, null=True)
    headType=models.CharField(choices=type, null=True, max_length=100)
    history = HistoricalRecords()
  
    def __str__(self):
        return f"{self.head_name} ({self.head_code})"


class FeeRate(models.Model):
    payment_head=models.ForeignKey(PaymentHead, on_delete=models.CASCADE, null=True)
    amount=models.DecimalField(max_digits=11, decimal_places=2)
    opening_date=models.DateField(blank=True, null=True)
    history = HistoricalRecords()
    
class PaymentContact(models.Model):
    # চয়েসসমূহ
    PAYMENT_TYPE_CHOICES = [('1', 'One Time'), ('2', 'Monthly'), ('4', 'Yearly'), ('7', 'Anytime')]
    DISCOUNT_TYPE_CHOICES = [('1', 'Flat (TK)'), ('2', 'Percent (%)')]

    # ফরেন কি (StudentPersonal এবং FeeRate)
    # null=True এবং blank=True দেওয়া হয়েছে যাতে পুরনো ডাটা মাইগ্রেশনে সমস্যা না করে
    student = models.ForeignKey('StudentPersonal', on_delete=models.CASCADE, related_name='payment_contacts', null=True, blank=True)
    fees = models.ForeignKey('FeeRate', on_delete=models.CASCADE, related_name='payment_contacts', null=True, blank=True)
    
    # contact_date এ ডিফল্ট হিসেবে আজকের তারিখ দেওয়া হয়েছে
    contact_date = models.DateField(default=datetime.date.today, null=True, blank=True)
    paymentType = models.CharField(max_length=2, choices=PAYMENT_TYPE_CHOICES, default='1')
    
    # কোয়ান্টিটি
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)], null=True, blank=True)
    
    discount_type = models.CharField(max_length=2, choices=DISCOUNT_TYPE_CHOICES, default='1')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # ক্যালকুলেটেড ফিল্ডস
    original_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    def save(self, *args, **kwargs):
        # ১. Safety Check: যদি fees না থাকে তবে ক্যালকুলেশন স্কিপ করা
        if not self.fees:
            super(PaymentContact, self).save(*args, **kwargs)
            return

        # ২. কোয়ান্টিটি চেক
        if self.quantity is None or self.quantity < 1:
            self.quantity = 1

        # ৩. ফি রেট থেকে অরিজিনাল অ্যামাউন্ট নেওয়া
        if (not self.original_amount or self.original_amount == 0):
            self.original_amount = self.fees.amount

        # ৪. ডেসিমাল ক্যালকুলেশন (Decimal vs Float এরর ফিক্স)
        unit_price = Decimal(str(self.original_amount or '0.00'))
        qty = Decimal(str(self.quantity))
        disc_val = Decimal(str(self.discount_value or '0.00'))
        
        total_base = unit_price * qty
        
        if self.discount_type == '2': # Percent
            actual_discount = (total_base * disc_val) / Decimal('100')
        else: # Flat
            actual_discount = disc_val

        final_amt = total_base - actual_discount
        self.amount = final_amt if final_amt > 0 else Decimal('0.00')

        super(PaymentContact, self).save(*args, **kwargs)

    class Meta:
        verbose_name = "Payment Contact"
        verbose_name_plural = "Payment Contacts"
        ordering = ['-contact_date', '-id']

class StudentPayment(models.Model):
    DISCOUNT_TYPE = [("1", "Flat Amount"), ("2", "Percentage (%)")]
    Payment_Type = [("1","Partial"), ("2","Full Payment")]

    student = models.ForeignKey(StudentPersonal, on_delete=models.CASCADE, null=True)
    fees = models.ForeignKey(FeeRate, on_delete=models.CASCADE, null=True)
    payment_date = models.DateField(null=True)
    paymentType = models.CharField(choices=Payment_Type, max_length=50, null=True)
    discount_type = models.CharField(choices=DISCOUNT_TYPE, default="1", max_length=20, null=True)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True)
    old_due = models.PositiveIntegerField(null=True)
    new_due = models.PositiveIntegerField(null=True)
    amount = models.PositiveIntegerField(null=True) 
    total_paid = models.PositiveIntegerField(null=True) 
    payment_approved = models.BooleanField(default=False, blank=True)
    invoice_no = models.CharField(max_length=50, blank=True, null=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.invoice_no:
            # ২. timezone.now() ব্যবহার করুন যা নিরাপদ
            now = timezone.now() 
            
            # সাল এবং মাস বের করা (যেমন: ২৬০৩)
            year_month = now.strftime('%y%m')
            prefix = f'INV-{year_month}'

            # ওই মাসের সর্বশেষ ইনভয়েসটি খুঁজে বের করা
            last_invoice = StudentPayment.objects.filter(
                invoice_no__startswith=prefix
            ).order_by('-invoice_no').first()

            if last_invoice:
                try:
                    # শেষ ৪ ডিজিট নিয়ে ১ যোগ করা
                    last_number = int(last_invoice.invoice_no[-4:])
                    new_number = format(last_number + 1, '04d')
                except (ValueError, TypeError):
                    new_number = '0001'
            else:
                new_number = '0001'

            self.invoice_no = f'{prefix}{new_number}'
        
        super(StudentPayment, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.first_name if self.student else 'N/A'} - {self.invoice_no}"