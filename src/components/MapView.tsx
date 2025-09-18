import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, Section } from '@/types/railway';

interface MapViewProps {
  trains: Train[];
  section: Section;
}

export const MapView = ({ trains, section }: MapViewProps) => {
  const getTrainIcon = (train: Train) => {
    switch (train.type) {
      case 'EXPRESS':
        return '🚄';
      case 'PASSENGER':
        return '🚃';
      case 'FREIGHT':
        return '🚂';
      default:
        return '🚋';
    }
  };

  const getSignalColor = (state: string) => {
    switch (state) {
      case 'GREEN':
        return 'train-signal green';
      case 'YELLOW':
        return 'train-signal amber';
      case 'RED':
        return 'train-signal red';
      default:
        return 'train-signal amber';
    }
  };

  return (
    <Card className="control-panel h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="train-signal green"></div>
            Section Map - {section.name}
          </CardTitle>
          <Badge variant="secondary" className="font-mono">
            Real-time
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative bg-secondary/20 rounded-lg p-6 min-h-96 border border-border">
          {/* Track representation */}
          <div className="relative">
            {/* Main track lines */}
            <div className="absolute left-8 right-8 top-32 h-2 bg-accent rounded-full"></div>
            <div className="absolute left-8 right-8 top-40 h-2 bg-accent rounded-full"></div>
            
            {/* Track labels */}
            <div className="absolute left-2 top-30 text-xs text-muted-foreground font-mono">UP</div>
            <div className="absolute left-2 top-38 text-xs text-muted-foreground font-mono">DOWN</div>

            {/* Stations/Platforms */}
            {section.platforms.map((platform, index) => (
              <div
                key={platform.id}
                className={`absolute w-16 h-20 border-2 rounded-lg flex flex-col items-center justify-center text-xs
                  ${platform.occupied ? 'border-warning bg-warning/20' : 'border-accent bg-accent/20'}`}
                style={{
                  left: `${20 + index * 30}%`,
                  top: '20px'
                }}
              >
                <div className="font-bold text-foreground">PF {platform.number}</div>
                <div className="text-muted-foreground">{platform.length}m</div>
                {platform.occupied && (
                  <Badge className="text-xs mt-1 bg-warning">Occupied</Badge>
                )}
              </div>
            ))}

            {/* Signals */}
            {section.signals.map((signal, index) => (
              <div
                key={signal.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${15 + (signal.position / section.length) * 70}%`,
                  top: '80px'
                }}
              >
                <div className={getSignalColor(signal.state)}></div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {signal.id}
                </div>
                <div className="text-xs text-muted-foreground">
                  {signal.type}
                </div>
              </div>
            ))}

            {/* Track blocks */}
            {section.blocks.map((block, index) => (
              <div
                key={block.id}
                className={`absolute h-8 border rounded flex items-center justify-center text-xs font-mono
                  ${block.occupied ? 'bg-critical/30 border-critical' : 'bg-success/30 border-success'}`}
                style={{
                  left: `${10 + (block.start / section.length) * 80}%`,
                  width: `${((block.end - block.start) / section.length) * 80}%`,
                  top: '180px'
                }}
              >
                <div className="text-center">
                  <div>{block.id}</div>
                  {block.occupied && block.occupyingTrain && (
                    <div className="text-critical font-bold">{block.occupyingTrain}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Trains on track */}
            {trains.map((train) => {
              const trackY = train.direction === 'UP' ? 128 : 160; // Position on UP or DOWN track
              const trainX = 10 + (train.currentPosition / section.length) * 80;
              
              return (
                <div
                  key={train.id}
                  className="absolute flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${trainX}%`,
                    top: `${trackY}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="text-2xl">{getTrainIcon(train)}</div>
                  <div className="bg-background/90 border border-border rounded px-2 py-1 text-xs font-mono">
                    <div className="font-bold text-primary">{train.number}</div>
                    <div className="text-muted-foreground">{Math.round(train.currentSpeed)} km/h</div>
                    {train.delay > 0 && (
                      <div className="text-warning">+{train.delay}m</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Distance markers */}
            <div className="absolute bottom-4 left-8 right-8 flex justify-between text-xs text-muted-foreground font-mono">
              {[0, 10, 20, 30, 35].map((km) => (
                <div key={km} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-muted-foreground/50"></div>
                  <span>{km}km</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status indicators */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="bg-background/90 border border-border rounded p-2 text-xs">
              <div className="font-bold text-foreground mb-1">Section Status</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="train-signal green"></div>
                  <span>Normal Operation</span>
                </div>
                <div>Length: {section.length} km</div>
                <div>Max Speed: {section.maxSpeed} km/h</div>
                <div>Active Trains: {trains.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚄</span>
            <span>Express</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚃</span>
            <span>Passenger</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚂</span>
            <span>Freight</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="train-signal green"></div>
            <span>Clear</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="train-signal amber"></div>
            <span>Caution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="train-signal red"></div>
            <span>Stop</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};