from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clans', '0002_progress'),
    ]

    operations = [
        migrations.RenameField(
            model_name='clanquest',
            old_name='points',
            new_name='xp_reward',
        ),
        migrations.RenameField(
            model_name='clanquest',
            old_name='due_date',
            new_name='expires_at',
        ),
        migrations.AddField(
            model_name='clanquest',
            name='difficulty',
            field=models.CharField(choices=[('epic', 'Epic'), ('legendary', 'Legendary')], default='epic', max_length=20),
        ),
        migrations.AddField(
            model_name='clanquest',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True, blank=True),
        ),
        migrations.CreateModel(
            name='LeaderboardEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.BigIntegerField(db_index=True, default=0)),
                ('rank', models.PositiveIntegerField(blank=True, db_index=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('clan', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='leaderboard', to='clans.clan')),
            ],
            options={
                'verbose_name': 'Leaderboard entry',
                'verbose_name_plural': 'Leaderboard entries',
                'ordering': ['-score', 'rank'],
            },
        ),
        migrations.AddIndex(
            model_name='leaderboardentry',
            index=models.Index(fields=['-score'], name='clans_lead_score_idx'),
        ),
        migrations.AddIndex(
            model_name='leaderboardentry',
            index=models.Index(fields=['rank'], name='clans_lead_rank_idx'),
        ),
    ]
