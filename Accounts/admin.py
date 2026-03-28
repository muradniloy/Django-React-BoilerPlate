from django.contrib import admin
from .models import *
from django.contrib import admin
from .models import Account, AccountTransaction

# Register your models here.
admin.site.register(PurchaseOrder)


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    # লিস্টে যা যা দেখাবে
    list_display = ('account_name', 'account_type', 'current_balance', 'is_active', 'updated_at')
    # ক্লিক করলে এডিট পেজে যাবে
    list_display_links = ('account_name',)
    # ফিল্টার করার অপশন
    list_filter = ('account_type', 'is_active')
    # সার্চ অপশন
    search_fields = ('account_name', 'bank_name', 'account_number')
    # ব্যালেন্স এডিট করা রিস্কি, তাই রিড অনলি রাখা ভালো
    readonly_fields = ('current_balance',)

@admin.register(AccountTransaction)
class AccountTransactionAdmin(admin.ModelAdmin):
    # লিস্ট ভিউতে ব্যালেন্স ট্র্যাকিং দেখানোর ব্যবস্থা
    list_display = (
        'reference_no', 
        'account', 
        'transaction_type', 
        'amount', 
        'previous_balance', 
        'new_balance', 
        'transaction_date'
    )
    
    # ইনভয়েস নম্বর বা একাউন্ট দিয়ে সার্চ
    search_fields = ('reference_no', 'account__account_name', 'purpose')
    
    # ফিল্টার অপশন
    list_filter = ('transaction_type', 'payment_method', 'account')
    
    # ফর্মের ভেতর এই ফিল্ডগুলো রিড-অনলি হিসেবে দেখাবে
    readonly_fields = ('previous_balance', 'new_balance', 'transaction_date')

    # ফর্মের লেআউট সাজানো (ঐচ্ছিক কিন্তু সুন্দর দেখায়)
    fieldsets = (
        ('Basic Information', {
            'fields': ('account', 'reference_no', 'transaction_type', 'amount', 'payment_method')
        }),
        ('Balance Snapshots', {
            'fields': ('previous_balance', 'new_balance'),
            'description': 'These balances are automatically calculated and cannot be edited.'
        }),
        ('Additional Details', {
            'fields': ('purpose', 'note', 'created_by', 'transaction_date')
        }),
    )
