from django.db import migrations, models
import django.db.models.deletion


def create_leaderboard_entry_if_not_exists(apps, schema_editor):
    connection = schema_editor.connection
    
    with connection.cursor() as cursor:
        if connection.vendor == 'sqlite':
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='clans_leaderboardentry'")
            table_exists = cursor.fetchone() is not None
        else:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'clans_leaderboardentry'
                );
            """)
            table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            if connection.vendor == 'sqlite':
                cursor.execute("""
                    CREATE TABLE clans_leaderboardentry (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        score BIGINT NOT NULL DEFAULT 0,
                        rank INTEGER NULL,
                        updated_at DATETIME NOT NULL,
                        clan_id INTEGER NOT NULL UNIQUE,
                        FOREIGN KEY (clan_id) REFERENCES clans_clan(id) ON DELETE CASCADE
                    )
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS clans_lead_score_idx ON clans_leaderboardentry(score DESC)")
                cursor.execute("CREATE INDEX IF NOT EXISTS clans_lead_rank_idx ON clans_leaderboardentry(rank)")
            else:
                cursor.execute("""
                    CREATE TABLE clans_leaderboardentry (
                        id BIGSERIAL PRIMARY KEY,
                        score BIGINT NOT NULL DEFAULT 0,
                        rank INTEGER NULL,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        clan_id INTEGER NOT NULL UNIQUE,
                        CONSTRAINT clans_leaderboardentry_clan_id_fkey 
                            FOREIGN KEY (clan_id) REFERENCES clans_clan(id) ON DELETE CASCADE
                    )
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS clans_lead_score_idx ON clans_leaderboardentry(score DESC)")
                cursor.execute("CREATE INDEX IF NOT EXISTS clans_lead_rank_idx ON clans_leaderboardentry(rank)")


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
        migrations.RunPython(
            lambda apps, schema_editor: create_leaderboard_entry_if_not_exists(apps, schema_editor),
            migrations.RunPython.noop
        ),
    ]
