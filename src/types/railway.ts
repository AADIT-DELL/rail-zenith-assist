export interface Train {
  id: string;
  number: string;
  type: 'EXPRESS' | 'PASSENGER' | 'FREIGHT';
  priority: number;
  currentPosition: number; // km from section start
  currentSpeed: number; // km/h
  maxSpeed: number;
  length: number; // meters
  status: 'RUNNING' | 'DELAYED' | 'STOPPED' | 'APPROACHING';
  route: string[];
  scheduledArrival: Date;
  estimatedArrival: Date;
  delay: number; // minutes
  platform?: string;
  direction: 'UP' | 'DOWN';
}

export interface Section {
  id: string;
  name: string;
  length: number; // km
  maxSpeed: number;
  platforms: Platform[];
  signals: Signal[];
  blocks: TrackBlock[];
}

export interface Platform {
  id: string;
  number: string;
  length: number;
  occupied: boolean;
  trains: string[];
}

export interface Signal {
  id: string;
  position: number; // km from section start
  state: 'GREEN' | 'YELLOW' | 'RED';
  type: 'HOME' | 'STARTER' | 'DISTANT';
}

export interface TrackBlock {
  id: string;
  start: number;
  end: number;
  occupied: boolean;
  occupyingTrain?: string;
}

export interface Recommendation {
  id: string;
  timestamp: Date;
  type: 'HOLD' | 'ROUTE' | 'SPEED_ADVICE' | 'PLATFORM_CHANGE';
  affectedTrains: string[];
  description: string;
  explanation: string;
  expectedImpact: string;
  confidence: number; // 0-1
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

export interface KPIMetrics {
  averageDelay: number;
  throughput: number; // trains per hour
  punctualityRate: number; // percentage
  totalTrains: number;
  onTimeTrains: number;
  lastUpdated: Date;
}

export interface Incident {
  id: string;
  type: 'SIGNAL_FAILURE' | 'TRACK_BLOCK' | 'WEATHER' | 'EQUIPMENT' | 'OTHER';
  description: string;
  affectedBlocks: string[];
  startTime: Date;
  estimatedEndTime?: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'RESOLVED';
}