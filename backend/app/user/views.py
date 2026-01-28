from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta
from .models import User, Friendship
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet): 
    queryset = User.objects.all() 
    serializer_class = UserSerializer 
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(username__icontains=search)
        return queryset

class FriendsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        friendships = Friendship.objects.filter(user=request.user).select_related('friend')
        friends_data = []
        today = timezone.now().date()
        
        for friendship in friendships:
            friend = friendship.friend
            from app.activities.models import Quest
            quests_completed_today = Quest.objects.filter(
                user=friend,
                completed=True,
                completed_at__date=today
            ).count()
            
            friends_data.append({
                'id': friend.id,
                'username': friend.username,
                'level': getattr(friend, 'level', 1),
                'quests_completed_today': quests_completed_today,
                'is_online': False,
            })
        
        return Response(friends_data)

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'detail': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            friend = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if friend == request.user:
            return Response({'detail': 'Cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)
        
        friendship, created = Friendship.objects.get_or_create(
            user=request.user,
            friend=friend
        )
        
        if not created:
            return Response({'detail': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'detail': 'Friend added successfully'}, status=status.HTTP_201_CREATED)
