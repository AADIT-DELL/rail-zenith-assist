import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, MapPin, Lightbulb, BarChart3, Pause, Play, Brain, Upload } from 'lucide-react';
import { MapView } from './MapView';
import { RecommendationsPanel } from './RecommendationsPanel';
import { KPIDashboard } from './KPIDashboard';
import { FileUpload } from './FileUpload';
import { SectionSelector } from './SectionSelector';
import { ChatBox } from './ChatBox';
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
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [controllerInstructions, setControllerInstructions] = useState<string[]>([]);

  useEffect(() => {
    const handleUpdate = (data: any) => {
      setTrains(data.trains);
      setSections(data.sections);
      setRecommendations(data.recommendations);
      setKpis(data.kpis);
      setLastUpdate(new Date());
      
      // Auto-select first section if none selected
      if (!selectedSection && data.sections.length > 0) {
        setSelectedSection(data.sections[0].id);
      }
    };

    railwaySimulation.subscribe(handleUpdate);

    return () => {
      railwaySimulation.unsubscribe(handleUpdate);
    };
  }, [selectedSection]);

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
      window.location.reload();
    }
    setIsSimulationRunning(!isSimulationRunning);
  };

  const handleGenerateRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    try {
      // Pass current section and instructions to AI
      await railwaySimulation.generateManualRecommendations(
        selectedSection || undefined,
        undefined,
        controllerInstructions.join('; ')
      );
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const handleDataLoaded = (trainCount: number, sectionCount: number) => {
    // Data loaded successfully
    console.log(`Loaded ${trainCount} trains across ${sectionCount} sections`);
  };

  const handleInstructionSent = (instruction: string) => {
    setControllerInstructions(prev => [...prev, instruction]);
  };

  const currentSection = sections.find(s => s.id === selectedSection);
  // Show all trains regardless of section selection
  const sectionTrains = trains;

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="train-signal green"></div>
            RAIL SANCHALAN
          </h1>
          <p className="text-muted-foreground mt-1 font-mono">
            AI-Powered Decision Support System - Manual Control Mode
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

      {/* Control Panel Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FileUpload onDataLoaded={handleDataLoaded} />
        <SectionSelector 
          sections={sections}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
        />
        <Card className="control-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateRecommendations}
              disabled={isGeneratingRecommendations || trains.length === 0}
              className="w-full font-mono"
              size="lg"
            >
              {isGeneratingRecommendations ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-background border-t-transparent rounded-full"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  GET SUGGESTIONS
                </>
              )}
            </Button>
            <div className="text-xs text-muted-foreground mt-2 font-mono text-center">
              Analyze all {trains.length} trains and get AI recommendations
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Dashboard */}
      <KPIDashboard metrics={kpis} />

      {/* Main Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Box */}
        <div className="lg:col-span-1">
          <ChatBox onInstructionSent={handleInstructionSent} />
        </div>

        {/* AI Recommendations Panel */}
        <div className="lg:col-span-2">
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
          <MapView trains={sectionTrains} section={currentSection} />
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
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">
                  Total Trains: {trains.length} | Instructions: {controllerInstructions.length}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>Manual Control Mode</span>
              <div className="train-signal green"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground font-mono py-4">
        <p>
          RAIL SANCHALAN v2.0 | 
          Manual AI Trigger Mode | 
          Indian Railways Decision Support System
        </p>
        <p className="mt-1">
          Upload CSV Data • Select Section • Monitor All Trains • Give Instructions • Get AI Suggestions
        </p>
      </div>
    </div>
  );
};