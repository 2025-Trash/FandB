from rest_framework import serializers
from .models import TreeEvent, PersonalTree, GlobalStats

class TreeEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreeEvent
        fields = ("delta", "reason")

class PersonalTreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalTree
        fields = ("total", "updated_at")

class GlobalStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalStats
        fields = ("total_trees", "updated_at")
