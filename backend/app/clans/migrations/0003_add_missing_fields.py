from django.db import migrations, models
import django.db.models.deletion


def migrate_clanquest_fields(apps, schema_editor):
    ClanQuest = apps.get_model('clans', 'ClanQuest')
    db_table = ClanQuest._meta.db_table
    connection = schema_editor.connection
    
    with connection.cursor() as cursor:
        if connection.vendor == 'sqlite':
            cursor.execute(f"PRAGMA table_info({db_table})")
            columns = {row[1]: row for row in cursor.fetchall()}
            
            if 'points' in columns and 'xp_reward' not in columns:
                cursor.execute(f"ALTER TABLE {db_table} RENAME COLUMN points TO xp_reward")
            elif 'xp_reward' not in columns:
                cursor.execute(f"ALTER TABLE {db_table} ADD COLUMN xp_reward INTEGER DEFAULT 20 NOT NULL")
            
            if 'due_date' in columns and 'expires_at' not in columns:
                cursor.execute(f"ALTER TABLE {db_table} RENAME COLUMN due_date TO expires_at")
            elif 'expires_at' not in columns:
                cursor.execute(f"ALTER TABLE {db_table} ADD COLUMN expires_at DATETIME NULL")
        else:
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = %s AND column_name IN ('points', 'xp_reward', 'due_date', 'expires_at')
            """, [db_table])
            existing_columns = {row[0] for row in cursor.fetchall()}
            
            if 'points' in existing_columns and 'xp_reward' not in existing_columns:
                cursor.execute(f'ALTER TABLE {db_table} RENAME COLUMN points TO xp_reward')
            elif 'xp_reward' not in existing_columns:
                cursor.execute(f'ALTER TABLE {db_table} ADD COLUMN xp_reward INTEGER DEFAULT 20 NOT NULL')
            
            if 'due_date' in existing_columns and 'expires_at' not in existing_columns:
                cursor.execute(f'ALTER TABLE {db_table} RENAME COLUMN due_date TO expires_at')
            elif 'expires_at' not in existing_columns:
                cursor.execute(f'ALTER TABLE {db_table} ADD COLUMN expires_at TIMESTAMP NULL')


class Migration(migrations.Migration):

    dependencies = [
        ('clans', '0002_progress'),
    ]

    operations = [
        migrations.RunPython(migrate_clanquest_fields, migrations.RunPython.noop),
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
