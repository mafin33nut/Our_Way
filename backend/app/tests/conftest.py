import pytest
from django.urls import reverse
from app.models import Character

@pytest.fixture
def api_client(client):
    return client

@pytest.fixture
def sample_character():
    return Character.objects.create(name="Arin", hero_class="Warrior", level=1, experience=0)

@pytest.fixture
def sample_characters(db):
    c1 = Character.objects.create(name="Lira", hero_class="Mage", level=2, experience=150)
    c2 = Character.objects.create(name="Trek", hero_class="Rogue", level=1, experience=20)
    return [c1, c2]