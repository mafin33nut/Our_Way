from rest_framework import serializers 
from .models import User
class UserSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = User 
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio']


    password2 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id','username','email','first_name','last_name','bio','level','xp','xp_to_next_level','total_quests_completed','current_focus','password','password2']
        read_only_fields = ['id','level','xp','xp_to_next_level','total_quests_completed']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'avatar',
            'password', 'password2',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        p = attrs.get('password')
        p2 = attrs.get('password2')
        if p or p2:
            if p != p2:
                raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()
        return instance