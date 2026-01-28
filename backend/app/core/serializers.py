from rest_framework import serializers 
from .models import CoreSetting
class CoreSettingSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = CoreSetting 
        fields = ['id', 'key', 'value']
