import { Train, Section, Platform, Signal, TrackBlock, Recommendation, KPIMetrics, Incident } from '@/types/railway';

class RailwaySimulationService {
  private trains: Train[] = [];
  private sections: Section[] = [];
  private recommendations: Recommendation[] = [];
  private incidents: Incident[] = [];
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

  constructor() {
    this.initializeSection();
    this.generateInitialTrains();
    this.startSimulation();
  }

  private initializeSection() {
    const section: Section = {
      id: 'SECT001',
      name: 'Delhi-Gurgaon Section',
      length: 35, // km
      maxSpeed: 160,
      platforms: [
        { id: 'PF1', number: '1', length: 400, occupied: false, trains: [] },
        { id: 'PF2', number: '2', length: 400, occupied: false, trains: [] },
        { id: 'PF3', number: '3', length: 300, occupied: false, trains: [] },
      ],
      signals: [
        { id: 'SIG001', position: 0, state: 'GREEN', type: 'HOME' },
        { id: 'SIG002', position: 15, state: 'GREEN', type: 'DISTANT' },
        { id: 'SIG003', position: 35, state: 'GREEN', type: 'STARTER' },
      ],
      blocks: [
        { id: 'BLK001', start: 0, end: 10, occupied: false },
        { id: 'BLK002', start: 10, end: 20, occupied: false },
        { id: 'BLK003', start: 20, end: 35, occupied: false },
      ]
    };
    this.sections = [section];
  }

  private generateInitialTrains() {
    const trainTypes = ['EXPRESS', 'PASSENGER', 'FREIGHT'] as const;
    const trainNames = [
      'Rajdhani Express', 'Shatabdi Express', 'Duronto Express',
      'Delhi Metro', 'Local Passenger', 'Intercity Express',
      'Goods Train', 'Container Special', 'Coal Rake'
    ];

    for (let i = 0; i < 8; i++) {
      const type = trainTypes[Math.floor(Math.random() * trainTypes.length)];
      const priority = type === 'EXPRESS' ? 1 : type === 'PASSENGER' ? 2 : 3;
      const delay = Math.random() * 15; // 0-15 minutes delay

      const train: Train = {
        id: `TRAIN${(i + 1).toString().padStart(3, '0')}`,
        number: `${12000 + i}`,
        type,
        priority,
        currentPosition: Math.random() * 35,
        currentSpeed: type === 'EXPRESS' ? 120 + Math.random() * 40 : 
                     type === 'PASSENGER' ? 80 + Math.random() * 40 : 
                     40 + Math.random() * 40,
        maxSpeed: type === 'EXPRESS' ? 160 : type === 'PASSENGER' ? 120 : 80,
        length: type === 'EXPRESS' ? 400 : type === 'PASSENGER' ? 300 : 500,
        status: Math.random() > 0.8 ? 'DELAYED' : 'RUNNING',
        route: [`Station${i}`, `Station${i+1}`],
        scheduledArrival: new Date(Date.now() + (i + 1) * 10 * 60000),
        estimatedArrival: new Date(Date.now() + (i + 1) * 10 * 60000 + delay * 60000),
        delay: Math.round(delay),
        direction: Math.random() > 0.5 ? 'UP' : 'DOWN'
      };

      this.trains.push(train);
    }
  }

  private generateRecommendations() {
    const recommendations = [
      {
        type: 'HOLD' as const,
        description: 'Hold TRAIN002 at signal SIG001',
        explanation: 'Freight train blocking express priority path',
        expectedImpact: 'Reduces average delay by 3.2 minutes',
        confidence: 0.85
      },
      {
        type: 'ROUTE' as const,
        description: 'Reroute TRAIN003 via Platform 2',
        explanation: 'Platform 1 congestion detected',
        expectedImpact: 'Improves throughput by 8%',
        confidence: 0.92
      },
      {
        type: 'SPEED_ADVICE' as const,
        description: 'Reduce speed for TRAIN001 to 80 km/h',
        explanation: 'Signal coordination optimization',
        expectedImpact: 'Prevents cascading delays',
        confidence: 0.78
      }
    ];

    this.recommendations = recommendations.map((rec, index) => ({
      id: `REC${(index + 1).toString().padStart(3, '0')}`,
      timestamp: new Date(),
      type: rec.type,
      affectedTrains: [`TRAIN${(index + 1).toString().padStart(3, '0')}`],
      description: rec.description,
      explanation: rec.explanation,
      expectedImpact: rec.expectedImpact,
      confidence: rec.confidence,
      priority: rec.confidence > 0.8 ? 'HIGH' : 'MEDIUM',
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
      // Simulate movement
      const speedVariation = (Math.random() - 0.5) * 10;
      train.currentSpeed = Math.max(0, Math.min(train.maxSpeed, train.currentSpeed + speedVariation));
      
      // Move train based on speed (simplified)
      train.currentPosition += (train.currentSpeed / 3600) * 2; // 2-second intervals
      
      // Wrap around section
      if (train.currentPosition > 35) {
        train.currentPosition = 0;
      }

      // Random status changes
      if (Math.random() > 0.95) {
        const statuses = ['RUNNING', 'DELAYED', 'APPROACHING'];
        train.status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      }

      // Update delay occasionally
      if (Math.random() > 0.9) {
        train.delay += Math.random() > 0.5 ? 1 : -1;
        train.delay = Math.max(0, train.delay);
      }
    });
  }

  private startSimulation() {
    this.generateRecommendations();
    
    this.simulationInterval = setInterval(() => {
      this.simulateTrainMovement();
      this.updateKPIMetrics();
      
      // Occasionally generate new recommendations
      if (Math.random() > 0.95) {
        this.generateRecommendations();
      }

      // Notify subscribers
      this.notifySubscribers();
    }, 2000);
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

  public dispose() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }
}

export const railwaySimulation = new RailwaySimulationService();