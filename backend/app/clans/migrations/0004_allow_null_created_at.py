from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('clans', '0003_add_missing_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clanquest',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True, blank=True),
        ),
    ]
