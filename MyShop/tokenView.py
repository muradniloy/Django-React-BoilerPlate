from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .authenticate import CustomAuthentication 
from rest_framework.response import Response

@method_decorator(csrf_exempt, name='dispatch')
class MyTokenView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access = response.data.get('access')
            refresh = response.data.get('refresh')

            # Access Token Cookie
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
            )
            # Refresh Token Cookie
            response.set_cookie(
                key='refresh',
                value=refresh,
                expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                httponly=True,
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
            )
            # সিকিউরিটির জন্য বডি থেকে টোকেন মুছে ফেলা
            del response.data['access']
            del response.data['refresh']
            response.data['message'] = "Login Success"
        return response
    

class MyTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # কুকি থেকে রিফ্রেশ টোকেন নেওয়া
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token:
            data = request.data.copy()
            data['refresh'] = refresh_token
            serializer = self.get_serializer(data=data)
            
            try:
                serializer.is_valid(raise_exception=True)
                response = Response(serializer.validated_data, status=status.HTTP_200_OK)
                # নতুন এক্সেস টোকেন কুকিতে সেট করা
                response.set_cookie(
                    'access_token', 
                    serializer.validated_data['access'],
                    httponly=True, secure=True, samesite='Lax'
                )
                return response
            except Exception:
                return Response({"detail": "Invalid token"}, status=400)
        
        return Response({"detail": "Refresh token not found"}, status=400)

