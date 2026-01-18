from django.db import models
from django.contrib.auth.models import User

class Profile (models.Model):
    prouser=models.OneToOneField(User, on_delete=models.CASCADE)
    image=models.ImageField(upload_to='Profile_Images/', blank=True, null=True, verbose_name='Profile Picture')
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    designation = models.CharField(max_length=255, blank=True)
    about = models.TextField(blank=True)

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
    mobile=models.CharField(null=True, blank=True)
    gender=models.CharField(max_length=20, choices=gender, default=None)
    religion=models.ForeignKey(Religion, on_delete=models.CASCADE, null=True)
    date_of_birth=models.DateField(blank=True, null=True)
    birth_id=models.CharField(max_length=10, null=True, blank=True)
    guardian_name=models.CharField(max_length=100, blank=True, null=True)
    guardian_mobile=models.IntegerField(null=True, blank=True)
    active = models.BooleanField(default=True, blank=True)

    
    def __str__(self):
        return self.first_name
    
class EducationBoard(models.Model):
    Board_Name = models.CharField(max_length=100, null=True)

    def __str__(self):
        return self.Board_Name


class EducationQualification(models.Model):
    # চয়েসগুলো ক্লাসের ভেতরে রাখা ভালো
    EDUCATION_TYPES = [
        ("s", "SSC"),
        ("h", "HSC"),
        ("b", "Bachelor"),
        ("d", "Diploma"),
        ("m", "Masters"),
    ]
    
    GROUPS = [
        ("s", "Science"),
        ("a", "Arts"),
        ("c", "Commerce"),
        ("t", "Technical"),
        ("n", "Nursing"),
    ]

    student = models.ForeignKey(StudentPersonal, on_delete=models.CASCADE)
    education_type = models.CharField(choices=EDUCATION_TYPES, max_length=20)
    education_group = models.CharField(choices=GROUPS, max_length=20)
    course_name = models.CharField(max_length=100, null=True)
    institution_name = models.CharField(max_length=100, null=True)
    roll = models.IntegerField(null=True, blank=True)
    registration_no = models.IntegerField(null=True, blank=True)
    result = models.FloatField(null=True, blank=True)
    board = models.ForeignKey(EducationBoard, null=True, on_delete=models.CASCADE)

    def __str__(self):
        # স্টুডেন্টের নাম এবং শিক্ষার ধরন একসাথে দেখানোর সঠিক পদ্ধতি
        return f"{self.student.first_name} - {self.get_education_type_display()}"
    
class Country(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

class Division(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

class District(models.Model):
    division = models.ForeignKey(Division, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name
    
class Upazilla (models.Model):
    district = models.ForeignKey(District, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)

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

    def __str__(self):
        return self.student.first_name

class Program(models.Model):
    Program_Name=models.CharField(max_length=100, null=True, verbose_name='Program_Name')
    Program_Code=models.CharField(max_length=100, null=True, verbose_name='Program_Code')
    def __str__(self):
        return self.Program_Name
    
class Session(models.Model):
    Session_Name=models.CharField(max_length=100, null=True, verbose_name='Session_Name')
    Session_Code=models.CharField(max_length=100, null=True, verbose_name='Session_Code')
    def __str__(self):
        return self.Session_Name

class StudentAdmission(models.Model):
    student = models.ForeignKey(StudentPersonal, on_delete=models.CASCADE)
    Program_Name=models.ForeignKey(Program, on_delete=models.CASCADE, null=True)
    Date_of_admission=models.DateField(blank=True, null=True)
    Session=models.ForeignKey(Session, on_delete=models.CASCADE, null=True)
    student_id_no=models.CharField(max_length=200, unique=True, editable=False)
    Admission_roll=models.IntegerField(null=True)
    test_score=models.IntegerField(null=True)
    merit_score=models.IntegerField(null=True)
    merit_position=models.IntegerField(null=True)

    def save(self, *args, **kwargs):
        if not self.student_id_no:
            last_entry = StudentAdmission.objects.filter(
                Program_Name=self.Program_Name,
                Session=self.Session
            ).order_by('-id').first()
            if last_entry and last_entry.student_id_no:
                last_number = int(last_entry.student_id_no.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1

            self.student_id_no = f"{self.Program_Name.Program_Code}-{self.Session.Session_Code}-{new_number:04d}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.student.first_name

class PaymentHead(models.Model):
    type = [
        ("1","Instituional Payment"),
        ("2","External Payment")
        ]
    head_code = models.CharField(max_length=10,  unique=True)
    head_name=models.CharField(max_length=100, unique=True)
    opening_date=models.DateField(blank=True, null=True)
    headType=models.CharField(choices=type, null=True)
  
    def __str__(self):
        return self.head_name
    
class PaymentContact(models.Model):
    type = [
        ("1","One Time"),
        ("2","Monthy"),
        ("3","Semester"),
        ("4","Yearly"),
        ("5","Quarterly"),
        ("6","Half Yearly"),
        ("7","Anytime"),
    ]
    student = models.ForeignKey(StudentPersonal, on_delete=models.CASCADE)
    paymentHead=models.ForeignKey(PaymentHead, on_delete=models.CASCADE)
    contact_date=models.DateField()
    paymentType=models.CharField(choices=type, max_length=50)
    amount=models.PositiveIntegerField(null=True)
  
    def __str__(self):
        return self.student.first_name and self.paymentHead.head_name
