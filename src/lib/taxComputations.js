// Philippine Tax Computation Engine

// ========== SALE OF REAL PROPERTY ==========
export function computeSaleRealProperty(data) {
  const { sellingPrice = 0, fairMarketValue = 0, area = 0, zonalValue = 0, isTradeOrBusiness = false, hasImprovement = false, improvementAmount = 0 } = data;
  
  const areaTimesZonal = area * zonalValue;
  const taxBase = Math.max(sellingPrice, fairMarketValue, areaTimesZonal) + (hasImprovement ? improvementAmount : 0);
  
  if (isTradeOrBusiness) {
    const cwt = taxBase * 0.06;
    const vat = sellingPrice * 0.12; // Always apply VAT for trade/business
    const dst = taxBase * 0.015;
    const transferTax = taxBase * 0.0075;
    
    return {
      taxBase,
      sellingPrice,
      fairMarketValue,
      areaTimesZonal,
      isTradeOrBusiness: true,
      cwt,
      vat,
      dst,
      transferTax,
      totalTax: cwt + vat + dst + transferTax,
      breakdown: [
        { label: 'Tax Base (Highest Value)', value: taxBase },
        { label: 'Creditable Withholding Tax (CWT) 6%', value: cwt },
        { label: 'Value Added Tax (VAT) 12%', value: vat },
        { label: 'Documentary Stamp Tax (DST) 1.5%', value: dst },
        { label: 'Transfer Tax 0.75%', value: transferTax },
      ]
    };
  }
  
  const cgt = taxBase * 0.06;
  const dst = taxBase * 0.015;
  const transferTax = taxBase * 0.0075;
  
  return {
    taxBase,
    sellingPrice,
    fairMarketValue,
    areaTimesZonal,
    isTradeOrBusiness: false,
    cgt,
    dst,
    transferTax,
    totalTax: cgt + dst + transferTax,
    breakdown: [
      { label: 'Tax Base (Highest Value)', value: taxBase },
      { label: 'Capital Gains Tax (CGT) 6%', value: cgt },
      { label: 'Documentary Stamp Tax (DST) 1.5%', value: dst },
      { label: 'Transfer Tax 0.75%', value: transferTax },
    ]
  };
}

// ========== DONATION OF REAL PROPERTY ==========
export function computeDonationRealProperty(data) {
  const { fairMarketValue = 0, area = 0, zonalValue = 0, hasImprovement = false, improvementAmount = 0 } = data;
  
  const areaTimesZonal = area * zonalValue;
  const taxBase = Math.max(fairMarketValue, areaTimesZonal) + (hasImprovement ? improvementAmount : 0);
  const netGift = Math.max(taxBase - 250000, 0);
  const donorsTax = netGift * 0.06;
  const dst = taxBase * 0.015;
  const transferTax = taxBase * 0.0075;
  
  return {
    taxBase,
    fairMarketValue,
    areaTimesZonal,
    standardDeduction: 250000,
    netGift,
    donorsTax,
    dst,
    transferTax,
    totalTax: donorsTax + dst + transferTax,
    breakdown: [
      { label: 'Tax Base (Highest of FMV or Area × Zonal)', value: taxBase },
      { label: 'Less: Standard Deduction', value: 250000 },
      { label: 'Net Gift', value: netGift },
      { label: "Donor's Tax 6%", value: donorsTax },
      { label: 'Documentary Stamp Tax (DST) 1.5%', value: dst },
      { label: 'Transfer Tax 0.75%', value: transferTax },
    ]
  };
}

// ========== SALE OF STOCKS - LISTED ==========
export function computeSaleStocksListed(data) {
  const { grossSalesValue = 0, isTradeOrBusiness = false, sellingPrice = 0 } = data;
  
  const stt = grossSalesValue * 0.001;
  const vat = isTradeOrBusiness ? (sellingPrice || grossSalesValue) * 0.12 : 0;
  
  return {
    grossSalesValue,
    stt,
    vat,
    dst: 0,
    totalTax: stt + vat,
    breakdown: [
      { label: 'Gross Sales Value', value: grossSalesValue },
      { label: 'Stock Transaction Tax (STT) 0.1%', value: stt },
      ...(isTradeOrBusiness ? [{ label: 'Value Added Tax (VAT) 12%', value: vat }] : []),
      { label: 'DST', value: 0, note: 'Exempt (CMEPA)' },
    ]
  };
}

