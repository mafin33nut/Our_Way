from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0001_initial'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='activity',
            index=models.Index(fields=['-created_at'], name='activities_activity_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['-created_at'], name='activities_activitylog_created_at_idx'),
        ),
    ]