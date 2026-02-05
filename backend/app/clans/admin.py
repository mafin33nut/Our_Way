from django.contrib import admin

from .models import (
    Clan,
    ClanJoinRequest,
    ClanMember,
    ClanMessage,
    ClanQuest,
    ClanQuestParticipant,
)


@admin.register(ClanMember)
class ClanMemberAdmin(admin.ModelAdmin):
    list_display = ("clan", "user", "role", "joined_at")
    list_filter = ("role", "joined_at")
    search_fields = ("clan__name", "user__username", "user__email")


@admin.register(ClanJoinRequest)
class ClanJoinRequestAdmin(admin.ModelAdmin):
    list_display = ("clan", "user", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("clan__name", "user__username", "user__email")


@admin.register(ClanMessage)
class ClanMessageAdmin(admin.ModelAdmin):
    list_display = ("clan", "user", "short_content", "created_at")
    list_filter = ("created_at", "clan")
    search_fields = ("clan__name", "user__username", "content")

    def short_content(self, obj):
        return (obj.content or "")[:60]
    short_content.short_description = "content"


@admin.register(ClanQuest)
class ClanQuestAdmin(admin.ModelAdmin):
    list_display = ("title", "clan", "difficulty", "completed", "created_at")
    list_filter = ("difficulty", "completed", "created_at")
    search_fields = ("title", "clan__name")


@admin.register(ClanQuestParticipant)
class ClanQuestParticipantAdmin(admin.ModelAdmin):
    list_display = ("quest", "user", "contribution", "contributed_at")
    list_filter = ("contributed_at",)
    search_fields = ("quest__title", "user__username", "user__email")
