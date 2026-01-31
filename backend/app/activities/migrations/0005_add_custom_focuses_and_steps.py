from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('activities', '0004_add_quest_state_fields'),
        ('activities', '0004_remove_activity_activities_activity_created_at_idx_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserFocus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='focuses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['name'],
                'unique_together': {('user', 'name')},
            },
        ),
        migrations.AddField(
            model_name='quest',
            name='is_custom',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='quest',
            name='focuses',
            field=models.ManyToManyField(blank=True, related_name='quests', to='activities.userfocus'),
        ),
        migrations.CreateModel(
            name='QuestStep',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('completed', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('quest', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='steps', to='activities.quest')),
            ],
            options={
                'ordering': ['order', 'id'],
            },
        ),
    ]
