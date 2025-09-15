from django.apps import AppConfig

class TreesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trees"

    def ready(self):
        # 모델 로딩 이후 시그널 등록
        from . import signals  # noqa
