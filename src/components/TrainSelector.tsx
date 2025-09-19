import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Train as TrainIcon } from 'lucide-react';
import { Train } from '@/types/railway';

interface TrainSelectorProps {
  trains: Train[];
  selectedTrain: string | null;
  onTrainChange: (trainId: string) => void;
}

export const TrainSelector = ({ trains, selectedTrain, onTrainChange }: TrainSelectorProps) => {
  const currentTrain = trains.find(t => t.id === selectedTrain);

  const getTrainTypeColor = (type: string) => {
    switch (type) {
      case 'EXPRESS': return 'bg-primary text-primary-foreground';
      case 'PASSENGER': return 'bg-secondary text-secondary-foreground';
      case 'FREIGHT': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="control-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrainIcon className="h-5 w-5" />
          Train Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Train to Monitor</label>
            <Select value={selectedTrain || ''} onValueChange={onTrainChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose specific train" />
              </SelectTrigger>
              <SelectContent>
                {trains.map((train) => (
                  <SelectItem key={train.id} value={train.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono">{train.number}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getTrainTypeColor(train.type)}`}>
                          {train.type}
                        </Badge>
                        {train.delay > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            +{train.delay}m
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentTrain && (
            <div className="bg-secondary/20 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono">{currentTrain.number}</span>
                <Badge className={getTrainTypeColor(currentTrain.type)}>
                  {currentTrain.type}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="ml-2 text-foreground">{Math.round(currentTrain.currentSpeed)} km/h</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <span className="ml-2 text-foreground">{currentTrain.currentPosition.toFixed(1)} km</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Delay:</span>
                  <span className={`ml-2 ${currentTrain.delay > 0 ? 'text-warning' : 'text-success'}`}>
                    {currentTrain.delay > 0 ? `+${currentTrain.delay}` : '0'} min
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 text-foreground">{currentTrain.status}</span>
                </div>
              </div>
              
              <div className="text-xs font-mono pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ETA:</span>
                  <span className="text-foreground">
                    {currentTrain.estimatedArrival.toLocaleTimeString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};