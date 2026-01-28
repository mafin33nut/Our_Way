import pytest
from app.services import create_character, get_character, update_character, delete_character, list_characters
from app.models import Character

@pytest.mark.django_db
def test_crud_services():
    ch = create_character("Nova", "Cleric", initial_exp=0)
    assert ch.name == "Nova"
    assert ch.level == 1

    fetched = get_character(ch.id)
    assert fetched.id == ch.id

    updated = update_character(ch.id, name="Nova Prime")
    assert updated.name == "Nova Prime"

    all_chars = list_characters()
    assert len(all_chars) >= 1

    ok = delete_character(ch.id)
    assert ok
    assert get_character(ch.id) is None