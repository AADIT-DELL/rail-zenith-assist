import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { Section } from '@/types/railway';

interface SectionSelectorProps {
  sections: Section[];
  selectedSection: string | null;
  onSectionChange: (sectionId: string) => void;
}

export const SectionSelector = ({ sections, selectedSection, onSectionChange }: SectionSelectorProps) => {
  const currentSection = sections.find(s => s.id === selectedSection);

  return (
    <Card className="control-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Section Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Section</label>
            <Select value={selectedSection || ''} onValueChange={onSectionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose section to monitor" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{section.name}</span>
                      <Badge variant="secondary" className="ml-2 font-mono text-xs">
                        {section.length}km
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentSection && (
            <div className="bg-secondary/20 rounded-lg p-3 space-y-2 text-sm">
              <div className="font-semibold text-foreground">{currentSection.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Length:</span>
                  <span className="ml-2 text-foreground">{currentSection.length} km</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Speed:</span>
                  <span className="ml-2 text-foreground">{currentSection.maxSpeed} km/h</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Platforms:</span>
                  <span className="ml-2 text-foreground">{currentSection.platforms.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Blocks:</span>
                  <span className="ml-2 text-foreground">{currentSection.blocks.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};