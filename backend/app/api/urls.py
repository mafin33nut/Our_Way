from rest_framework.response import Response
from rest_framework import status

def success_response(data=None, message='OK', code=status.HTTP_200_OK):
    payload = {'status': 'ok', 'message': message}
    if data is not None:
        payload['data'] = data
    return Response(payload, status=code)

def error_response(message='Error', code=status.HTTP_400_BAD_REQUEST, details=None):
    payload = {'status': 'error', 'message': message}
    if details is not None:
        payload['details'] = details
    return Response(payload, status=code)