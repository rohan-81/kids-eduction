from rest_framework import serializers
from .models import AvatarItem, ChildAvatar, GardenPlant

class AvatarItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvatarItem
        fields = [
            'item_id',
            'name',
            'item_type',
            'icon',
            'price_coins',
            'is_premium',
            'is_active',
        ]


class ChildAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildAvatar
        fields = [
            'child_profile',
            'base_avatar',
            'equipped_hat',
            'equipped_glasses',
            'equipped_outfit',
            'equipped_backpack',
            'unlocked_items',
            'updated_at',
        ]


class GardenPlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = GardenPlant
        fields = [
            'id',
            'child_profile',
            'slot_index',
            'plant_type',
            'stage',
            'water_count',
            'sun_count',
            'last_watered',
            'planted_at',
        ]
