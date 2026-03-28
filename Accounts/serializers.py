from rest_framework import serializers
from .models import AccountTransaction

class AccountTransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.ReadOnlyField(source='account.account_name')
    account_type = serializers.ReadOnlyField(source='account.get_account_type_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        model = AccountTransaction
        fields = '__all__'