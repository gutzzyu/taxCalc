import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Info } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';
import AnimatedSection from './AnimatedSection';

export default function StocksForm({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });
  const stockType = data?.stockType || '';

  return (
    <div className="space-y-4">
      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Stock Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={stockType} onValueChange={(v) => update('stockType', v)}>
              <SelectTrigger><SelectValue placeholder="Select stock type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="listed">Listed</SelectItem>
                <SelectItem value="non-listed">Non-Listed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </StaggerChild>

      {/* Trade or Business Toggle */}
      <StaggerChild>
        <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
          <input
            type="checkbox"
            id="isTradeOrBusiness"
            checked={data.isTradeOrBusiness || false}
            onChange={(e) => update('isTradeOrBusiness', e.target.checked)}
            className="w-4 h-4" />
          
          <label htmlFor="isTradeOrBusiness" className="text-sm font-medium cursor-pointer">
            Used in Trade or Business (VAT will apply)
          </label>
        </div>
      </StaggerChild>

      {stockType &&
      <AnimatedSection keyProp={stockType}>
          {stockType === 'listed' ?
        <ListedStockFields data={data} update={update} /> :

        <NonListedStockFields data={data} update={update} />
        }
        </AnimatedSection>
      }
    </div>);

}

function ListedStockFields({ data, update }) {
  return (
    <Card className="border-2 border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Listed Stock Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Stock Name</Label>
            <Input placeholder="Company Name" value={data?.stockName || ''} onChange={(e) => update('stockName', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Stock Ticker</Label>
            <Input placeholder="e.g., GLO, TEL" value={data?.tickerSymbol || ''} onChange={(e) => update('tickerSymbol', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Transaction Date</Label>
            <Input type="date" value={data?.tradeDate || ''} onChange={(e) => update('tradeDate', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Number of Shares</Label>
            <Input type="number" placeholder="0" value={data?.numberOfShares || ''} onChange={(e) => update('numberOfShares', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Selling Price per Share (₱)</Label>
            <Input type="number" placeholder="0.00" value={data?.sellingPrice || ''} onChange={(e) => update('sellingPrice', parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-semibold">Gross Sales Value (₱)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={data?.grossSalesValue || ''}
            onChange={(e) => update('grossSalesValue', parseFloat(e.target.value) || 0)}
            className="font-semibold" />
          
        </div>

        <div className="flex items-start gap-2 p-3 bg-secondary/5 rounded-lg border border-secondary/20">
          <Info className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong>Pro-Tip:</strong> If you are a Dealer in Securities, the 0.1% STT does not apply. Instead, you are taxed on Net Income at regular corporate or graduated income tax rates.
          </p>
        </div>
      </CardContent>
    </Card>);

}

function NonListedStockFields({ data, update }) {
  const bvps = data?.outstandingCapitalShares > 0 ? (data.shareholdersEquity / data.outstandingCapitalShares).toFixed(2) : '0.00';

  return (
    <Card className="border-2 border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Non-Listed Stock Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Company Name</Label>
            <Input placeholder="Corporation Name" value={data?.companyName || ''} onChange={(e) => update('companyName', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Number of Shares to Transfer</Label>
            <Input type="number" placeholder="0" value={data?.numberOfShares || ''} onChange={(e) => update('numberOfShares', parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Shareholder's Equity (₱)</Label>
            <Input type="number" placeholder="0.00" value={data?.shareholdersEquity || ''} onChange={(e) => update('shareholdersEquity', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Outstanding Capital Shares</Label>
            <Input type="number" placeholder="0" value={data?.outstandingCapitalShares || ''} onChange={(e) => update('outstandingCapitalShares', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Book Value per Share (₱)</Label>
            <Input type="number" value={bvps} disabled className="bg-muted font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Agreed Transfer Price per Share (₱)</Label>
            <Input type="number" placeholder="0.00" value={data?.sellingPrice || ''} onChange={(e) => update('sellingPrice', parseFloat(e.target.value) || 0)} />
          </div>
          


          
        </div>
      </CardContent>
    </Card>);

}