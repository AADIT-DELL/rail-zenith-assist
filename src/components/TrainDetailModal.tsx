import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Train } from '@/types/railway';
import { Clock, MapPin, Gauge, AlertTriangle, Route } from 'lucide-react';

interface TrainDetailModalProps {
  train: Train | null;
  isOpen: boolean;
  onClose: () => void;
  sectionLength: number;
}

export const TrainDetailModal = ({ train, isOpen, onClose, sectionLength }: TrainDetailModalProps) => {
  if (!train) return null;

  const timeToReachStation = () => {
    const remainingDistance = sectionLength - train.currentPosition;
    if (train.currentSpeed === 0) return 'Stopped';
    
    const timeInHours = remainingDistance / train.currentSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    if (timeInMinutes < 60) {
      return `${timeInMinutes} min`;
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const getTrainIcon = () => {
    switch (train.type) {
      case 'EXPRESS': return '🚄';
      case 'PASSENGER': return '🚃';
      case 'FREIGHT': return '🚂';
      default: return '🚋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-success text-success-foreground';
      case 'DELAYED': return 'bg-warning text-warning-foreground';
      case 'STOPPED': return 'bg-destructive text-destructive-foreground';
      case 'APPROACHING': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EXPRESS': return 'bg-primary text-primary-foreground';
      case 'PASSENGER': return 'bg-secondary text-secondary-foreground';
      case 'FREIGHT': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{getTrainIcon()}</span>
            <div>
              <div className="font-mono text-lg">{train.number}</div>
              <div className="text-sm text-muted-foreground font-normal">
                Train Details & Status
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badges */}
          <div className="flex gap-2">
            <Badge className={getTypeColor(train.type)}>
              {train.type}
            </Badge>
            <Badge className={getStatusColor(train.status)}>
              {train.status}
            </Badge>
            <Badge variant="outline" className="font-mono">
              Priority {train.priority}
            </Badge>
          </div>

          {/* Speed & Position */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Current Speed</div>
                    <div className="text-lg font-mono font-bold">
                      {Math.round(train.currentSpeed)} km/h
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Position</div>
                    <div className="text-lg font-mono font-bold">
                      {train.currentPosition.toFixed(1)} km
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timing Information */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Timing Information</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled Arrival:</span>
                  <span className="font-mono">{train.scheduledArrival.toLocaleTimeString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Arrival:</span>
                  <span className="font-mono">{train.estimatedArrival.toLocaleTimeString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Delay:</span>
                  <span className={`font-mono font-bold ${train.delay > 0 ? 'text-warning' : 'text-success'}`}>
                    {train.delay > 0 ? `+${train.delay}` : '0'} min
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Time to Station:</span>
                  <span className="font-mono text-primary">{timeToReachStation()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route & Technical Info */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Route className="h-4 w-4 text-primary" />
                <span className="font-medium">Technical Details</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground block">Max Speed:</span>
                  <span className="font-mono font-bold">{train.maxSpeed} km/h</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Length:</span>
                  <span className="font-mono font-bold">{train.length}m</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Direction:</span>
                  <span className="font-mono font-bold">{train.direction}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Platform:</span>
                  <span className="font-mono font-bold">{train.platform || 'TBD'}</span>
                </div>
              </div>

              {train.route && train.route.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm block mb-1">Route:</span>
                  <div className="text-xs font-mono bg-secondary/20 rounded p-2">
                    {train.route.join(' → ')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          {(train.status === 'DELAYED' || train.delay > 5) && (
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-warning">Attention Required</div>
                <div className="text-muted-foreground">
                  {train.status === 'DELAYED' ? 'Train is experiencing delays' : 'Train is running behind schedule'}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};