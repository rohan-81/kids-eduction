from django.contrib import admin
from .models import AvatarItem, ChildAvatar, GardenPlant

@admin.register(AvatarItem)
class AvatarItemAdmin(admin.ModelAdmin):
    list_display = ('item_id', 'name', 'item_type', 'icon', 'price_coins', 'is_premium', 'is_active')
    search_fields = ('item_id', 'name')
    list_filter = ('item_type', 'is_premium', 'is_active')

@admin.register(ChildAvatar)
class ChildAvatarAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'base_avatar', 'equipped_hat', 'equipped_glasses', 'equipped_outfit', 'equipped_backpack', 'updated_at')
    search_fields = ('child_profile__nickname',)

@admin.register(GardenPlant)
class GardenPlantAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'slot_index', 'plant_type', 'stage', 'water_count', 'sun_count', 'last_watered')
    list_filter = ('stage', 'plant_type')
    search_fields = ('child_profile__nickname',)