// ========== SALE OF STOCKS - NON-LISTED ==========
export function computeSaleStocksNonListed(data) {
  const { numberOfShares = 0, shareholdersEquity = 0, outstandingCapitalShares = 0, sellingPrice = 0, acquisitionCost = 0 } = data;
  
  const bvps = outstandingCapitalShares > 0 ? shareholdersEquity / outstandingCapitalShares : 0;
  const bookValue = bvps * numberOfShares;
  const results = { bvps, bookValue, numberOfShares, sellingPrice, acquisitionCost };
  
  if (sellingPrice >= bvps) {
    // Sale at Book Value or Higher - CGT Only
    const netGain = (sellingPrice - acquisitionCost) * numberOfShares;
    const cgt = netGain * 0.15;
    const vat = data.isTradeOrBusiness ? sellingPrice * numberOfShares * 0.12 : 0;
    return {
      ...results,
      scenario: 'at_or_above_book',
      netGain,
      cgt,
      vat,
      totalTax: cgt + vat,
      breakdown: [
        { label: 'Book Value per Share (BVPS)', value: bvps },
        { label: 'Net Gain', value: netGain },
        { label: 'Capital Gains Tax (CGT) 15%', value: cgt },
        ...(data.isTradeOrBusiness ? [{ label: 'Value Added Tax (VAT) 12%', value: vat }] : []),
      ]
    };
  } else if (sellingPrice === 0) {
    // Pure Donation - Donor's Tax Only
    const grossGift = bvps * numberOfShares;
    const taxableNetGift = Math.max(grossGift - 250000, 0);
    const donorsTax = taxableNetGift * 0.06;
    return {
      ...results,
      scenario: 'donation',
      grossGift,
      taxableNetGift,
      donorsTax,
      totalTax: donorsTax,
      breakdown: [
        { label: 'Book Value per Share (BVPS)', value: bvps },
        { label: 'Gross Gift (BVPS × Shares)', value: grossGift },
        { label: 'Less: Annual Exemption', value: 250000 },
        { label: 'Taxable Net Gift', value: taxableNetGift },
        { label: "Donor's Tax 6%", value: donorsTax },
      ]
    };
  } else {
    // Sale at Less than Book Value - BOTH
    const cgt = (sellingPrice - acquisitionCost) * numberOfShares * 0.15;
    const deemedGift = (bvps - sellingPrice) * numberOfShares;
    const donorsTax = Math.max(deemedGift - 250000, 0) * 0.06;
    const vat = data.isTradeOrBusiness ? sellingPrice * numberOfShares * 0.12 : 0;
    return {
      ...results,
      scenario: 'below_book',
      cgt,
      deemedGift,
      donorsTax,
      vat,
      totalTax: cgt + donorsTax + vat,
      breakdown: [
        { label: 'Book Value per Share (BVPS)', value: bvps },
        { label: 'CGT = (SP - Cost) × 15%', value: cgt },
        { label: 'Deemed Gift (BVPS - SP) × Shares', value: deemedGift },
        { label: "Donor's Tax = (Deemed Gift - ₱250,000) × 6%", value: donorsTax },
        ...(data.isTradeOrBusiness ? [{ label: 'Value Added Tax (VAT) 12%', value: vat }] : []),
      ]
    };
  }
}

