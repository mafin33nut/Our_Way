from django.urls import reverse from rest_framework.test import APITestCase from django.contrib.auth import get_user_model from app.activities.models import ActivityCategory, Activity
User = get_user_model()
class ActivitiesViewTests(APITestCase): def setUp(self): self.user = User.objects.create_user(username='apiuser', password='pass') self.client.login(username='apiuser', password='pass') self.cat = ActivityCategory.objects.create(name='Health')
def test_create_activity(self):
    url = reverse('activity-list')
    data = {'title': 'Morning run', 'category': self.cat.id, 'points': 20}
    resp = self.client.post(url, data, format='json')
    self.assertEqual(resp.status_code, 201)
    self.assertEqual(resp.data['title'], 'Morning run')

def test_start_stop_timer(self):
    # create activity
    act = Activity.objects.create(title='Focus session', owner=self.user, category=self.cat)
    start_url = reverse('activity-timer-list') + 'start/'
    resp = self.client.post(start_url, {'activity': act.id}, format='json')
    self.assertIn(resp.status_code, (200, 201))
    timer_id = resp.data['id']
    stop_url = reverse('activity-timer-detail', args=[timer_id]) + 'stop/'
    resp2 = self.client.post(stop_url, format='json')
    self.assertEqual(resp2.status_code, 200)
