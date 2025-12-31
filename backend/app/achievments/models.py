class Achievement(models.Model):
    """
    Э achievement, которые можно получить за выполнение квестов/действий.
    """
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    achieved_by = models.ManyToManyField(Character, related_name="achievements", blank=True)
    points = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Achievement"
        verbose_name_plural = "Achievements"

    def grant_for(self, character: Character):
        if not self.achieved_by.filter(pk=character.pk).exists():
            self.achieved_by.add(character)
            # простая логика: даем бонус очков опыта
            character.gain_exp(self.points)

    def to_dict(self):
        return {
            "code": self.code,
            "name": self.name,
            "description": self.description,
            "points": self.points,
            "achieved_by": [c.name for c in self.achieved_by.all()],
        }

    def __str__(self):
        return self.name