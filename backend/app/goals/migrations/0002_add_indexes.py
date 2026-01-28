from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('goals', '0001_initial'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='goal',
            index=models.Index(fields=['-created_at'], name='goals_goal_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='usergoalprogress',
            index=models.Index(fields=['-updated_at'], name='goals_userprogress_updated_idx'),
        ),
    ]