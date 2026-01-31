from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clans', '0007_add_clanquest_deleted_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='clanquest',
            name='max_participants',
            field=models.PositiveIntegerField(default=1),
        ),
    ]
