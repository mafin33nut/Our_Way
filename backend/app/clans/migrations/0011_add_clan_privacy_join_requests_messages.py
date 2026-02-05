from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):
    dependencies = [
        ('clans', '0010_update_clanquest_difficulty'),
    ]

    operations = [
        migrations.AddField(
            model_name='clan',
            name='is_public',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='clan',
            name='join_password',
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.CreateModel(
            name='ClanJoinRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], db_index=True, default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('clan', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='join_requests', to='clans.clan')),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='clan_join_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('clan', 'user')},
            },
        ),
        migrations.CreateModel(
            name='ClanMessage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('clan', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='messages', to='clans.clan')),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='clan_messages', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
    ]
