import { Train, Section, Signal } from '@/types/railway';

interface CSVTrainData {
  timestamp: string;
  section_id: string;
  section_length_km: number;
  signal_state: string;
  train_id: string;
  train_type: string;
  priority: string;
  position_km: number;
  speed_kmph: number;
  status: string;
  delay_min: number;
  disruption: string;
  next_station: string;
  next_station_arrival: string;
}

class CSVDataLoader {
  private csvData: CSVTrainData[] = [];
  private sectionsData: Map<string, Section> = new Map();

  async loadData(): Promise<void> {
    try {
      const response = await fetch('/src/data/synthetic_rail_traffic_sample_200.csv');
      const csvText = await response.text();
      this.parseCSV(csvText);
      this.generateSections();
    } catch (error) {
      console.error('Failed to load CSV data:', error);
      // Fallback to empty data - simulation will handle this
    }
  }

  private parseCSV(csvText: string): void {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length !== headers.length) continue;
      
      const record: CSVTrainData = {
        timestamp: values[0],
        section_id: values[1],
        section_length_km: parseFloat(values[2]),
        signal_state: values[3],
        train_id: values[4],
        train_type: values[5],
        priority: values[6],
        position_km: parseFloat(values[7]),
        speed_kmph: parseFloat(values[8]),
        status: values[9],
        delay_min: parseInt(values[10]),
        disruption: values[11],
        next_station: values[12],
        next_station_arrival: values[13]
      };
      
      this.csvData.push(record);
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private generateSections(): void {
    const sectionMap = new Map<string, { length: number; signals: string[] }>();
    
    // Analyze CSV data to build section information
    this.csvData.forEach(record => {
      if (!sectionMap.has(record.section_id)) {
        sectionMap.set(record.section_id, {
          length: record.section_length_km,
          signals: []
        });
      }
      
      // Add signal if not already present
      const sectionData = sectionMap.get(record.section_id)!;
      const signalId = `${record.section_id}_SIG_${Math.floor(record.position_km / 10)}`;
      if (!sectionData.signals.includes(signalId)) {
        sectionData.signals.push(signalId);
      }
    });

    // Generate Section objects
    sectionMap.forEach((data, sectionId) => {
      const section: Section = {
        id: sectionId,
        name: sectionId.replace('_', ' '),
        length: data.length,
        maxSpeed: 160, // Default max speed
        platforms: this.generatePlatforms(sectionId),
        signals: this.generateSignals(sectionId, data.length),
        blocks: this.generateBlocks(sectionId, data.length)
      };
      
      this.sectionsData.set(sectionId, section);
    });
  }

  private generatePlatforms(sectionId: string) {
    return [
      { id: `${sectionId}_PF1`, number: '1', length: 400, occupied: false, trains: [] },
      { id: `${sectionId}_PF2`, number: '2', length: 400, occupied: false, trains: [] },
      { id: `${sectionId}_PF3`, number: '3', length: 350, occupied: false, trains: [] },
    ];
  }

  private generateSignals(sectionId: string, length: number): Signal[] {
    const signals: Signal[] = [];
    const signalCount = Math.max(3, Math.ceil(length / 20));
    
    for (let i = 0; i < signalCount; i++) {
      signals.push({
        id: `${sectionId}_SIG_${i + 1}`,
        position: (i * length) / (signalCount - 1),
        state: Math.random() > 0.8 ? 'YELLOW' : 'GREEN',
        type: i === 0 ? 'HOME' : i === signalCount - 1 ? 'STARTER' : 'DISTANT'
      });
    }
    
    return signals;
  }

  private generateBlocks(sectionId: string, length: number) {
    const blockCount = Math.max(3, Math.ceil(length / 15));
    const blocks = [];
    
    for (let i = 0; i < blockCount; i++) {
      const start = (i * length) / blockCount;
      const end = ((i + 1) * length) / blockCount;
      
      blocks.push({
        id: `${sectionId}_BLK_${i + 1}`,
        start,
        end,
        occupied: Math.random() > 0.7, // 30% chance of being occupied
        occupyingTrain: Math.random() > 0.7 ? `T${10000 + Math.floor(Math.random() * 1000)}` : undefined
      });
    }
    
    return blocks;
  }

  public getTrainsData(): Train[] {
    if (this.csvData.length === 0) return [];

    // Convert CSV data to Train objects
    return this.csvData.map(record => {
      const train: Train = {
        id: record.train_id,
        number: record.train_id.replace('T', ''),
        type: this.mapTrainType(record.train_type),
        priority: this.mapPriority(record.priority),
        currentPosition: record.position_km,
        currentSpeed: record.status === 'Waiting for Signal' ? 0 : record.speed_kmph,
        maxSpeed: this.getMaxSpeedForType(record.train_type),
        length: this.getLengthForType(record.train_type),
        status: this.mapStatus(record.status),
        route: [record.next_station],
        scheduledArrival: new Date(record.next_station_arrival),
        estimatedArrival: new Date(new Date(record.next_station_arrival).getTime() + record.delay_min * 60000),
        delay: record.delay_min,
        direction: Math.random() > 0.5 ? 'UP' : 'DOWN',
        platform: record.status.includes('Halted') ? `PF${Math.floor(Math.random() * 3) + 1}` : undefined
      };
      
      return train;
    });
  }

  public getSectionsData(): Section[] {
    return Array.from(this.sectionsData.values());
  }

  private mapTrainType(csvType: string): 'EXPRESS' | 'PASSENGER' | 'FREIGHT' {
    switch (csvType.toLowerCase()) {
      case 'express':
      case 'superfast':
        return 'EXPRESS';
      case 'passenger':
        return 'PASSENGER';
      case 'freight':
      default:
        return 'FREIGHT';
    }
  }

  private mapPriority(csvPriority: string): number {
    switch (csvPriority.toLowerCase()) {
      case 'very high':
        return 1;
      case 'high':
        return 2;
      case 'medium':
        return 3;
      case 'low':
      default:
        return 4;
    }
  }

  private mapStatus(csvStatus: string): 'RUNNING' | 'DELAYED' | 'STOPPED' | 'APPROACHING' {
    if (csvStatus.includes('Running')) return 'RUNNING';
    if (csvStatus.includes('Waiting') || csvStatus.includes('Halted')) return 'STOPPED';
    if (csvStatus.includes('Slowdown') || csvStatus.includes('Fault')) return 'DELAYED';
    return 'APPROACHING';
  }

  private getMaxSpeedForType(type: string): number {
    switch (type.toLowerCase()) {
      case 'superfast':
        return 160;
      case 'express':
        return 140;
      case 'passenger':
        return 100;
      case 'freight':
      default:
        return 80;
    }
  }

  private getLengthForType(type: string): number {
    switch (type.toLowerCase()) {
      case 'superfast':
      case 'express':
        return 400;
      case 'passenger':
        return 300;
      case 'freight':
      default:
        return 500;
    }
  }

  public getDisruptions(): Array<{ type: string; count: number }> {
    const disruptions = new Map<string, number>();
    
    this.csvData.forEach(record => {
      if (record.disruption && record.disruption !== 'None') {
        disruptions.set(record.disruption, (disruptions.get(record.disruption) || 0) + 1);
      }
    });
    
    return Array.from(disruptions.entries()).map(([type, count]) => ({ type, count }));
  }

  public getSampleSize(): number {
    return this.csvData.length;
  }
}

export const csvDataLoader = new CSVDataLoader();