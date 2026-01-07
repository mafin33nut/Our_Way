from django.db import models from django.conf import settings

User = settings.AUTH_USER_MODEL

class Character(models.Model): user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="character") name = models.CharField(max_length=100) level = models.PositiveIntegerField(default=1) experience = models.PositiveIntegerField(default=0) next_level_exp = models.PositiveIntegerField(default=100)

class Meta:
    verbose_name = "Character"
    verbose_name_plural = "Characters"

def gain_exp(self, amount: int):
    if amount <= 0:
        return
    self.experience += amount
    while self.experience >= self.next_level_exp:
        self.experience -= self.next_level_exp
        self.level += 1
        self.next_level_exp = int(self.next_level_exp * 1.5)
    self.save()

    def to_dict(self):
    return {
        "name": self.name,
        "level": self.level,
        "experience": self.experience,
        "next_level_exp": self.next_level_exp,
    }

def str(self):
    return f"{self.name} (Lvl {self.level})"
class Skill(models.Model): name = models.CharField(max_length=100, unique=True) description = models.TextField(blank=True) characters = models.ManyToManyField(Character, related_name="skills", through="CharacterSkill")

class Meta:
    verbose_name = "Skill"
    verbose_name_plural = "Skills"

def str(self):
    return self.name
class CharacterSkill(models.Model): character = models.ForeignKey(Character, on_delete=models.CASCADE) skill = models.ForeignKey(Skill, on_delete=models.CASCADE) level = models.PositiveIntegerField(default=1)

class Meta:
    unique_together = ("character", "skill")

    def str(self):
    return f"{self.character.name} - {self.skill.name} (Lvl {self.level})"
class Quest(models.Model): title = models.CharField(max_length=200) description = models.TextField(blank=True) experience_reward = models.PositiveIntegerField(default=50) is_completed = models.BooleanField(default=False) created_at = models.DateTimeField(auto_now_add=True) due_date = models.DateTimeField(null=True, blank=True) participants = models.ManyToManyField(Character, related_name="quests", blank=True)

class Meta:
    verbose_name = "Quest"
    verbose_name_plural = "Quests"

def complete(self, character: Character):
    if not self.is_completed:
        self.is_completed = True
        self.participants.add(character)
        character.gain_exp(self.experience_reward)
        self.save()

def to_dict(self):
    return {
        "title": self.title,
        "description": self.description,
        "experience_reward": self.experience_reward,
        "is_completed": self.is_completed,
        "created_at": self.created_at.isoformat(),
        "due_date": self.due_date.isoformat() if self.due_date else None,
    }

    def str(self):
    return self.title
class InventoryItem(models.Model): name = models.CharField(max_length=100) description = models.TextField(blank=True) value = models.PositiveIntegerField(default=0)

class Meta:
    verbose_name = "Inventory Item"
    verbose_name_plural = "Inventory Items"

def str(self):
    return self.name
class CharacterInventory(models.Model): character = models.ForeignKey(Character, on_delete=models.CASCADE, related_name="inventory") item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE) quantity = models.PositiveIntegerField(default=1)

class Meta:
    unique_together = ("character", "item")

def str(self):
    return f"{self.character.name} x{self.quantity} - {self.item.name}"
class Achievement(models.Model): code = models.CharField(max_length=100, unique=True) name = models.CharField(max_length=200) description = models.TextField(blank=True) achieved_by = models.ManyToManyField(Character, related_name="achievements", blank=True) points = models.PositiveIntegerField(default=10) created_at = models.DateTimeField(auto_now_add=True)

class Meta:
    verbose_name = "Achievement"
    verbose_name_plural = "Achievements"

    def grant_for(self, character: Character):
    if not self.achieved_by.filter(pk=character.pk).exists():
        self.achieved_by.add(character)
        character.gain_exp(self.points)

def to_dict(self):
    return {
        "code": self.code,
        "name": self.name,
        "description": self.description,
        "points": self.points,
        "achieved_by": [c.name for c in self.achieved_by.all()],
    }

def str(self):
    return self.name