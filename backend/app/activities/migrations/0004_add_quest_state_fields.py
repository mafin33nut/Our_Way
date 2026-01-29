from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('activities', '0003_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='quest',
            name='duration_minutes',
            field=models.PositiveIntegerField(default=60),
        ),
        migrations.AddField(
            model_name='quest',
            name='accepted_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='quest',
            name='expires_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='quest',
            name='deleted_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
