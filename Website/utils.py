import requests

def send_sms_gate(mobile, message):
    """
    Common function to send SMS via sms.net.bd
    """
    payload = {
        'api_key': 'YOUR_API_KEY_HERE', # আপনার অরিজিনাল কি এখানে দিন
        'msg': message, 
        'to': mobile
    }
    try:
        response = requests.post("https://api.sms.net.bd/sendsms", data=payload)
        return response.json()
    except Exception as e:
        print(f"SMS Gateway Error: {e}")
        return None