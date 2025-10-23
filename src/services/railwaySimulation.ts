import { Train, Section, Platform, Signal, TrackBlock, Recommendation, KPIMetrics, Incident } from '@/types/railway';
import { csvDataLoader } from './csvDataLoader';

class RailwaySimulationService {
  private trains: Train[] = [];
  private sections: Section[] = [];
  private recommendations: Recommendation[] = [];
  private incidents: Incident[] = [];
  private currentInstructions: string = '';
  private kpiMetrics: KPIMetrics = {
    averageDelay: 0,
    throughput: 0,
    punctualityRate: 85,
    totalTrains: 0,
    onTimeTrains: 0,
    lastUpdated: new Date()
  };

  private subscribers: ((data: any) => void)[] = [];
  private simulationInterval?: NodeJS.Timeout;
  private dataLoaded = false;

  constructor() {
    this.initializeWithRealData();
  }

  private async initializeWithRealData() {
    try {
      // Load CSV data
      await csvDataLoader.loadData();
      
      // Get real trains and sections from CSV
      this.trains = csvDataLoader.getTrainsData();
      this.sections = csvDataLoader.getSectionsData();
      
      // If no CSV data available, fall back to synthetic data
      if (this.trains.length === 0 || this.sections.length === 0) {
        this.initializeFallbackData();
      }
      
      this.dataLoaded = true;
      this.generateInitialRecommendations();
      this.startSimulation();
      
      console.log(`Loaded ${this.trains.length} trains across ${this.sections.length} sections from CSV data`);
      
    } catch (error) {
      console.error('Failed to load CSV data, using fallback:', error);
      this.initializeFallbackData();
      this.dataLoaded = true;
      this.generateInitialRecommendations();
      this.startSimulation();
    }
  }

