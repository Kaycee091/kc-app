from rest_framework import serializers, viewsets, permissions
from apps.reports.models import Report
from apps.users.serializers import UserSerializer

class ReportSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    reported_user = UserSerializer(read_only=True)

    class Meta:
        model = Report
        fields = '__all__'

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.select_related('reporter', 'reported_user').all().order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status', None)
        report_type = self.request.query_params.get('report_type', None)

        if status_param:
            qs = qs.filter(status=status_param)
        if report_type:
            qs = qs.filter(report_type=report_type)
        return qs
