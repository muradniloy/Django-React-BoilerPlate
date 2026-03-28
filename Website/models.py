from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from simple_history.models import HistoricalRecords
# MyShop অ্যাপ থেকে EmployeeProfile মডেল ইমপোর্ট করুন
from MyShop.models import EmployeeProfile , Program
import datetime



class NoticeCategory(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Category Name")
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="FontAwesome icon class (e.g. fa-book)")
    is_active = models.BooleanField(default=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name_plural = "Notice Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Notice(models.Model):
    category = models.ForeignKey(
        NoticeCategory, 
        on_delete=models.CASCADE, 
        related_name='notices',
        verbose_name="Notice Category"
    )
    title = models.CharField(max_length=255, verbose_name="Notice Title")
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    content = models.TextField(verbose_name="Notice Content")
    
    # ফাইল বা ডকুমেন্ট আপলোড (ঐচ্ছিক)
    attachment = models.FileField(upload_to='notices/', null=True, blank=True, verbose_name="Attachment (PDF/Image)")
    
    # তারিখ এবং সময়
    published_date = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateField(null=True, blank=True, help_text="Notice will be hidden after this date")
    
    important = models.BooleanField(default=False, verbose_name="Set Important:", null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()


    class Meta:
        ordering = ['-published_date'] # নতুন নোটিশ সবার আগে থাকবে
        verbose_name = "Notice"
        verbose_name_plural = "Notices"

    def __str__(self):
        return self.title

    # স্লাগ অটো-জেনারেট করার জন্য সেভ মেথড (ঐচ্ছিক)
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    


class ImportantLink(models.Model):
    title = models.CharField(max_length=100, help_text="লিঙ্কের নাম (যেমন: MyGov BD)")
    url = models.URLField(max_length=500, help_text="সম্পূর্ণ লিঙ্ক (https://...)")
    # SVG কোড সরাসরি টেক্সট হিসেবে সেভ করার জন্য TextField
    icon = models.ImageField(upload_to='important_links/', null=True, blank=True)
    svg_icon = models.TextField(null=True, blank=True, help_text="এখানে SVG <svg>...</svg> কোডটি পেস্ট করুন")
    priority = models.IntegerField(default=0, help_text="সিরিয়াল নম্বর (ছোট থেকে বড় সাজানো হবে)")
    is_active = models.BooleanField(default=True, help_text="টিক দেওয়া থাকলে সাইটে দেখাবে")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priority'] # অটোমেটিক প্রায়োরিটি অনুযায়ী সাজাবে

    def __str__(self):
        return self.title



class AdmissionQuery(models.Model):
    SOURCE_CHOICES = [
        ('website', 'Website'),
        ('facebook', 'Facebook'),
        ('whatsapp', 'WhatsApp'),
        ('phone', 'Phone Call'),
        ('walk_in', 'Walk-In'),
        ('reference', 'Reference'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('followed_up', 'Followed Up'),
        ('admitted', 'Converted/Admitted'),
        ('cancelled', 'Cancelled/Not Interested'),
    ]

    # স্টুডেন্ট বেসিক ইনফো
    student_name = models.CharField(max_length=150, verbose_name="Student Name")
    contact_no = models.CharField(max_length=20, verbose_name="Contact Number")
    email = models.EmailField(null=True, blank=True)
    
    # ঠিকানা ও এলাকা
    address = models.TextField(null=True, blank=True, help_text="বর্তমান ঠিকানা")
    city = models.CharField(max_length=100, null=True, blank=True, help_text="শহর/উপজেলা")
    
    # শিক্ষাগত তথ্য
    interest_program=models.ForeignKey(Program, on_delete=models.CASCADE)
    last_school_college = models.CharField(max_length=255, null=True, blank=True, help_text="পূর্ববর্তী শিক্ষা প্রতিষ্ঠান")
    
    # কোয়েরি ও স্ট্যাটাস
    query_message = models.TextField(verbose_name="Message/Query Details")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='website')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # ফলো-আপ ও এমপ্লয়ি এসাইনমেন্ট (Updated)
    next_follow_up_date = models.DateField(null=True, blank=True)
    
    # MyShop অ্যাপের EmployeeProfile মডেলের সাথে লিঙ্ক করা হলো
    assigned_to = models.ForeignKey(
        EmployeeProfile, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_admission_queries',
        verbose_name="Assigned Employee"
    )
    
    admin_note = models.TextField(null=True, blank=True, help_text="অফিসিয়াল মন্তব্য বা ফলো-আপ আপডেট")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Admission Query"
        verbose_name_plural = "Admission Queries"

    def __str__(self):
        return f"{self.student_name} - {self.status}"



# স্লাইডারটি কোথায় কোথায় দেখানো হবে তার জন্য একটি আলাদা মডেল
class SliderPosition(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="Example: Home Page, About Us, notice_page")
    slug = models.SlugField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class HomeSlider(models.Model):
    title = models.CharField(max_length=255, verbose_name="Slider Title")
    subtitle = models.TextField(max_length=500, null=True, blank=True, verbose_name="Subtitle / Description")
    image = models.ImageField(upload_to='sliders/', verbose_name="Slider Image")
    
    # ManyToManyField যুক্ত করা হলো
    positions = models.ManyToManyField(
        SliderPosition, 
        blank=True, 
        related_name="sliders",
        verbose_name="Display Locations"
    )
    
    active = models.BooleanField(default=True, verbose_name="Is Active")
    order = models.PositiveIntegerField(default=0, verbose_name="Display Order")
    
    button_text = models.CharField(max_length=50, null=True, blank=True, default="Learn More")
    button_url = models.CharField(max_length=255, null=True, blank=True, default="#")
    
    history = HistoricalRecords()

    class Meta:
        ordering = ['order']
        verbose_name = "Home Slider"
        verbose_name_plural = "Home Sliders"

    def __str__(self):
        return self.title
    

class OTPStorage(models.Model):
    mobile = models.CharField(max_length=15, unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        # ওটিপি ৫ মিনিটের জন্য বৈধ থাকবে
        return self.created_at >= timezone.now() - datetime.timedelta(minutes=5)

    def __str__(self):
        return f"OTP for {self.mobile} - {self.otp}"