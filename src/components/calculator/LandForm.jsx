import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, FileText } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';
import { hectaresToSqm } from '@/lib/taxComputations';

export default function LandForm({ data, onChange, mode = 'sale', showClassification = true }) {
  const update = (field, value) => {
    const newData = { ...data, [field]: value };
    // Auto-convert hectares to sqm for agricultural
    if (field === 'hectares' && newData.landClassification === 'agricultural') {
      newData.area = hectaresToSqm(parseFloat(value) || 0);
    }
    onChange(newData);
  };

  // Land = showClassification=true (land type)
  // Building/Condo = showClassification=false (structure, no improvement needed)
  const isLand = showClassification;

  return (
    <div className="space-y-4">
      {showClassification &&
      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              Land Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={data?.landClassification || ''} onValueChange={(v) => update('landClassification', v)}>
              <SelectTrigger><SelectValue placeholder="Select classification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="agricultural">Agricultural</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Checkbox
                id="trade-business"
                checked={data?.isTradeOrBusiness || false}
                onCheckedChange={(v) => update('isTradeOrBusiness', v)} />
              <Label htmlFor="trade-business" className="text-sm text-muted-foreground cursor-pointer">
                Property is used in trade or business
              </Label>
            </div>
          </CardContent>
        </Card>
      </StaggerChild>
      }

      {/* For building/condo, show trade or business option */}
      {!showClassification &&
      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="trade-business"
                checked={data?.isTradeOrBusiness || false}
                onCheckedChange={(v) => update('isTradeOrBusiness', v)} />
              <Label htmlFor="trade-business" className="text-sm text-muted-foreground cursor-pointer">
                Property is used in trade or business
              </Label>
            </div>
          </CardContent>
        </Card>
      </StaggerChild>
      }

      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              Property Identification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Title No.</Label>
                <Input placeholder="Enter title number" value={data?.titleNo || ''} onChange={(e) => update('titleNo', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tax Declaration No.</Label>
                <Input placeholder="Enter tax declaration" value={data?.taxDecNo || ''} onChange={(e) => update('taxDecNo', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cadastral No.</Label>
                <Input placeholder="Enter cadastral number" value={data?.cadastralNo || ''} onChange={(e) => update('cadastralNo', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Survey No.</Label>
                <Input placeholder="Enter survey number" value={data?.surveyNo || ''} onChange={(e) => update('surveyNo', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </StaggerChild>

      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              Valuation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mode === 'sale' &&
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Selling Price</Label>
                <Input type="number" placeholder="0.00" value={data?.sellingPrice || ''} onChange={(e) => update('sellingPrice', parseFloat(e.target.value) || 0)} />
              </div>
              }
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fair Market Value</Label>
                <Input type="number" placeholder="0.00" value={data?.fairMarketValue || ''} onChange={(e) => update('fairMarketValue', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {data?.landClassification === 'agricultural' ? 'Area (auto-converted from hectares)' : 'Area (sq.m.)'}
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={data?.area || ''}
                  onChange={(e) => update('area', parseFloat(e.target.value) || 0)}
                  readOnly={data?.landClassification === 'agricultural'} />
              </div>
              {data?.landClassification === 'agricultural' &&
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Hectares</Label>
                <Input type="number" placeholder="0" value={data?.hectares || ''} onChange={(e) => update('hectares', e.target.value)} />
              </div>
              }
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Zonal Value (/sq.m.)</Label>
                <Input type="number" placeholder="0.00" value={data?.zonalValue || ''} onChange={(e) => update('zonalValue', parseFloat(e.target.value) || 0)} />
              </div>
            </div>

            {/* Only show improvement for LAND, not building/condo */}
            {isLand && (
              <div className="pt-2 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has-improvement"
                    checked={data?.hasImprovement || false}
                    onCheckedChange={(v) => update('hasImprovement', v)} />
                  <Label htmlFor="has-improvement" className="text-sm text-muted-foreground cursor-pointer">
                    There is an improvement on the land
                  </Label>
                </div>
                {data?.hasImprovement &&
                <div className="space-y-1.5 pl-6">
                  <Label className="text-xs text-muted-foreground">Improvement Amount</Label>
                  <Input type="number" placeholder="0.00" value={data?.improvementAmount || ''} onChange={(e) => update('improvementAmount', parseFloat(e.target.value) || 0)} />
                </div>
                }
              </div>
            )}
          </CardContent>
        </Card>
      </StaggerChild>
    </div>
  );
}
