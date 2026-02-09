from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from .models import FriendRequest, Friendship, User
from .serializers import FriendRequestSerializer, UserSerializer

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


class FriendRequestViewSet(viewsets.ModelViewSet):
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        direction = self.request.query_params.get('direction', 'incoming')
        status_param = self.request.query_params.get('status')

        qs = FriendRequest.objects.all()
        if direction == 'outgoing':
            qs = qs.filter(from_user=self.request.user)
        elif direction == 'all':
            qs = qs.filter(Q(from_user=self.request.user) | Q(to_user=self.request.user))
        else:
            qs = qs.filter(to_user=self.request.user)

        if status_param:
            qs = qs.filter(status=status_param)

        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        to_user_id = request.data.get('to_user') or request.data.get('user_id')
        if not to_user_id:
            return Response({'detail': 'to_user is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            to_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if to_user == request.user:
            return Response({'detail': 'Cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)

        already_friends = Friendship.objects.filter(user=request.user, friend=to_user).exists()
        if already_friends:
            return Response({'detail': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)

        existing = FriendRequest.objects.filter(
            Q(from_user=request.user, to_user=to_user) | Q(from_user=to_user, to_user=request.user),
            status=FriendRequest.STATUS_PENDING,
        ).first()
        if existing:
            return Response({'detail': 'Friend request already exists'}, status=status.HTTP_400_BAD_REQUEST)

        friend_request = FriendRequest.objects.create(from_user=request.user, to_user=to_user)
        return Response(self.get_serializer(friend_request).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        fr = self.get_object()
        if fr.to_user != request.user:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        if fr.status != FriendRequest.STATUS_PENDING:
            return Response({'detail': 'Request is not pending'}, status=status.HTTP_400_BAD_REQUEST)

        # Create mutual friendships (idempotent).
        Friendship.objects.get_or_create(user=fr.from_user, friend=fr.to_user)
        Friendship.objects.get_or_create(user=fr.to_user, friend=fr.from_user)

        fr.accept()
        return Response(self.get_serializer(fr).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        fr = self.get_object()
        if fr.to_user != request.user:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        if fr.status != FriendRequest.STATUS_PENDING:
            return Response({'detail': 'Request is not pending'}, status=status.HTTP_400_BAD_REQUEST)

        fr.reject()
        return Response(self.get_serializer(fr).data)


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
        # Backward-compatible endpoint: POST /api/friends/ now sends a friend request.
        to_user_id = request.data.get('user_id')
        if not to_user_id:
            return Response({'detail': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            to_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if to_user == request.user:
            return Response({'detail': 'Cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)

        if Friendship.objects.filter(user=request.user, friend=to_user).exists():
            return Response({'detail': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)

        existing = FriendRequest.objects.filter(
            Q(from_user=request.user, to_user=to_user) | Q(from_user=to_user, to_user=request.user),
            status=FriendRequest.STATUS_PENDING,
        ).first()
        if existing:
            return Response({'detail': 'Friend request already exists'}, status=status.HTTP_400_BAD_REQUEST)

        FriendRequest.objects.create(from_user=request.user, to_user=to_user)
        return Response({'detail': 'Friend request sent'}, status=status.HTTP_201_CREATED)
