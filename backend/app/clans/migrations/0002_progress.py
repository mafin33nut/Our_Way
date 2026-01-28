from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('clans', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='clanquest',
            name='required_progress',
            field=models.PositiveIntegerField(default=100),
        ),
        migrations.AddField(
            model_name='clanquest',
            name='total_progress',
            field=models.PositiveIntegerField(default=0),
        ),
    ]