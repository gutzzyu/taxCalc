import React, { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Home, MapPin, Building, Building2, TrendingUp, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/taxComputations';

const PROPERTY_TYPES = [
  { id: 'land', label: 'Land', icon: MapPin },
  { id: 'condo', label: 'Condo', icon: Building },
  { id: 'building', label: 'Building', icon: Building2 },
  { id: 'stocks', label: 'Stocks', icon: TrendingUp },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
];

export default function EstatePropertyForm({ properties, onChange, hasFamilyHome, dateOfDeath }) {
  const addProperty = () => {
    onChange([...properties, { propertyType: '', isFamilyHome: false }]);
  };

  const removeProperty = (index) => {
    onChange(properties.filter((_, i) => i !== index));
  };

  const updateProperty = (index, field, value) => {
    const updated = [...properties];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'isFamilyHome' && value) {
      updated.forEach((p, i) => { if (i !== index) p.isFamilyHome = false; });
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Home className="w-4 h-4 text-secondary" /> Estate Properties ({properties.length})
        </h3>
      </div>

      <AnimatePresence>
        {properties.map((prop, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-border/50 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Property #{index + 1}
                  {prop.isFamilyHome && (
                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Home className="w-3 h-3" /> Family Home
                    </span>
                  )}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeProperty(index)} className="text-destructive hover:text-destructive h-7 w-7">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Type as Tabs */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Property Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateProperty(index, 'propertyType', id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          prop.propertyType === id
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {prop.propertyType === 'land' && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Input placeholder="Property description" value={prop.description || ''} onChange={(e) => updateProperty(index, 'description', e.target.value)} />
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                      <Checkbox
                        id={`family-home-${index}`}
                        checked={prop.isFamilyHome || false}
                        onCheckedChange={(v) => updateProperty(index, 'isFamilyHome', v)}
                        disabled={hasFamilyHome && !prop.isFamilyHome}
                      />
                      <Label htmlFor={`family-home-${index}`} className="text-xs cursor-pointer">🏠 Mark as Family Home (auto-applies ₱5M standard deduction)</Label>
                    </div>

                    <EstateLandFields prop={prop} index={index} updateProperty={updateProperty} showImprovement={true} />
                  </>
                )}

                {(prop.propertyType === 'condo' || prop.propertyType === 'building') && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Input placeholder="Property description" value={prop.description || ''} onChange={(e) => updateProperty(index, 'description', e.target.value)} />
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                      <Checkbox
                        id={`family-home-${index}`}
                        checked={prop.isFamilyHome || false}
                        onCheckedChange={(v) => updateProperty(index, 'isFamilyHome', v)}
                        disabled={hasFamilyHome && !prop.isFamilyHome}
                      />
                      <Label htmlFor={`family-home-${index}`} className="text-xs cursor-pointer">🏠 Mark as Family Home (auto-applies ₱5M standard deduction)</Label>
                    </div>

                    {/* Building/Condo: no improvement checkbox - the building itself is the improvement */}
                    <EstateLandFields prop={prop} index={index} updateProperty={updateProperty} showImprovement={false} />
                  </>
                )}

                {prop.propertyType === 'stocks' && (
                  <EstateStockFields prop={prop} index={index} updateProperty={updateProperty} dateOfDeath={dateOfDeath} />
                )}

                {prop.propertyType === 'vehicles' && (
                  <EstateVehicleFields prop={prop} index={index} updateProperty={updateProperty} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add button BELOW all property cards so user doesn't need to scroll up */}
      <Button
        variant="outline"
        className="w-full text-secondary border-secondary/30 hover:bg-secondary/10 border-dashed"
        onClick={addProperty}
      >
        <Plus className="w-4 h-4 mr-2" /> Add Property
      </Button>
    </div>
  );
}

function EstateLandFields({ prop, index, updateProperty, showImprovement }) {
  const areaZonal = (prop.area || 0) * (prop.zonalValue || 0);
  const fmvHigher = Math.max(prop.fairMarketValue || 0, areaZonal);
  const taxBase = fmvHigher + (showImprovement && prop.hasImprovement ? (prop.improvementAmount || 0) : 0);

  return (
    <div className="space-y-4">
      {prop.propertyType === 'land' && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Land Classification</Label>
          <Select value={prop.landClassification || ''} onValueChange={(v) => updateProperty(index, 'landClassification', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="agricultural">Agricultural</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Fair Market Value</Label>
          <Input type="number" placeholder="0.00" value={prop.fairMarketValue || ''} onChange={(e) => updateProperty(index, 'fairMarketValue', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Area (sq.m.)</Label>
          <Input type="number" placeholder="0.00" value={prop.area || ''} onChange={(e) => updateProperty(index, 'area', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Zonal Value (/sq.m.)</Label>
          <Input type="number" placeholder="0.00" value={prop.zonalValue || ''} onChange={(e) => updateProperty(index, 'zonalValue', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      {/* Only show improvement for LAND, not building/condo */}
      {showImprovement && (
        <div className="space-y-3 pt-1 border-t">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`improvement-${index}`}
              checked={prop.hasImprovement || false}
              onCheckedChange={(v) => updateProperty(index, 'hasImprovement', v)}
            />
            <Label htmlFor={`improvement-${index}`} className="text-xs cursor-pointer">🏗️ Has improvements / structure on property</Label>
          </div>
          {prop.hasImprovement && (
            <div className="pl-6 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Value of Improvements (added to Gross Estate)</Label>
              <Input type="number" placeholder="0.00" value={prop.improvementAmount || ''} onChange={(e) => updateProperty(index, 'improvementAmount', parseFloat(e.target.value) || 0)} />
            </div>
          )}
        </div>
      )}

      <div className="p-2 bg-secondary/5 rounded text-xs text-muted-foreground">
        <strong>Computed FMV = {formatCurrency(taxBase)}</strong> (higher of FMV vs Area × Zonal{showImprovement && prop.hasImprovement ? ' + Improvement' : ''})
      </div>
    </div>
  );
}

function EstateStockFields({ prop, index, updateProperty, dateOfDeath }) {
  const isListed = prop.stockListing === 'listed';
  const isNonListed = prop.stockListing === 'non-listed';
  const [pseError, setPseError] = useState('');

  const handlePSELookup = async () => {
    setPseError('PSE lookup requires an internet API. Please enter the price manually.');
  };

  let computedValue = 0;
  if (isListed) {
    computedValue = (prop.marketPriceAtDeath || 0) * (prop.numberOfShares || 0);
  } else if (isNonListed) {
    if (prop.shareType === 'common') {
      const bvps = prop.outstandingShares > 0 ? (prop.shareholdersEquity || 0) / prop.outstandingShares : 0;
      computedValue = bvps * (prop.numberOfShares || 0);
    } else if (prop.shareType === 'preferred') {
      computedValue = (prop.parValue || 0) * (prop.numberOfShares || 0);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Company / Description</Label>
        <Input placeholder="Company name or description" value={prop.description || ''} onChange={(e) => updateProperty(index, 'description', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Stock Type</Label>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex-1">
            <Checkbox
              id={`listed-${index}`}
              checked={prop.stockListing === 'listed'}
              onCheckedChange={(v) => updateProperty(index, 'stockListing', v ? 'listed' : '')}
            />
            <Label htmlFor={`listed-${index}`} className="text-sm cursor-pointer text-amber-900">📈 Listed (PSE)</Label>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex-1">
            <Checkbox
              id={`nonlisted-${index}`}
              checked={prop.stockListing === 'non-listed'}
              onCheckedChange={(v) => updateProperty(index, 'stockListing', v ? 'non-listed' : '')}
            />
            <Label htmlFor={`nonlisted-${index}`} className="text-sm cursor-pointer text-amber-900">🏦 Non-Listed</Label>
          </div>
        </div>
      </div>

      {isListed && (
        <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
          <div className="text-xs font-semibold text-primary">📈 Listed Stock — FMV at Date of Death</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Stock Ticker (PSE Symbol)</Label>
              <Input placeholder="e.g. SM, BDO, ALI" value={prop.stockTicker || ''} onChange={(e) => updateProperty(index, 'stockTicker', e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">No. of Shares</Label>
              <Input type="number" placeholder="0" value={prop.numberOfShares || ''} onChange={(e) => updateProperty(index, 'numberOfShares', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Market Price at Date of Death (per share)</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="0.00" value={prop.marketPriceAtDeath || ''} onChange={(e) => updateProperty(index, 'marketPriceAtDeath', parseFloat(e.target.value) || 0)} />
              <button
                type="button"
                onClick={handlePSELookup}
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 whitespace-nowrap"
              >
                🔍 PSE Lookup
              </button>
            </div>
            {pseError && <p className="text-xs mt-1 text-destructive">{pseError}</p>}
          </div>
          <div className="p-2 bg-secondary/10 rounded text-xs">
            <strong>FMV = Market Price × Shares = {formatCurrency(computedValue)}</strong>
          </div>
        </div>
      )}

      {isNonListed && (
        <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
          <div className="text-xs font-semibold text-primary">🏦 Non-Listed Stock Valuation</div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Share Type</Label>
            <Select value={prop.shareType || ''} onValueChange={(v) => updateProperty(index, 'shareType', v)}>
              <SelectTrigger><SelectValue placeholder="Select share type..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common Shares — Book Value</SelectItem>
                <SelectItem value="preferred">Preferred Shares — Par Value (AOI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {prop.shareType === 'common' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Shareholders' Equity / Net Asset</Label>
                  <Input type="number" placeholder="0.00" value={prop.shareholdersEquity || ''} onChange={(e) => updateProperty(index, 'shareholdersEquity', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Total Outstanding Shares</Label>
                  <Input type="number" placeholder="0" value={prop.outstandingShares || ''} onChange={(e) => updateProperty(index, 'outstandingShares', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">No. of Shares (decedent)</Label>
                  <Input type="number" placeholder="0" value={prop.numberOfShares || ''} onChange={(e) => updateProperty(index, 'numberOfShares', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Book Value per Share (auto)</Label>
                  <Input type="number" readOnly value={prop.outstandingShares > 0 ? ((prop.shareholdersEquity || 0) / prop.outstandingShares).toFixed(4) : '0'} className="bg-muted/30" />
                </div>
              </div>
              <div className="p-2 bg-secondary/10 rounded text-xs">
                <strong>FMV = Book Value/Share × Shares = {formatCurrency(computedValue)}</strong>
              </div>
            </div>
          )}

          {prop.shareType === 'preferred' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Par Value per Share (per AOI)</Label>
                  <Input type="number" placeholder="0.00" value={prop.parValue || ''} onChange={(e) => updateProperty(index, 'parValue', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">No. of Shares (decedent)</Label>
                  <Input type="number" placeholder="0" value={prop.numberOfShares || ''} onChange={(e) => updateProperty(index, 'numberOfShares', parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div className="p-2 bg-secondary/10 rounded text-xs">
                <strong>FMV = Par Value × Shares = {formatCurrency(computedValue)}</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EstateVehicleFields({ prop, index, updateProperty }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Plate Number</Label>
        <Input placeholder="Enter plate number" value={prop.plateNumber || ''} onChange={(e) => updateProperty(index, 'plateNumber', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Brand</Label>
        <Input placeholder="e.g. Toyota" value={prop.brand || ''} onChange={(e) => updateProperty(index, 'brand', e.target.value)} />
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label className="text-xs text-muted-foreground">Vehicle Value</Label>
        <Input type="number" placeholder="0.00" value={prop.vehicleValue || ''} onChange={(e) => updateProperty(index, 'vehicleValue', parseFloat(e.target.value) || 0)} />
      </div>
    </div>
  );
}
