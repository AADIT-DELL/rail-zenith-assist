import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train } from '@/types/railway';

interface TrainGraphProps {
  trains: Train[];
}

export const TrainGraph = ({ trains }: TrainGraphProps) => {
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);

  const getTrainColor = (train: Train) => {
    switch (train.type) {
      case 'EXPRESS':
        return 'bg-primary';
      case 'PASSENGER':
        return 'bg-accent';
      case 'FREIGHT':
        return 'bg-warning';
      default:
        return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-success';
      case 'DELAYED':
        return 'bg-warning';
      case 'STOPPED':
        return 'bg-critical';
      default:
        return 'bg-muted';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Card className="control-panel h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="train-signal green"></div>
            Time-Distance Chart
          </CardTitle>
          <Badge variant="secondary" className="font-mono">
            Live Tracking
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-96 bg-secondary/20 border border-border rounded-lg mx-4 mb-4 overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute border-l border-muted-foreground/20"
                style={{ left: `${(i + 1) * 12.5}%` }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute border-t border-muted-foreground/20"
                style={{ top: `${(i + 1) * 16.66}%` }}
              />
            ))}
          </div>

          {/* Time axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 py-1 text-xs text-muted-foreground bg-background/80">
            {[...Array(8)].map((_, i) => {
              const time = new Date(Date.now() + i * 15 * 60000);
              return (
                <span key={i} className="font-mono">
                  {formatTime(time)}
                </span>
              );
            })}
          </div>

          {/* Distance axis */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between py-2 px-1 text-xs text-muted-foreground">
            {[35, 30, 25, 20, 15, 10, 5, 0].map((km) => (
              <span key={km} className="font-mono bg-background/80 px-1 rounded">
                {km}km
              </span>
            ))}
          </div>

          {/* Train trajectories */}
          <div className="absolute inset-0 pl-8 pb-8">
            {trains.map((train) => {
              const x = ((train.currentPosition / 35) * 100); // Position as percentage
              const y = 100 - x; // Invert Y for upward movement
              
              return (
                <div
                  key={train.id}
                  className={`absolute w-3 h-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-150 ${getTrainColor(train)} 
                    ${selectedTrain === train.id ? 'ring-2 ring-primary scale-150' : ''}`}
                  style={{
                    left: `${Math.random() * 80 + 10}%`, // Simulate time progression
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => setSelectedTrain(selectedTrain === train.id ? null : train.id)}
                  title={`${train.number} - ${train.type}`}
                >
                  <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-mono whitespace-nowrap 
                    ${selectedTrain === train.id ? 'opacity-100' : 'opacity-0 hover:opacity-100'} transition-opacity`}>
                    <div className="bg-background/90 px-2 py-1 rounded border border-border">
                      <div className="text-primary font-bold">{train.number}</div>
                      <div className="text-muted-foreground">{Math.round(train.currentSpeed)} km/h</div>
                      {train.delay > 0 && (
                        <div className="text-warning">+{train.delay}m</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected train details */}
          {selectedTrain && (
            <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-3 min-w-48">
              {(() => {
                const train = trains.find(t => t.id === selectedTrain);
                return train ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{train.number}</span>
                      <Badge className={getStatusColor(train.status)}>
                        {train.status}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Type: <span className="font-mono">{train.type}</span></div>
                      <div>Speed: <span className="font-mono">{Math.round(train.currentSpeed)} km/h</span></div>
                      <div>Position: <span className="font-mono">{train.currentPosition.toFixed(1)} km</span></div>
                      <div>Direction: <span className="font-mono">{train.direction}</span></div>
                      {train.delay > 0 && (
                        <div className="text-warning">Delay: +{train.delay} minutes</div>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 px-4 pb-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Express</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span>Passenger</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>Freight</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};