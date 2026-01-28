from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subject', models.CharField(max_length=255)),
                ('body', models.TextField()),
                ('scheduled_for', models.DateTimeField()),
                ('sent', models.BooleanField(default=False)),
                ('sent_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='email_notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-scheduled_for'],
            },
        ),
        migrations.AddIndex(
            model_name='emailnotification',
            index=models.Index(fields=['scheduled_for'], name='notifications_email_scheduled_idx'),
        ),
        migrations.AddIndex(
            model_name='emailnotification',
            index=models.Index(fields=['sent'], name='notifications_email_sent_idx'),
        ),
    ]