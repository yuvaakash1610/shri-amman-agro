const sampleApiResponse = [
  {
    price_id: 3,
    product_id: 1,
    purchase_price: '200.00',
    selling_price: '500.00',
    effective_from: '2026-08-26T07:31:47.300Z',
    effective_to: null,
    is_active: true
  }
];

let activePriceRecord = null;
if (Array.isArray(sampleApiResponse) && sampleApiResponse.length > 0) {
  activePriceRecord = sampleApiResponse.find(p => p.is_active === true || p.is_active === 'true') || sampleApiResponse[0];
} else if (sampleApiResponse && typeof sampleApiResponse === 'object') {
  activePriceRecord = sampleApiResponse;
}

if (activePriceRecord && activePriceRecord.selling_price !== undefined) {
  console.log('Extracted default selling price:', parseFloat(activePriceRecord.selling_price));
} else {
  console.log('Failed to extract price');
}
