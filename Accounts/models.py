from MyShop.models import *
from simple_history.models import HistoricalRecords
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models, transaction
from decimal import Decimal

class Account(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('cash', 'Cash In Hand'),
        ('bank', 'Bank Account'),
        ('mobile_banking', 'Mobile Banking'),
    ]

    account_name = models.CharField(max_length=255, verbose_name="Account Title")
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='cash')
    
    # ব্যাংক ডিটেইলস (এগুলো ব্ল্যাংক থাকতে পারে, তাই default="" দেওয়া হয়েছে)
    bank_name = models.CharField(max_length=255, blank=True, default="")
    account_number = models.CharField(max_length=50, blank=True, default="")
    branch = models.CharField(max_length=100, blank=True, default="")
    
    # ব্যালেন্স ট্র্যাকিং (সর্বদাই Decimal বা 0.00 থাকবে)
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.account_name} ({self.current_balance})"

class AccountTransaction(models.Model):
    TRANSACTION_TYPES = [('income', 'Income/Credit'), ('expense', 'Expense/Debit')]
    PAYMENT_METHODS = [('cash', 'Cash'), ('cheque', 'Cheque'), ('transfer', 'Bank Transfer'), ('mobile', 'Mobile Banking')]
    
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='all_transactions')
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    
    # প্রিভিয়াস এবং নিউ ব্যালেন্স (Null problem ঠেকাতে default=0.00)
    previous_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), editable=False)
    new_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), editable=False)
    
    reference_no = models.CharField(max_length=50, verbose_name="Invoice/PO Number", default="N/A")
    purpose = models.CharField(max_length=255, blank=True, default="")
    note = models.TextField(blank=True, default="")
    
    transaction_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-transaction_date']

    def save(self, *args, **kwargs):
        # যদি এটি নতুন ট্রানজেকশন হয় (pk নেই)
        if not self.pk:
            with transaction.atomic():
                # একাউন্ট অবজেক্টটি লক করে নেওয়া যাতে অন্য কেউ একই সাথে আপডেট না করে
                account = Account.objects.select_for_update().get(pk=self.account.pk)
                
                # আগের ব্যালেন্স সেট করা
                self.previous_balance = account.current_balance
                
                # ক্যালকুলেশন (Decimal format নিশ্চিত করা হয়েছে)
                if self.transaction_type == 'income':
                    account.current_balance += Decimal(str(self.amount))
                else:
                    account.current_balance -= Decimal(str(self.amount))
                
                # নতুন ব্যালেন্স সেট করা
                self.new_balance = account.current_balance
                
                # একাউন্ট আপডেট করা
                account.save()
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference_no} - {self.transaction_type} ({self.amount})"
    
class Customer(models.Model):
    # বেসিক ইনফরমেশন
    full_name = models.CharField(max_length=255, verbose_name="Customer Name")
    phone_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    # আইডি বা রেফারেন্স (যেমন: Student ID)
    customer_id = models.CharField(max_length=50, unique=True, verbose_name="ID Number")
    
    # ফিন্যান্সিয়াল ট্র্যাকিং
    total_receivable = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, help_text="Total money to be collected")
    total_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    current_due = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.full_name} - {self.customer_id}"
    

    def save(self, *args, **kwargs):
        # অটোমেটিক ডিউ ক্যালকুলেশন
        self.current_due = self.total_receivable - self.total_paid
        super().save(*args, **kwargs)


class ProductCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    UNIT_CHOICES = [
        ('pcs', 'Pieces'),
        ('kg', 'Kilogram'),
        ('ltr', 'Liter'),
        ('box', 'Box'),
    ]

    name = models.CharField(max_length=255, verbose_name="Product Name")
    sku = models.CharField(max_length=50, unique=True, verbose_name="SKU/Code")
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, related_name='products')
    
    # প্রাইসিং এবং স্টক
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    initial_stock = models.PositiveIntegerField(default=0)
    current_stock = models.PositiveIntegerField(default=0)
    
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='pcs')
    alert_quantity = models.PositiveIntegerField(default=5, help_text="Low stock alert limit")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.name} ({self.sku})"

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"

class PurchaseOrder(models.Model):
    PURCHASE_STATUS = [
        ('pending', 'Pending'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled'),
    ]

    po_number = models.CharField(max_length=50, unique=True, verbose_name="PO Number")
    # সাপ্লায়ার হিসেবে আপনি Customer মডেল বা আলাদা Vendor মডেল ব্যবহার করতে পারেন
    supplier = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='purchases')
    
    # আপনার রিকোয়েস্ট অনুযায়ী অ্যাকাউন্ট ফরেন কি
    payment_account = models.ForeignKey(
        Account, 
        on_delete=models.PROTECT, 
        related_name='purchase_payments',
        verbose_name="Paid From (Account)"
    )
    
    order_date = models.DateField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    due_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=15, choices=PURCHASE_STATUS, default='pending')
    note = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        # ডিউ ক্যালকুলেশন
        self.due_amount = self.total_amount - self.paid_amount
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.po_number} - {self.supplier.full_name}"

class PurchaseItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)

