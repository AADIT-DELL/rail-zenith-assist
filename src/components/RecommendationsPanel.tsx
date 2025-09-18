import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle, Lightbulb } from 'lucide-react';
import { Recommendation } from '@/types/railway';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export const RecommendationsPanel = ({ 
  recommendations, 
  onAccept, 
  onReject 
}: RecommendationsPanelProps) => {
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-critical text-critical-foreground';
      case 'HIGH':
        return 'bg-warning text-warning-foreground';
      case 'MEDIUM':
        return 'bg-primary text-primary-foreground';
      case 'LOW':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-critical" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOLD':
        return '⏸️';
      case 'ROUTE':
        return '🔄';
      case 'SPEED_ADVICE':
        return '⚡';
      case 'PLATFORM_CHANGE':
        return '🚉';
      default:
        return '💡';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const pendingRecommendations = recommendations.filter(r => r.status === 'PENDING');
  const processedRecommendations = recommendations.filter(r => r.status !== 'PENDING');

  return (
    <Card className="control-panel h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <Badge variant="secondary" className="font-mono">
            {pendingRecommendations.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {pendingRecommendations.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No pending recommendations. System operating optimally.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {pendingRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="border border-border rounded-lg p-4 bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTypeIcon(rec.type)}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatConfidence(rec.confidence)} confidence
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground">{rec.description}</h4>
                    </div>
                  </div>
                  {getStatusIcon(rec.status)}
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  <div className="mb-1">
                    <span className="font-medium">Affected Trains:</span> {rec.affectedTrains.join(', ')}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Expected Impact:</span> {rec.expectedImpact}
                  </div>
                </div>

                {expandedRec === rec.id && (
                  <div className="bg-secondary/30 rounded p-3 mb-3 text-sm">
                    <div className="font-medium text-foreground mb-1">Explanation:</div>
                    <div className="text-muted-foreground">{rec.explanation}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Generated at {rec.timestamp.toLocaleTimeString('en-IN')}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onAccept(rec.id)}
                    className="bg-success hover:bg-success/90 text-success-foreground"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(rec.id)}
                    className="border-critical text-critical hover:bg-critical/10"
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                  >
                    {expandedRec === rec.id ? 'Less' : 'Details'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {processedRecommendations.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Actions
            </h4>
            <div className="space-y-2">
              {processedRecommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-2 bg-secondary/20 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(rec.status)}
                    <span className="truncate">{rec.description}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {rec.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};