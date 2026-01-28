from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

# Пример простых тестов: создание пользователя, логин, доступ к API целей

User = get_user_model()

class UserModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='tester',
            email='tester@example.com',
            password='testpass123'
        )
        self.client = APIClient()

    def test_create_user(self):
        self.assertIsNotNone(self.user)
        self.assertTrue(self.user.is_active)
        self.assertFalse(self.user.is_staff)

    def test_login(self):
        resp = self.client.post(reverse('token_obtain_pair'), {
            'username': 'tester',
            'password': 'testpass123'
        }, format='json')
        self.assertIn('access', resp.data)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

class GoalsAPITests(TestCase):
    def setUp(self):
        # Создаем пользователя и логинимся
        self.user = User.objects.create_user(
            username='goaler',
            email='goaler@example.com',
            password='goalerpass'
        )
        self.client = APIClient()
        # Предположим, у вас есть JWT или сессионная аутентификация
        resp = self.client.post(reverse('token_obtain_pair'), {
            'username': 'goaler',
            'password': 'goalerpass'
        }, format='json')
        token = resp.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Импортируем модель Goals, если она есть
        # from .goals.models import Goal
        # self.goal = Goal.objects.create(user=self.user, title='Read 10 pages', current_progress=0, target=10)

    def test_list_goals_requires_auth(self):
        # Пример: доступ к списку целей без авторизации должен быть запрещен
        self.client.force_authenticate(user=None)
        resp = self.client.get(reverse('goals-list'))
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_create_goal(self):
        payload = {'title': 'Достижение', 'target': 5}
        resp = self.client.post(reverse('goals-list'), payload, format='json')
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED, status.HTTP_202_ACCEPTED])