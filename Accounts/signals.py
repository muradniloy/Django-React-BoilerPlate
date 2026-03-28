from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import *
from MyShop.models import StudentPayment

@receiver(post_save, sender=StudentPayment)
def handle_payment_approval(sender, instance, created, **kwargs):
    # চেক করছি পেমেন্টটি অ্যাপ্রুভড কি না এবং অলরেডি ট্রানজ্যাকশন হয়েছে কি না
    if instance.payment_approved:
        # ডুপ্লিকেট ট্রানজ্যাকশন এড়াতে চেক
        transaction_exists = AccountTransaction.objects.filter(
            reference_no=instance.invoice_no, 
            transaction_type='income'
        ).exists()

        if not transaction_exists and instance.account:
            # ১. AccountTransaction এ রেকর্ড তৈরি
            # আপনি চেয়েছিলেন purpose হবে inv.all_heads (আমরা এখানে স্ট্রিং হিসেবে নিচ্ছি)
            # signals.py এর ২০ নম্বর লাইনটি এভাবে আপডেট করুন:

            purpose_text = f"Fees: {getattr(instance.fees, 'head_name', 'Student Payment')}"

            # অথবা যদি ফিল্ডের নাম 'head_name' না হয়ে অন্য কিছু হয় (যেমন 'fee_name'), তবে:
            # purpose_text = f"Fees: {instance.fees.fee_name if instance.fees else 'Student Payment'}"
            AccountTransaction.objects.create(
                account=instance.account,
                amount=instance.amount, # আপনার রিকোয়েস্ট অনুযায়ী invoice amount
                transaction_type='income',
                reference_no=instance.invoice_no,
                purpose=purpose_text,
                created_by=instance.approved_by # কে অ্যাপ্রুভ করলো
            )

            # ২. Account মডেলের current_balance আপডেট
            target_account = instance.account
            target_account.current_balance += instance.amount
            target_account.save()