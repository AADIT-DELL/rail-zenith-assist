import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Train, CheckCircle, AlertTriangle } from 'lucide-react';
import { KPIMetrics } from '@/types/railway';

interface KPIDashboardProps {
  metrics: KPIMetrics;
}

export const KPIDashboard = ({ metrics }: KPIDashboardProps) => {
  const formatDelay = (minutes: number) => {
    return `${minutes.toFixed(1)}m`;
  };

  const getPerformanceColor = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value < threshold : value > threshold;
    return isGood ? 'text-success' : 'text-warning';
  };

  const getTrendIcon = (current: number, target: number, reverse = false) => {
    const isImproving = reverse ? current < target : current > target;
    return isImproving ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-warning" />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Average Delay */}
      <Card className="control-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            Average Delay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`metric-display ${getPerformanceColor(metrics.averageDelay, 5, true)}`}>
                {formatDelay(metrics.averageDelay)}
              </div>
              <p className="text-xs text-muted-foreground">
                Target: &lt;5m
              </p>
            </div>
            {getTrendIcon(metrics.averageDelay, 5, true)}
          </div>
        </CardContent>
      </Card>

      {/* Throughput */}
      <Card className="control-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Train className="h-4 w-4 text-primary" />
            Throughput
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`metric-display ${getPerformanceColor(metrics.throughput, 40)}`}>
                {Math.round(metrics.throughput)}
              </div>
              <p className="text-xs text-muted-foreground">
                trains/hour
              </p>
            </div>
            {getTrendIcon(metrics.throughput, 40)}
          </div>
        </CardContent>
      </Card>

      {/* Punctuality Rate */}
      <Card className="control-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Punctuality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`metric-display ${getPerformanceColor(metrics.punctualityRate, 85)}`}>
                {metrics.punctualityRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                on-time arrivals
              </p>
            </div>
            {getTrendIcon(metrics.punctualityRate, 85)}
          </div>
        </CardContent>
      </Card>

      {/* Active Trains */}
      <Card className="control-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            Active Trains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="metric-display text-lg">{metrics.totalTrains}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">On Time</span>
              <span className="font-mono text-success">{metrics.onTimeTrains}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Delayed</span>
              <span className="font-mono text-warning">{metrics.totalTrains - metrics.onTimeTrains}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status Summary */}
      <Card className="control-panel md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">System Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="train-signal green"></div>
              <div>
                <div className="font-medium text-success">Optimal Performance</div>
                <div className="text-xs text-muted-foreground">
                  All systems operating within targets
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="train-signal amber"></div>
              </div>
              <div>
                <div className="font-medium text-warning">Minor Delays</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.totalTrains - metrics.onTimeTrains} trains affected
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="font-mono text-xs">
                  {metrics.lastUpdated.toLocaleTimeString('en-IN')}
                </div>
              </div>
              <Badge variant="secondary" className="font-mono">
                Live
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};