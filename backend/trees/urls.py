from django.urls import path
from .views import AddTreesView, MyTreesView, GlobalTreesView

urlpatterns = [
    path("add/", AddTreesView.as_view(), name="trees-add"),
    path("me/", MyTreesView.as_view(), name="trees-me"),
    path("global/", GlobalTreesView.as_view(), name="trees-global"),
]