  private initializeFallbackData() {
    // Fallback section data with multiple railway sections
    const sections: Section[] = [
      {
        id: 'SEC_01',
        name: 'Delhi-Gurgaon Section',
        length: 101,
        maxSpeed: 160,
        platforms: [
          { id: 'PF1', number: '1', length: 400, occupied: false, trains: [] },
          { id: 'PF2', number: '2', length: 400, occupied: false, trains: [] },
          { id: 'PF3', number: '3', length: 350, occupied: false, trains: [] },
        ],
        signals: [
          { id: 'SEC_01_SIG_1', position: 0, state: 'GREEN', type: 'HOME' },
          { id: 'SEC_01_SIG_2', position: 25, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_01_SIG_3', position: 50, state: 'YELLOW', type: 'DISTANT' },
          { id: 'SEC_01_SIG_4', position: 75, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_01_SIG_5', position: 101, state: 'GREEN', type: 'STARTER' },
        ],
        blocks: [
          { id: 'SEC_01_BLK_1', start: 0, end: 25, occupied: false },
          { id: 'SEC_01_BLK_2', start: 25, end: 50, occupied: true, occupyingTrain: 'T10025' },
          { id: 'SEC_01_BLK_3', start: 50, end: 75, occupied: false },
          { id: 'SEC_01_BLK_4', start: 75, end: 101, occupied: false },
        ]
      },
      {
        id: 'SEC_02',
        name: 'Mumbai-Pune Section',
        length: 148,
        maxSpeed: 140,
        platforms: [
          { id: 'PF4', number: '1', length: 450, occupied: false, trains: [] },
          { id: 'PF5', number: '2', length: 450, occupied: false, trains: [] },
          { id: 'PF6', number: '3', length: 400, occupied: false, trains: [] },
          { id: 'PF7', number: '4', length: 400, occupied: false, trains: [] },
        ],
        signals: [
          { id: 'SEC_02_SIG_1', position: 0, state: 'GREEN', type: 'HOME' },
          { id: 'SEC_02_SIG_2', position: 37, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_02_SIG_3', position: 74, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_02_SIG_4', position: 111, state: 'YELLOW', type: 'DISTANT' },
          { id: 'SEC_02_SIG_5', position: 148, state: 'GREEN', type: 'STARTER' },
        ],
        blocks: [
          { id: 'SEC_02_BLK_1', start: 0, end: 37, occupied: false },
          { id: 'SEC_02_BLK_2', start: 37, end: 74, occupied: false },
          { id: 'SEC_02_BLK_3', start: 74, end: 111, occupied: false },
          { id: 'SEC_02_BLK_4', start: 111, end: 148, occupied: false },
        ]
      },
      {
        id: 'SEC_03',
        name: 'Howrah-Kharagpur Section',
        length: 119,
        maxSpeed: 130,
        platforms: [
          { id: 'PF8', number: '1', length: 380, occupied: false, trains: [] },
          { id: 'PF9', number: '2', length: 380, occupied: false, trains: [] },
          { id: 'PF10', number: '3', length: 350, occupied: false, trains: [] },
        ],
        signals: [
          { id: 'SEC_03_SIG_1', position: 0, state: 'GREEN', type: 'HOME' },
          { id: 'SEC_03_SIG_2', position: 30, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_03_SIG_3', position: 60, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_03_SIG_4', position: 90, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_03_SIG_5', position: 119, state: 'GREEN', type: 'STARTER' },
        ],
        blocks: [
          { id: 'SEC_03_BLK_1', start: 0, end: 30, occupied: false },
          { id: 'SEC_03_BLK_2', start: 30, end: 60, occupied: false },
          { id: 'SEC_03_BLK_3', start: 60, end: 90, occupied: false },
          { id: 'SEC_03_BLK_4', start: 90, end: 119, occupied: false },
        ]
      },
      {
        id: 'SEC_04',
        name: 'Chennai-Bangalore Section',
        length: 165,
        maxSpeed: 150,
        platforms: [
          { id: 'PF11', number: '1', length: 400, occupied: false, trains: [] },
          { id: 'PF12', number: '2', length: 400, occupied: false, trains: [] },
          { id: 'PF13', number: '3', length: 380, occupied: false, trains: [] },
          { id: 'PF14', number: '4', length: 380, occupied: false, trains: [] },
        ],
        signals: [
          { id: 'SEC_04_SIG_1', position: 0, state: 'GREEN', type: 'HOME' },
          { id: 'SEC_04_SIG_2', position: 41, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_04_SIG_3', position: 82, state: 'YELLOW', type: 'DISTANT' },
          { id: 'SEC_04_SIG_4', position: 123, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_04_SIG_5', position: 165, state: 'GREEN', type: 'STARTER' },
        ],
        blocks: [
          { id: 'SEC_04_BLK_1', start: 0, end: 41, occupied: false },
          { id: 'SEC_04_BLK_2', start: 41, end: 82, occupied: false },
          { id: 'SEC_04_BLK_3', start: 82, end: 123, occupied: true, occupyingTrain: 'T10030' },
          { id: 'SEC_04_BLK_4', start: 123, end: 165, occupied: false },
        ]
      },
      {
        id: 'SEC_05',
        name: 'Ahmedabad-Vadodara Section',
        length: 97,
        maxSpeed: 160,
        platforms: [
          { id: 'PF15', number: '1', length: 420, occupied: false, trains: [] },
          { id: 'PF16', number: '2', length: 420, occupied: false, trains: [] },
          { id: 'PF17', number: '3', length: 400, occupied: false, trains: [] },
        ],
        signals: [
          { id: 'SEC_05_SIG_1', position: 0, state: 'GREEN', type: 'HOME' },
          { id: 'SEC_05_SIG_2', position: 24, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_05_SIG_3', position: 48, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_05_SIG_4', position: 72, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_05_SIG_5', position: 97, state: 'GREEN', type: 'STARTER' },
        ],
        blocks: [
          { id: 'SEC_05_BLK_1', start: 0, end: 24, occupied: false },
          { id: 'SEC_05_BLK_2', start: 24, end: 48, occupied: false },
          { id: 'SEC_05_BLK_3', start: 48, end: 72, occupied: false },
          { id: 'SEC_05_BLK_4', start: 72, end: 97, occupied: false },
        ]
      },
      {
        id: 'SEC_06',
        name: 'Jaipur-Ajmer Section',
        length: 135,
        maxSpeed: 120,
        platforms: [
          { id: 'PF18', number: '1', length: 360, occupied: false, trains: [] },
          { id: 'PF19', number: '2', length: 360, occupied: false, trains: [] },
          { id: 'PF20', number: '3', length: 340, occupied: false, trains: [] },
        ],
        signals: [
          { id: 'SEC_06_SIG_1', position: 0, state: 'GREEN', type: 'HOME' },
          { id: 'SEC_06_SIG_2', position: 34, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_06_SIG_3', position: 67, state: 'GREEN', type: 'DISTANT' },
          { id: 'SEC_06_SIG_4', position: 101, state: 'YELLOW', type: 'DISTANT' },
          { id: 'SEC_06_SIG_5', position: 135, state: 'GREEN', type: 'STARTER' },
        ],
        blocks: [
          { id: 'SEC_06_BLK_1', start: 0, end: 34, occupied: false },
          { id: 'SEC_06_BLK_2', start: 34, end: 67, occupied: false },
          { id: 'SEC_06_BLK_3', start: 67, end: 101, occupied: false },
          { id: 'SEC_06_BLK_4', start: 101, end: 135, occupied: false },
        ]
      }
    ];
    
    this.sections = sections;
    this.generateFallbackTrains();
  }

  private generateFallbackTrains() {
    const trainTypes = ['EXPRESS', 'PASSENGER', 'FREIGHT'] as const;
    
    for (let i = 0; i < 8; i++) {
      const type = trainTypes[Math.floor(Math.random() * trainTypes.length)];
      const priority = type === 'EXPRESS' ? 1 : type === 'PASSENGER' ? 2 : 3;
      const delay = Math.random() * 15;

      const train: Train = {
        id: `T${10000 + i}`,
        number: `${12000 + i}`,
        type,
        priority,
        currentPosition: Math.random() * 101,
        currentSpeed: type === 'EXPRESS' ? 120 + Math.random() * 40 : 
                     type === 'PASSENGER' ? 80 + Math.random() * 40 : 
                     40 + Math.random() * 40,
        maxSpeed: type === 'EXPRESS' ? 160 : type === 'PASSENGER' ? 120 : 80,
        length: type === 'EXPRESS' ? 400 : type === 'PASSENGER' ? 300 : 500,
        status: Math.random() > 0.8 ? 'DELAYED' : 'RUNNING',
        route: [`Station_${i}`, `Station_${i+1}`],
        scheduledArrival: new Date(Date.now() + (i + 1) * 10 * 60000),
        estimatedArrival: new Date(Date.now() + (i + 1) * 10 * 60000 + delay * 60000),
        delay: Math.round(delay),
        direction: Math.random() > 0.5 ? 'UP' : 'DOWN'
      };

      this.trains.push(train);
    }
  }

  private generateInitialRecommendations() {
    // Don't auto-generate recommendations - wait for manual trigger
    this.recommendations = [];
  }

  private generateRecommendations() {
    // Generate smarter recommendations based on actual train data
    const delayedTrains = this.trains.filter(t => t.delay > 5);
    const stoppedTrains = this.trains.filter(t => t.status === 'STOPPED');
    const expressTrains = this.trains.filter(t => t.type === 'EXPRESS');
    
    const recommendations = [];
    
    // High-priority express train recommendations
    if (expressTrains.length > 0 && delayedTrains.length > 0) {
      const expressTrain = expressTrains[0];
      recommendations.push({
        type: 'HOLD' as const,
        description: `Clear path for Express ${expressTrain.number}`,
        explanation: `Express train priority - ${delayedTrains.length} delayed trains blocking path`,
        expectedImpact: `Reduces average delay by ${(2.5 + Math.random() * 2).toFixed(1)} minutes`,
        confidence: 0.88
      });
    }
    
    // Platform optimization recommendations
    if (stoppedTrains.length > 1) {
      const train = stoppedTrains[0];
      recommendations.push({
        type: 'ROUTE' as const,
        description: `Reroute ${train.number} via alternate platform`,
        explanation: `Platform congestion detected - ${stoppedTrains.length} trains waiting`,
        expectedImpact: `Improves section throughput by ${(5 + Math.random() * 8).toFixed(0)}%`,
        confidence: 0.91
      });
    }
    
    // Speed advisory for efficiency
    const fastTrains = this.trains.filter(t => t.currentSpeed > 100 && t.type !== 'EXPRESS');
    if (fastTrains.length > 0) {
      const train = fastTrains[0];
      recommendations.push({
        type: 'SPEED_ADVICE' as const,
        description: `Optimize speed for ${train.number} to ${Math.round(train.currentSpeed * 0.8)} km/h`,
        explanation: `Energy-efficient operation and signal coordination`,
        expectedImpact: `Prevents cascading delays, saves fuel`,
        confidence: 0.75
      });
    }
    
    // Fallback recommendations if no specific issues found
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'SPEED_ADVICE' as const,
        description: 'Maintain current operational pace',
        explanation: 'All trains operating within acceptable parameters',
        expectedImpact: 'Optimal system performance maintained',
        confidence: 0.95
      });
    }

    this.recommendations = recommendations.map((rec, index) => ({
      id: `REC${Date.now()}_${index}`,
      timestamp: new Date(),
      type: rec.type,
      affectedTrains: this.trains.slice(index, index + 2).map(t => t.id),
      description: rec.description,
      explanation: rec.explanation,
      expectedImpact: rec.expectedImpact,
      confidence: rec.confidence,
      priority: rec.confidence > 0.85 ? 'HIGH' : rec.confidence > 0.75 ? 'MEDIUM' : 'LOW',
      status: 'PENDING'
    }));
  }

  private updateKPIMetrics() {
    const onTimeTrains = this.trains.filter(t => t.delay <= 2).length;
    const totalDelay = this.trains.reduce((sum, t) => sum + t.delay, 0);
    
    this.kpiMetrics = {
      averageDelay: totalDelay / this.trains.length,
      throughput: this.trains.length * 6, // trains per hour (simulated)
      punctualityRate: (onTimeTrains / this.trains.length) * 100,
      totalTrains: this.trains.length,
      onTimeTrains,
      lastUpdated: new Date()
    };
  }

  private simulateTrainMovement() {
    this.trains.forEach(train => {
      // More realistic speed variation based on train type and status
      let speedVariation = 0;
      
      if (train.status === 'RUNNING') {
        speedVariation = (Math.random() - 0.5) * 5; // Smaller variation for running trains
      } else if (train.status === 'DELAYED') {
        speedVariation = -Math.random() * 10; // Slow down delayed trains
      } else if (train.status === 'STOPPED') {
        train.currentSpeed = 0;
        return; // Don't move stopped trains
      }
      
      train.currentSpeed = Math.max(0, Math.min(train.maxSpeed, train.currentSpeed + speedVariation));
      
      // Move train based on speed with more realistic physics
      const sectionLength = this.sections.find(s => s.id.includes('SEC_01'))?.length || 101;
      train.currentPosition += (train.currentSpeed / 3600) * 2; // 2-second intervals
      
      // Wrap around section for continuous simulation
      if (train.currentPosition > sectionLength) {
        train.currentPosition = 0;
        // Reset some properties when train completes section
        if (Math.random() > 0.7) {
          train.delay = Math.max(0, train.delay - 1); // Sometimes reduce delay
        }
      }

      // More realistic status changes based on conditions
      if (Math.random() > 0.98) {
        const statusOptions = ['RUNNING', 'DELAYED', 'APPROACHING'];
        // Bias towards running for express trains
        if (train.type === 'EXPRESS' && Math.random() > 0.3) {
          train.status = 'RUNNING';
        } else {
          train.status = statusOptions[Math.floor(Math.random() * statusOptions.length)] as any;
        }
      }

      // Dynamic delay updates based on operational conditions
      if (Math.random() > 0.92) {
        const delayChange = Math.random() > 0.6 ? 1 : -1;
        train.delay = Math.max(0, train.delay + delayChange);
        
        // Update estimated arrival
        train.estimatedArrival = new Date(train.scheduledArrival.getTime() + train.delay * 60000);
      }

      // Simulate signal effects on train speed
      if (Math.random() > 0.95) {
        const nearbySignals = this.sections[0]?.signals.filter(s => 
          Math.abs(s.position - train.currentPosition) < 5
        );
        
        if (nearbySignals?.some(s => s.state === 'RED')) {
          train.currentSpeed = 0;
          train.status = 'STOPPED';
        } else if (nearbySignals?.some(s => s.state === 'YELLOW')) {
          train.currentSpeed = Math.min(train.currentSpeed, 40);
        }
      }
    });
  }

  private startSimulation() {
    // Only start if data is loaded
    if (!this.dataLoaded) {
      setTimeout(() => this.startSimulation(), 100);
      return;
    }
    
    this.simulationInterval = setInterval(() => {
      this.simulateTrainMovement();
      this.updateKPIMetrics();
      
      // Don't auto-generate recommendations in continuous mode

      // Simulate signal state changes
      this.updateSignalStates();
      
      // Update block occupancy
      this.updateBlockOccupancy();

      // Notify subscribers
      this.notifySubscribers();
    }, 2000);
  }

  private updateSignalStates() {
    this.sections.forEach(section => {
      section.signals.forEach(signal => {
        if (Math.random() > 0.98) {
          const states = ['GREEN', 'YELLOW', 'RED'];
          signal.state = states[Math.floor(Math.random() * states.length)] as any;
        }
      });
    });
  }

  private updateBlockOccupancy() {
    this.sections.forEach(section => {
      section.blocks.forEach(block => {
        // Check if any train is in this block
        const trainsInBlock = this.trains.filter(train => 
          train.currentPosition >= block.start && train.currentPosition <= block.end
        );
        
        block.occupied = trainsInBlock.length > 0;
        block.occupyingTrain = trainsInBlock.length > 0 ? trainsInBlock[0].id : undefined;
      });
    });
  }

  private notifySubscribers() {
    const data = {
      trains: this.trains,
      sections: this.sections,
      recommendations: this.recommendations,
      kpis: this.kpiMetrics,
      incidents: this.incidents
    };

    this.subscribers.forEach(callback => callback(data));
  }

  public subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    // Immediately send current data
    this.notifySubscribers();
  }

  public unsubscribe(callback: (data: any) => void) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  public getCurrentData() {
    return {
      trains: this.trains,
      sections: this.sections,
      recommendations: this.recommendations,
      kpis: this.kpiMetrics,
      incidents: this.incidents
    };
  }

  public acceptRecommendation(id: string) {
    const rec = this.recommendations.find(r => r.id === id);
    if (rec) {
      rec.status = 'ACCEPTED';
      
      // Check if controller instructions contain a numerical target
      const targetMatch = this.currentInstructions.match(/(?:reduce|decrease).*?(?:to|down to)\s*(\d+)/i);
      
      if (targetMatch) {
        // Controller specified a target number - apply aggressive delay reduction
        const targetDelayedCount = parseInt(targetMatch[1]);
        const currentDelayedCount = this.trains.filter(t => t.delay > 2).length;
        
        if (currentDelayedCount > targetDelayedCount) {
          const trainsToFix = currentDelayedCount - targetDelayedCount;
          const delayedTrains = this.trains
            .filter(t => t.delay > 2)
            .sort((a, b) => a.delay - b.delay); // Fix trains with smallest delays first
          
          // Fix the required number of trains
          delayedTrains.slice(0, trainsToFix).forEach(train => {
            train.delay = Math.floor(Math.random() * 2); // Reduce to 0-2 minutes (on-time)
            train.status = 'RUNNING';
            train.currentSpeed = Math.min(train.maxSpeed * 0.9, train.currentSpeed + 15);
            train.estimatedArrival = new Date(train.scheduledArrival.getTime() + train.delay * 60000);
          });
        }
      } else {
        // No specific target - apply standard recommendation effects
        rec.affectedTrains.forEach(trainId => {
          const train = this.trains.find(t => t.id === trainId);
          if (train) {
            switch (rec.type) {
              case 'SPEED_ADVICE':
                train.delay = Math.max(0, train.delay - 2);
                train.currentSpeed = Math.min(train.maxSpeed * 0.9, train.currentSpeed + 10);
                if (train.delay <= 2) train.status = 'RUNNING';
                break;
                
              case 'ROUTE':
                train.delay = Math.max(0, train.delay - 3);
                train.status = 'RUNNING';
                break;
                
              case 'HOLD':
                if (train.priority === 1) {
                  train.delay = Math.max(0, train.delay - 4);
                  train.status = 'RUNNING';
                  train.currentSpeed = train.maxSpeed * 0.95;
                }
                break;
            }
            
            train.estimatedArrival = new Date(train.scheduledArrival.getTime() + train.delay * 60000);
          }
        });
        
        // Also apply general improvements to other delayed trains
        const delayedTrains = this.trains.filter(t => t.delay > 5 && !rec.affectedTrains.includes(t.id));
        delayedTrains.slice(0, 2).forEach(train => {
          train.delay = Math.max(0, train.delay - 1);
          if (train.delay <= 2) train.status = 'RUNNING';
          train.estimatedArrival = new Date(train.scheduledArrival.getTime() + train.delay * 60000);
        });
      }
      
      this.updateKPIMetrics();
      this.notifySubscribers();
    }
  }

  public rejectRecommendation(id: string) {
    const rec = this.recommendations.find(r => r.id === id);
    if (rec) {
      rec.status = 'REJECTED';
      this.notifySubscribers();
    }
  }

  public generateManualRecommendations(sectionId?: string, trainId?: string, instructions?: string) {
    // Store controller instructions for use when accepting recommendations
    if (instructions) {
      this.currentInstructions = instructions;
    }
    this.generateRecommendations();
    this.notifySubscribers();
    return this.recommendations;
  }

  public loadFromFile(csvData: string) {
    // This would process uploaded CSV data
    // For now, reload the service with new data
    return csvDataLoader.loadFromText(csvData);
  }

  public dispose() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }
}

export const railwaySimulation = new RailwaySimulationService();