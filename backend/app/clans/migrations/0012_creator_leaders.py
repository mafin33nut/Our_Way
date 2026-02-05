from django.db import migrations


def add_creator_leaders(apps, schema_editor):
    Clan = apps.get_model('clans', 'Clan')
    ClanMember = apps.get_model('clans', 'ClanMember')

    for clan in Clan.objects.all():
        if not clan.created_by_id:
            continue
        member, created = ClanMember.objects.get_or_create(
            clan_id=clan.id,
            user_id=clan.created_by_id,
            defaults={'role': 'leader'},
        )
        if not created and member.role != 'leader':
            member.role = 'leader'
            member.save(update_fields=['role'])


class Migration(migrations.Migration):
    dependencies = [
        ('clans', '0011_add_clan_privacy_join_requests_messages'),
    ]

    operations = [
        migrations.RunPython(add_creator_leaders, migrations.RunPython.noop),
    ]
