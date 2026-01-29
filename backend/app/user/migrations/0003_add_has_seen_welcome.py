from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('user', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='has_seen_welcome',
            field=models.BooleanField(default=False),
        ),
    ]
