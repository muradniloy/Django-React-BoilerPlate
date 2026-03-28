from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import *
import django_filters
from .models import AccountTransaction

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import AccountTransaction
from .serializers import AccountTransactionSerializer

class AccountTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AccountTransaction.objects.all().order_by('-transaction_date')
    serializer_class = AccountTransactionSerializer
    
    # এই তিনটি ব্যাকএন্ড আপনার ইউআরএল প্যারামিটারগুলোকে হ্যান্ডেল করবে
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # কোন কোন ফিল্ডে সরাসরি ফিল্টার করা যাবে
    filterset_fields = {
        'account': ['exact'],
        'transaction_type': ['exact'],
        'payment_method': ['exact'],
        'transaction_date': ['gte', 'lte'], # ইউআরএল-এ date__gte=... হিসেবে কাজ করবে
    }
    
    # সার্চ বারের জন্য
    search_fields = ['reference_no', 'purpose', 'account__account_name']