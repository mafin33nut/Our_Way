from typing import Dict from .models import Character, Quest from .serializers import CharacterSerializer, QuestSerializer

def get_api() -> Dict[str, object]: # пример единоразового экспорта API return { "Character": CharacterSerializer, "Quest": QuestSerializer, }