from django.contrib import admin
from .models import *
# Register your models here.


admin.site.register(Profile)
admin.site.register(StudentPersonal)
admin.site.register(StudentAddress)
admin.site.register(StudentAdmission)
admin.site.register(EducationQualification)
admin.site.register(Religion)
admin.site.register(EducationBoard)
admin.site.register(Program)
admin.site.register(Session)
admin.site.register(Country)
admin.site.register(Division)
admin.site.register(District)
admin.site.register(Upazilla)
admin.site.register(PaymentHead)
admin.site.register(MainHead)
admin.site.register(FeeRate)
admin.site.register(StudentPayment)
@admin.register(PaymentContact)
class PaymentContactAdmin(admin.ModelAdmin):
    # লিস্ট ভিউতে যা যা দেখাবে (কলামগুলো সাজানো)
    list_display = [
        'student_link', 'fee_head_display', 'paymentType_display', 
        'quantity', 'discount_display', 'final_amount_display', 'contact_date'
    ]
    
    # ফিল্টার করার সুবিধা
    list_filter = ['paymentType', 'discount_type', 'contact_date', 'fees__payment_head']
    
    # সার্চ বার (স্টুডেন্টের নাম বা আইডি দিয়ে সার্চ)
    search_fields = ['student__first_name', 'fees__payment_head__head_name']
    
    # ইনপুট ফর্মের লেআউট (সুন্দর করে সাজানো)
    fieldsets = (
        ('Basic Information', {
            'fields': (('student', 'fees', 'contact_date'),)
        }),
        ('Payment Configuration', {
            'fields': (('paymentType', 'quantity'),)
        }),
        ('Discount & Final Amount', {
            'fields': (('discount_type', 'discount_value'), 'amount'),
            'description': "Amount will be calculated automatically on save."
        }),
    )
    
    # amount ফিল্ডটি শুধু দেখার জন্য (যেহেতু এটি অটো ক্যালকুলেট হয়)
    readonly_fields = ['amount']

    # --- কাস্টম কলাম ডিসপ্লে ফাংশন ---

    def student_link(self, obj):
        return f"{obj.student.first_name} ({obj.student.id})"
    student_link.short_description = 'Student'

    def fee_head_display(self, obj):
        return obj.fees.payment_head.head_name if obj.fees else "-"
    fee_head_display.short_description = 'Fee Head'

    def paymentType_display(self, obj):
        return obj.get_paymentType_display()
    paymentType_display.short_description = 'Cycle'

    def discount_display(self, obj):
        if obj.discount_type == '2':
            return f"{obj.discount_value}%"
        return f"{obj.discount_value} TK"
    discount_display.short_description = 'Discount'

    def final_amount_display(self, obj):
        return f"৳ {obj.amount}"
    final_amount_display.short_description = 'Total Amount'



    
