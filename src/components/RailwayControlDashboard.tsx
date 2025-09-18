import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, MapPin, Lightbulb, BarChart3, Pause, Play } from 'lucide-react';
import { TrainGraph } from './TrainGraph';
import { MapView } from './MapView';
import { RecommendationsPanel } from './RecommendationsPanel';
import { KPIDashboard } from './KPIDashboard';
import { railwaySimulation } from '@/services/railwaySimulation';
import { Train, Section, Recommendation, KPIMetrics } from '@/types/railway';

export const RailwayControlDashboard = () => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [kpis, setKpis] = useState<KPIMetrics>({
    averageDelay: 0,
    throughput: 0,
    punctualityRate: 85,
    totalTrains: 0,
    onTimeTrains: 0,
    lastUpdated: new Date()
  });
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const handleUpdate = (data: any) => {
      setTrains(data.trains);
      setSections(data.sections);
      setRecommendations(data.recommendations);
      setKpis(data.kpis);
      setLastUpdate(new Date());
    };

    railwaySimulation.subscribe(handleUpdate);

    return () => {
      railwaySimulation.unsubscribe(handleUpdate);
    };
  }, []);

  const handleAcceptRecommendation = (id: string) => {
    railwaySimulation.acceptRecommendation(id);
  };

  const handleRejectRecommendation = (id: string) => {
    railwaySimulation.rejectRecommendation(id);
  };

  const toggleSimulation = () => {
    if (isSimulationRunning) {
      railwaySimulation.dispose();
    } else {
      // This would restart simulation - simplified for demo
      window.location.reload();
    }
    setIsSimulationRunning(!isSimulationRunning);
  };

  const currentSection = sections[0]; // Using first section for demo

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="train-signal green"></div>
            Railway Control Center
          </h1>
          <p className="text-muted-foreground mt-1 font-mono">
            Intelligent Decision Support System - Multi-Section Train Precedence
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="font-mono">
            Last Update: {lastUpdate.toLocaleTimeString('en-IN')}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSimulation}
            className="font-mono"
          >
            {isSimulationRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Simulation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <KPIDashboard metrics={kpis} />

      {/* Main Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Train Graph - Time-Distance Chart */}
        <div className="lg:col-span-2">
          <TrainGraph trains={trains} />
        </div>

        {/* AI Recommendations Panel */}
        <div>
          <RecommendationsPanel
            recommendations={recommendations}
            onAccept={handleAcceptRecommendation}
            onReject={handleRejectRecommendation}
          />
        </div>
      </div>

      {/* Section Map View */}
      {currentSection && (
        <div className="w-full">
          <MapView trains={trains} section={currentSection} />
        </div>
      )}

      {/* System Status Bar */}
      <Card className="control-panel">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                <span className="font-mono text-sm">System Status: OPERATIONAL</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">Active Sections: {sections.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                <span className="font-mono text-sm">
                  AI Recommendations: {recommendations.filter(r => r.status === 'PENDING').length} Pending
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>Decision Support Mode</span>
              <div className="train-signal green"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground font-mono py-4">
        <p>
          Intelligent Railway Decision Support System v1.0 | 
          Prototype with Synthetic Data | 
          Indian Railways Traffic Management
        </p>
        <p className="mt-1">
          Priority: Express → Passenger → Freight | 
          KPIs: Avg Delay, Throughput, Punctuality Rate
        </p>
      </div>
    </div>
  );
};