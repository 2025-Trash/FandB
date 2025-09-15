from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import TreeEvent, PersonalTree, GlobalStats
from .serializers import (
    TreeEventCreateSerializer, PersonalTreeSerializer, GlobalStatsSerializer
)

class AddTreesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = TreeEventCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        TreeEvent.objects.create(
            user=request.user,
            delta=ser.validated_data["delta"],
            reason=ser.validated_data.get("reason", ""),
        )
        return Response({"ok": True}, status=status.HTTP_201_CREATED)

class MyTreesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pt, _ = PersonalTree.objects.get_or_create(user=request.user)
        return Response(PersonalTreeSerializer(pt).data)

class GlobalTreesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        gs, _ = GlobalStats.objects.get_or_create(pk=1)
        return Response(GlobalStatsSerializer(gs).data)
