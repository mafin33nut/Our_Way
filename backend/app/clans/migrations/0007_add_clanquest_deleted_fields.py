from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('clans', '0006_add_clanquest_participants'),
    ]

    operations = [
        migrations.AddField(
            model_name='clanquest',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clanquest',
            name='deleted_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.deletion.SET_NULL,
                related_name='deleted_clan_quests',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
