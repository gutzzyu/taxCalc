import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, FileText } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';
import { hectaresToSqm, formatCurrency } from '@/lib/taxComputations';

// Auto CWT rate based on taxable base value
function getCWTRate(taxBase) {
  if (!taxBase || taxBase <= 0) return null;
  if (taxBase <= 500000) return { rate: 0.015, label: '1.5%', desc: '≤ ₱500,000' };
  if (taxBase <= 2000000) return { rate: 0.03, label: '3.0%', desc: '₱500,001 – ₱2,000,000' };
  return { rate: 0.05, label: '5.0%', desc: '> ₱2,000,000' };
}

export default function LandForm({ data, onChange, mode = 'sale', showClassification = true }) {
  const update = (field, value) => {
    const newData = { ...data, [field]: value };
    if (field === 'hectares' && newData.landClassification === 'agricultural') {
      newData.area = hectaresToSqm(parseFloat(value) || 0);
    }
    onChange(newData);
  };

  const isLand = showClassification;

  // Compute taxable base for CWT display
  const areaZonal = (data?.area || 0) * (data?.zonalValue || 0);
  const fmvHigher = Math.max(data?.fairMarketValue || 0, areaZonal);
  const taxBase = fmvHigher + (isLand && data?.hasImprovement ? (data?.improvementAmount || 0) : 0);
  const sellingPrice = data?.sellingPrice || 0;
  const cwtBase = mode === 'sale' ? Math.max(sellingPrice, taxBase) : taxBase;
  const cwtInfo = (mode === 'sale' && data?.isTradeOrBusiness) ? getCWTRate(cwtBase) : null;

  return (
    <div className="space-y-4">
      {/* Property Type Selection (Land Classification / Trade toggle) */}
      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              {showClassification ? 'Land Classification' : 'Property Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showClassification && (
              <Select value={data?.landClassification || ''} onValueChange={(v) => update('landClassification', v)}>
                <SelectTrigger><SelectValue placeholder="Select classification" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Trade or Business toggle — always shown */}
            <div
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                data?.isTradeOrBusiness
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-background border-border hover:border-secondary/40'
              }`}
              onClick={() => update('isTradeOrBusiness', !data?.isTradeOrBusiness)}
            >
              <Checkbox
                id="trade-business"
                checked={data?.isTradeOrBusiness || false}
                onCheckedChange={(v) => update('isTradeOrBusiness', v)}
              />
              <Label htmlFor="trade-business" className={`text-sm cursor-pointer font-medium ${data?.isTradeOrBusiness ? 'text-amber-900' : 'text-muted-foreground'}`}>
                Used in Trade or Business (VAT will apply)
              </Label>
            </div>

            {/* VAT Registered sub-option — only shown when trade/business is checked */}
            {data?.isTradeOrBusiness && (
              <div
                className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/50 cursor-pointer ml-2"
                onClick={() => update('isVATRegistered', !data?.isVATRegistered)}
              >
                <Checkbox
                  id="vat-registered"
                  checked={data?.isVATRegistered || false}
                  onCheckedChange={(v) => update('isVATRegistered', v)}
                />
                <Label htmlFor="vat-registered" className="text-sm cursor-pointer text-amber-800">
                  VAT Registered (gross receipts ≥ ₱3M) — Apply 12% VAT
                </Label>
              </div>
            )}
          </CardContent>
        </Card>
      </StaggerChild>

      {/* Property Identification */}
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

      {/* Valuation Details */}
      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              Valuation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mode === 'sale' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Selling Price</Label>
                  <Input type="number" placeholder="0.00" value={data?.sellingPrice || ''} onChange={(e) => update('sellingPrice', parseFloat(e.target.value) || 0)} />
                </div>
              )}
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
                  readOnly={data?.landClassification === 'agricultural'}
                />
              </div>
              {data?.landClassification === 'agricultural' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Hectares</Label>
                  <Input type="number" placeholder="0" value={data?.hectares || ''} onChange={(e) => update('hectares', e.target.value)} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Zonal Value (/sq.m.)</Label>
                <Input type="number" placeholder="0.00" value={data?.zonalValue || ''} onChange={(e) => update('zonalValue', parseFloat(e.target.value) || 0)} />
              </div>
            </div>

            {/* Improvement — only for land */}
            {isLand && (
              <div className="pt-2 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has-improvement"
                    checked={data?.hasImprovement || false}
                    onCheckedChange={(v) => update('hasImprovement', v)}
                  />
                  <Label htmlFor="has-improvement" className="text-sm text-muted-foreground cursor-pointer">
                    There is an improvement on the land
                  </Label>
                </div>
                {data?.hasImprovement && (
                  <div className="space-y-1.5 pl-6">
                    <Label className="text-xs text-muted-foreground">Improvement Amount</Label>
                    <Input type="number" placeholder="0.00" value={data?.improvementAmount || ''} onChange={(e) => update('improvementAmount', parseFloat(e.target.value) || 0)} />
                  </div>
                )}
              </div>
            )}

            {/* Tax base info */}
            {taxBase > 0 && (
              <div className="p-2 bg-secondary/5 rounded text-xs text-muted-foreground">
                <strong>Tax Base = {formatCurrency(taxBase)}</strong>
                {mode === 'sale' && sellingPrice > 0 && (
                  <span className="ml-2">(Highest of SP: {formatCurrency(sellingPrice)}, FMV: {formatCurrency(fmvHigher)})</span>
                )}
              </div>
            )}

            {/* Auto CWT display — only for Sale + Trade or Business */}
            {mode === 'sale' && data?.isTradeOrBusiness && cwtBase > 0 && cwtInfo && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                <div className="text-xs font-semibold text-amber-900">📋 Creditable Withholding Tax (CWT) — Auto-computed</div>
                <div className="text-xs text-amber-800">
                  Rate: <strong>{cwtInfo.label}</strong> ({cwtInfo.desc})
                </div>
                <div className="text-xs text-amber-800">
                  CWT Amount: <strong>{formatCurrency(cwtBase * cwtInfo.rate)}</strong>
                </div>
                <div className="text-xs text-amber-600 mt-1 border-t border-amber-200 pt-1">
                  BIR rates: ≤₱500K → 1.5% | ₱500K–₱2M → 3.0% | &gt;₱2M → 5.0%
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </StaggerChild>
    </div>
  );
}
