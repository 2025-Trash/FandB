from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class TreeEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tree_events")
    delta = models.IntegerField()                    # +면 증가, -면 감소
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

class PersonalTree(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="personal_tree")
    total = models.IntegerField(default=0)           # 개인 총 나무 수(누계)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}: {self.total}"

class GlobalStats(models.Model):
    # 단일 레코드로 사용 (pk=1)
    total_trees = models.IntegerField(default=0)     # 전체 누적 나무 수(누계)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"total_trees={self.total_trees}"
