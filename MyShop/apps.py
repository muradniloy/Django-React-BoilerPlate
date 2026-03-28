from django.apps import AppConfig


class MyshopConfig(AppConfig):
    name = 'MyShop'

def ready(self):
    import Accounts.signals