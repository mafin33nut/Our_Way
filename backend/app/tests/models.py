import pytest
from app.models import Character

@pytest.mark.django_db
def test_gain_experience_and_level_up():
    c = Character.objects.create(name="Edge", hero_class="Warrior", level=1, experience=0)
    # до попадения в следующую волну опыта
    next_exp = c.next_level_exp
    c.gain_experience(next_exp)
    assert c.level >= 2
    assert c.experience < next_exp