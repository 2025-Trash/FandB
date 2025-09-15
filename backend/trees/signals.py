from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import F
from .models import TreeEvent, PersonalTree, GlobalStats

@receiver(post_save, sender=TreeEvent)
def update_counters_on_event_create(sender, instance, created, **kwargs):
    if not created:
        return
    # 개인 카운터 갱신 (원자적 갱신)
    pt, created_pt = PersonalTree.objects.get_or_create(user=instance.user)
    PersonalTree.objects.filter(pk=pt.pk).update(total=F("total") + instance.delta)

    # 전역 카운터 갱신 (단일 레코드 pk=1)
    gs, _ = GlobalStats.objects.get_or_create(pk=1)
    GlobalStats.objects.filter(pk=gs.pk).update(total_trees=F("total_trees") + instance.delta)
