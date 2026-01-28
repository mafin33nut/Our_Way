import pytest
from rest_framework.test import APIClient
from app.models import Character

@pytest.mark.django_db
def test_character_routes(api_client):
    client = APIClient()
    # create
    resp = client.post('/api/characters/', {'name': 'Zed', 'hero_class': 'Ranger', 'experience': 0}, format='json')
    assert resp.status_code == 201

    char_id = resp.data['id']
    # get
    resp = client.get(f'/api/characters/{char_id}/')
    assert resp.status_code == 200
    assert resp.data['name'] == 'Zed'

    # list
    resp = client.get('/api/characters/')
    assert resp.status_code == 200