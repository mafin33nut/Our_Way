from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0004_friendship_delete_samplemodel'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_daily_login_email',
            field=models.DateField(blank=True, null=True),
        ),
    ]
