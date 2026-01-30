from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('clans', '0005_alter_clan_created_at_alter_clanquest_created_at'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClanQuestParticipant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contribution', models.PositiveIntegerField(default=0)),
                ('contributed_at', models.DateTimeField(auto_now=True)),
                ('quest', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='participant_entries', to='clans.clanquest')),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='clan_quest_participations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('quest', 'user')},
            },
        ),
    ]