// ========== ESTATE TAX ==========
export function computeEstateTax(data) {
  const { dateOfDeath, properties = [], isMarried = false, ordinaryDeductions = 0 } = data;
  const deathDate = new Date(dateOfDeath);
  const trainLawDate = new Date('2018-01-01');
  const isTRAINLaw = deathDate >= trainLawDate;
  
  // Calculate Gross Estate from properties
  let grossEstate = 0;
  let familyHomeValue = 0;
  const propertyBreakdown = [];
  
  properties.forEach(prop => {
    let propValue = 0;
    let propLabel = prop.description || prop.propertyType || 'Property';
    if (prop.propertyType === 'land' || prop.propertyType === 'condo' || prop.propertyType === 'building') {
      const areaZonal = (prop.area || 0) * (prop.zonalValue || 0);
      propValue = Math.max(prop.fairMarketValue || 0, areaZonal);
      if (prop.hasImprovement) propValue += (prop.improvementAmount || 0);
      const typeLabel = prop.propertyType.charAt(0).toUpperCase() + prop.propertyType.slice(1);
      propLabel = prop.description ? `${typeLabel} — ${prop.description}` : typeLabel;
    } else if (prop.propertyType === 'stocks') {
      if (prop.stockListing === 'listed') {
        propValue = (prop.marketPriceAtDeath || 0) * (prop.numberOfShares || 0);
      } else if (prop.stockListing === 'non-listed') {
        if (prop.shareType === 'common') {
          const bvps = prop.outstandingShares > 0 ? (prop.shareholdersEquity || 0) / prop.outstandingShares : 0;
          propValue = bvps * (prop.numberOfShares || 0);
        } else if (prop.shareType === 'preferred') {
          propValue = (prop.parValue || 0) * (prop.numberOfShares || 0);
        }
      } else {
        propValue = prop.stockValue || 0;
      }
      propLabel = prop.description ? `Stocks — ${prop.description}` : 'Stocks';
      if (prop.stockTicker) propLabel += ` (${prop.stockTicker})`;
    } else if (prop.propertyType === 'vehicles') {
      propValue = prop.vehicleValue || 0;
      propLabel = prop.brand ? `Vehicle — ${prop.brand}` : 'Vehicle';
      if (prop.plateNumber) propLabel += ` (${prop.plateNumber})`;
    } else {
      propValue = prop.value || 0;
    }
    
    propertyBreakdown.push({ label: propLabel, value: propValue, isProperty: true });
    grossEstate += propValue;
    if (prop.isFamilyHome) {
      familyHomeValue = propValue;
    }
  });

  let standardDeduction, familyHomeDeductionMax, taxRate;
  
  if (isTRAINLaw) {
    standardDeduction = 5000000;
    familyHomeDeductionMax = 10000000;
    taxRate = 0.06;
  } else {
    standardDeduction = 1000000;
    familyHomeDeductionMax = 1000000;
    taxRate = null; // Progressive
  }
  
  const familyHomeDeduction = Math.min(familyHomeValue, familyHomeDeductionMax);
  // Standard deduction auto-applies when there is a family home (always applies under TRAIN)
  const totalDeductions = standardDeduction + familyHomeDeduction + ordinaryDeductions;
  
  let netEstate = grossEstate - totalDeductions;
  if (isMarried) {
    netEstate = netEstate * 0.5; // Remove conjugal share
  }
  netEstate = Math.max(netEstate, 0);
  
  let estateTax;
  if (isTRAINLaw) {
    estateTax = netEstate * 0.06;
  } else {
    estateTax = computeProgressiveEstateTax(netEstate);
  }
  
  return {
    isTRAINLaw,
    grossEstate,
    standardDeduction,
    familyHomeDeduction,
    ordinaryDeductions,
    totalDeductions,
    conjugalShare: isMarried ? (grossEstate - totalDeductions) * 0.5 : 0,
    netTaxableEstate: netEstate,
    estateTax,
    totalTax: estateTax,
    breakdown: [
      ...propertyBreakdown,
      { label: 'Gross Estate (Total)', value: grossEstate, isTotal: true },
      { label: 'Less: Standard Deduction', value: standardDeduction },
      { label: 'Less: Family Home Deduction', value: familyHomeDeduction },
      { label: 'Less: Ordinary Deductions', value: ordinaryDeductions },
      ...(isMarried ? [{ label: 'Less: Conjugal Share (50%)', value: (grossEstate - totalDeductions) * 0.5 }] : []),
      { label: 'Net Taxable Estate', value: netEstate },
      { label: isTRAINLaw ? 'Estate Tax 6% (TRAIN Law)' : 'Estate Tax (Progressive Rate)', value: estateTax },
    ]
  };
}

function computeProgressiveEstateTax(netEstate) {
  // Pre-TRAIN Law progressive rates
  const brackets = [
    { min: 0, max: 200000, rate: 0, fixed: 0 },
    { min: 200000, max: 500000, rate: 0.05, fixed: 0 },
    { min: 500000, max: 2000000, rate: 0.08, fixed: 15000 },
    { min: 2000000, max: 5000000, rate: 0.11, fixed: 135000 },
    { min: 5000000, max: 10000000, rate: 0.15, fixed: 465000 },
    { min: 10000000, max: Infinity, rate: 0.20, fixed: 1215000 },
  ];
  
  for (const bracket of brackets) {
    if (netEstate <= bracket.max) {
      return bracket.fixed + (netEstate - bracket.min) * bracket.rate;
    }
  }
  return 0;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function hectaresToSqm(hectares) {
  return hectares * 10000;
}