// ========================================
// Razorpay KAM Dashboard - Mock Data
// ========================================

// ── Gateways ────────────────────────────
export const gateways = [
  {
    id: 'gw-hdfc',
    name: 'HDFC Bank',
    shortName: 'HDFC',
    terminals: [
      { id: 'term-hdfc-001', terminalId: 'HDFC_T1', successRate: 96.2, costPerTxn: 1.80, isZeroCost: false },
      { id: 'term-hdfc-002', terminalId: 'HDFC_T2', successRate: 94.8, costPerTxn: 0, isZeroCost: true },
    ],
  },
  {
    id: 'gw-icici',
    name: 'ICICI Bank',
    shortName: 'ICICI',
    terminals: [
      { id: 'term-icici-001', terminalId: 'ICICI_T1', successRate: 95.1, costPerTxn: 1.70, isZeroCost: false },
      { id: 'term-icici-002', terminalId: 'ICICI_T2', successRate: 93.4, costPerTxn: 1.45, isZeroCost: false },
    ],
  },
  {
    id: 'gw-axis',
    name: 'Axis Bank',
    shortName: 'Axis',
    terminals: [
      { id: 'term-axis-001', terminalId: 'AXIS_T1', successRate: 93.8, costPerTxn: 1.50, isZeroCost: false },
      { id: 'term-axis-002', terminalId: 'AXIS_T2', successRate: 91.5, costPerTxn: 0, isZeroCost: true },
    ],
  },
  {
    id: 'gw-rbl',
    name: 'RBL Bank',
    shortName: 'RBL',
    terminals: [
      { id: 'term-rbl-001', terminalId: 'RBL_T1', successRate: 90.3, costPerTxn: 1.10, isZeroCost: false },
      { id: 'term-rbl-002', terminalId: 'RBL_T2', successRate: 88.9, costPerTxn: 0.95, isZeroCost: false },
    ],
  },
  {
    id: 'gw-yes',
    name: 'Yes Bank',
    shortName: 'Yes',
    terminals: [
      { id: 'term-yes-001', terminalId: 'YES_T1', successRate: 89.7, costPerTxn: 0, isZeroCost: true },
      { id: 'term-yes-002', terminalId: 'YES_T2', successRate: 88.2, costPerTxn: 0.85, isZeroCost: false },
    ],
  },
]

// ── Merchants (15 enterprise accounts) ──
export const merchants = [
  {
    id: 'merch-001',
    name: 'Zomato',
    mid: 'MID_ZOM_001',
    category: 'Food & Delivery',
    mcc: '5812',
    mccLabel: 'Restaurants',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 1250000,
    monthlyGMV: 437500000,
    avgPaymentSuccessRate: 95.8,
    forwardPricing: 2.0,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 45, supportedMethods: ['CC', 'DC', 'UPI', 'NB'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 20, supportedMethods: ['CC', 'DC'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 25, supportedMethods: ['CC', 'DC', 'NB'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 10, supportedMethods: ['UPI', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 1250000, lastYearSameMonth: 1180000 },
    contactName: 'Deepinder Goyal',
    contactEmail: 'payments@zomato.com',
  },
  {
    id: 'merch-002',
    name: 'Swiggy',
    mid: 'MID_SWG_002',
    category: 'Food & Delivery',
    mcc: '5812',
    mccLabel: 'Restaurants',
    dealType: 'tsp',
    dealDetails: {
      description: 'HDFC has given special CC rates for Swiggy based on combined CC+UPI acquiring volume.',
      constraint: 'Annual GMV commitment of ₹300Cr via HDFC terminals',
      expiresAt: 'Sep 2026',
      contact: 'pranavn.rattan@razorpay.com',
      lockedGatewayId: 'gw-hdfc',
      tspCompliance: { gmvCommitment: 3000000000, commitmentPeriod: 'annual' },
    },
    monthlyTxnVolume: 1100000,
    monthlyGMV: 385000000,
    avgPaymentSuccessRate: 94.5,
    forwardPricing: 1.9,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 70, supportedMethods: ['CC', 'DC', 'UPI', 'NB'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-002', successRate: 93.4, costPerTxn: 1.45, txnShare: 30, supportedMethods: ['CC', 'DC', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: true },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 1100000, lastYearSameMonth: 1050000 },
    contactName: 'Sriharsha Majety',
    contactEmail: 'finance@swiggy.in',
  },
  {
    id: 'merch-003',
    name: 'CRED',
    mid: 'MID_CRD_003',
    category: 'Fintech',
    mcc: '6012',
    mccLabel: 'Financial Institutions',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 850000,
    monthlyGMV: 620000000,
    avgPaymentSuccessRate: 97.1,
    forwardPricing: 1.8,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 60, supportedMethods: ['CC', 'DC', 'UPI'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 20, supportedMethods: ['CC', 'DC'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 20, supportedMethods: ['UPI', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 90,
    txnVolumeHistory: { currentMonth: 650000, lastYearSameMonth: 820000 },
    contactName: 'Kunal Shah',
    contactEmail: 'payments@cred.club',
  },
  {
    id: 'merch-004',
    name: 'Flipkart',
    mid: 'MID_FLK_004',
    category: 'E-commerce',
    mcc: '5311',
    mccLabel: 'Department Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 2200000,
    monthlyGMV: 1320000000,
    avgPaymentSuccessRate: 94.2,
    forwardPricing: 1.6,
    currentGatewayId: 'gw-icici',
    currentTerminalId: 'term-icici-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 50, supportedMethods: ['CC', 'DC', 'NB'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 30, supportedMethods: ['CC', 'DC', 'UPI'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 20, supportedMethods: ['UPI', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 87,
    txnVolumeHistory: { currentMonth: 980000, lastYearSameMonth: 950000 },
    contactName: 'Kalyan Krishnamurthy',
    contactEmail: 'payments@flipkart.com',
  },
  {
    id: 'merch-005',
    name: 'BigBasket',
    mid: 'MID_BBK_005',
    category: 'Grocery',
    mcc: '5411',
    mccLabel: 'Grocery Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 680000,
    monthlyGMV: 238000000,
    avgPaymentSuccessRate: 93.1,
    forwardPricing: 2.1,
    currentGatewayId: 'gw-icici',
    currentTerminalId: 'term-icici-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 60, supportedMethods: ['CC', 'DC', 'NB'] },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 40, supportedMethods: ['CC', 'DC', 'UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 87,
    txnVolumeHistory: { currentMonth: 720000, lastYearSameMonth: 880000 },
    contactName: 'Hari Menon',
    contactEmail: 'finance@bigbasket.com',
  },
  {
    id: 'merch-006',
    name: 'Myntra',
    mid: 'MID_MYN_006',
    category: 'Fashion',
    mcc: '5651',
    mccLabel: 'Clothing Stores',
    dealType: 'tsp',
    dealDetails: {
      description: 'HDFC has given special CC+DC rates for Myntra based on acquiring volume commitment via Midsign.',
      constraint: 'Annual GMV commitment of ₹250Cr via HDFC Midsign',
      expiresAt: 'Jun 2026',
      contact: 'pranavn.rattan@razorpay.com',
      lockedGatewayId: 'gw-hdfc',
      tspCompliance: { gmvCommitment: 2500000000, commitmentPeriod: 'annual' },
    },
    monthlyTxnVolume: 920000,
    monthlyGMV: 350000000,
    avgPaymentSuccessRate: 92.8,
    forwardPricing: 2.2,
    currentGatewayId: 'gw-axis',
    currentTerminalId: 'term-axis-001',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 55, supportedMethods: ['CC', 'DC', 'UPI', 'NB'] },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 45, supportedMethods: ['CC', 'DC'] },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 2, hasFallback: false, hasCardRestrictions: false, hasNetworkRestrictions: true },
    srSensitive: false,
    srThresholdLow: 86,
    txnVolumeHistory: { currentMonth: 920000, lastYearSameMonth: 890000 },
    contactName: 'Nandita Sinha',
    contactEmail: 'payments@myntra.com',
  },
  {
    id: 'merch-007',
    name: 'BookMyShow',
    mid: 'MID_BMS_007',
    category: 'Entertainment',
    mcc: '7922',
    mccLabel: 'Entertainment',
    dealType: 'offer_linked',
    dealDetails: {
      description: 'HDFC 10% cashback offer on CC for BookMyShow movie tickets. Requires routing via HDFC terminal.',
      constraint: 'Offer traffic must route via HDFC_T1',
      expiresAt: 'Apr 2026',
      contact: 'simran.ranka@razorpay.com',
      lockedGatewayId: 'gw-hdfc',
    },
    monthlyTxnVolume: 450000,
    monthlyGMV: 180000000,
    avgPaymentSuccessRate: 96.3,
    forwardPricing: 2.5,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 75, supportedMethods: ['CC', 'DC', 'UPI', 'NB'] },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 25, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 450000, lastYearSameMonth: 470000 },
    contactName: 'Ashish Hemrajani',
    contactEmail: 'finance@bookmyshow.com',
  },
  {
    id: 'merch-008',
    name: 'MakeMyTrip',
    mid: 'MID_MMT_008',
    category: 'Travel',
    mcc: '4722',
    mccLabel: 'Travel Agencies',
    dealType: 'offer_linked',
    dealDetails: {
      description: 'Axis Bank EMI offer for travel bookings above 10K. Transaction must route via Axis terminal.',
      constraint: 'EMI bookings must route via AXIS_T1',
      expiresAt: 'May 2026',
      contact: 'simran.ranka@razorpay.com',
      lockedGatewayId: 'gw-axis',
    },
    monthlyTxnVolume: 380000,
    monthlyGMV: 850000000,
    avgPaymentSuccessRate: 95.5,
    forwardPricing: 1.5,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-002',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 60, supportedMethods: ['CC', 'DC', 'UPI'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 40, supportedMethods: ['CC', 'DC', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: true },
    srSensitive: false,
    srThresholdLow: 88,
    txnVolumeHistory: { currentMonth: 380000, lastYearSameMonth: 520000 },
    contactName: 'Rajesh Magow',
    contactEmail: 'payments@makemytrip.com',
  },
  {
    id: 'merch-009',
    name: 'Nykaa',
    mid: 'MID_NYK_009',
    category: 'Beauty',
    mcc: '5977',
    mccLabel: 'Cosmetic Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 520000,
    monthlyGMV: 150000000,
    avgPaymentSuccessRate: 91.7,
    forwardPricing: 2.3,
    currentGatewayId: 'gw-icici',
    currentTerminalId: 'term-icici-002',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-icici', terminalId: 'term-icici-002', successRate: 93.4, costPerTxn: 1.45, txnShare: 50, supportedMethods: ['CC', 'DC', 'NB'] },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 50, supportedMethods: ['CC', 'DC', 'UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 2, hasFallback: false, hasCardRestrictions: true, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 85,
    txnVolumeHistory: { currentMonth: 510000, lastYearSameMonth: 490000 },
    contactName: 'Falguni Nayar',
    contactEmail: 'finance@nykaa.com',
  },
  {
    id: 'merch-010',
    name: 'Urban Company',
    mid: 'MID_URC_010',
    category: 'Services',
    mcc: '7299',
    mccLabel: 'Miscellaneous Services',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 310000,
    monthlyGMV: 85000000,
    avgPaymentSuccessRate: 90.4,
    forwardPricing: 2.4,
    currentGatewayId: 'gw-axis',
    currentTerminalId: 'term-axis-002',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-axis', terminalId: 'term-axis-002', successRate: 91.5, costPerTxn: 0, txnShare: 60, supportedMethods: ['CC', 'DC', 'UPI', 'NB'] },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 40, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 0, rejectRules: 1, hasFallback: false, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 84,
    txnVolumeHistory: { currentMonth: 290000, lastYearSameMonth: 410000 },
    contactName: 'Abhiraj Bhal',
    contactEmail: 'payments@urbancompany.com',
  },
  {
    id: 'merch-011',
    name: 'Zepto',
    mid: 'MID_ZPT_011',
    category: 'Quick Commerce',
    mcc: '5411',
    mccLabel: 'Grocery Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 780000,
    monthlyGMV: 195000000,
    avgPaymentSuccessRate: 93.9,
    forwardPricing: 2.0,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 40, supportedMethods: ['CC', 'DC', 'UPI', 'NB'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 15, supportedMethods: ['CC', 'DC'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 30, supportedMethods: ['CC', 'DC', 'NB'] },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 15, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 1400000, lastYearSameMonth: 900000 },
    contactName: 'Aadit Palicha',
    contactEmail: 'finance@zeptonow.com',
  },
  {
    id: 'merch-012',
    name: 'Ola',
    mid: 'MID_OLA_012',
    category: 'Mobility',
    mcc: '4121',
    mccLabel: 'Taxicabs & Rideshare',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 1500000,
    monthlyGMV: 280000000,
    avgPaymentSuccessRate: 92.1,
    forwardPricing: 1.7,
    currentGatewayId: 'gw-icici',
    currentTerminalId: 'term-icici-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 45, supportedMethods: ['CC', 'DC', 'NB'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 35, supportedMethods: ['CC', 'DC', 'UPI'] },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 20, supportedMethods: ['UPI', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 87,
    txnVolumeHistory: { currentMonth: 600000, lastYearSameMonth: 580000 },
    contactName: 'Bhavish Aggarwal',
    contactEmail: 'payments@olacabs.com',
  },
  {
    id: 'merch-013',
    name: 'PhonePe',
    mid: 'MID_PPE_013',
    category: 'Fintech',
    mcc: '6012',
    mccLabel: 'Financial Institutions',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 3200000,
    monthlyGMV: 960000000,
    avgPaymentSuccessRate: 96.8,
    forwardPricing: 1.4,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 35, supportedMethods: ['CC', 'DC', 'UPI', 'NB'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 15, supportedMethods: ['CC', 'DC'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 35, supportedMethods: ['CC', 'DC', 'NB'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-002', successRate: 91.5, costPerTxn: 0, txnShare: 15, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 2200000, lastYearSameMonth: 2100000 },
    contactName: 'Sameer Nigam',
    contactEmail: 'finance@phonepe.com',
  },
  {
    id: 'merch-014',
    name: 'Paytm Mall',
    mid: 'MID_PTM_014',
    category: 'E-commerce',
    mcc: '5311',
    mccLabel: 'Department Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 420000,
    monthlyGMV: 120000000,
    avgPaymentSuccessRate: 89.6,
    forwardPricing: 2.1,
    currentGatewayId: 'gw-rbl',
    currentTerminalId: 'term-rbl-001',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 70, supportedMethods: ['CC', 'DC', 'NB'] },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 30, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 2, hasFallback: false, hasCardRestrictions: true, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 83,
    txnVolumeHistory: { currentMonth: 180000, lastYearSameMonth: 310000 },
    contactName: 'Vijay Shekhar',
    contactEmail: 'payments@paytmmall.com',
  },
  {
    id: 'merch-015',
    name: '1mg',
    mid: 'MID_1MG_015',
    category: 'Healthcare',
    mcc: '5912',
    mccLabel: 'Drug Stores & Pharmacies',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 290000,
    monthlyGMV: 75000000,
    avgPaymentSuccessRate: 91.2,
    forwardPricing: 2.2,
    currentGatewayId: 'gw-yes',
    currentTerminalId: 'term-yes-001',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 60, supportedMethods: ['UPI', 'NB'] },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-002', successRate: 88.9, costPerTxn: 0.95, txnShare: 40, supportedMethods: ['CC', 'DC'] },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 1, hasFallback: false, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 85,
    txnVolumeHistory: { currentMonth: 220000, lastYearSameMonth: 260000 },
    contactName: 'Prashant Tandon',
    contactEmail: 'finance@1mg.com',
  },
]

// ── KAM Profile ─────────────────────────
export const kamProfile = {
  id: 'kam-001',
  name: 'Anugrah Sharma',
  email: 'anugrah.sharma@razorpay.com',
  role: 'Key Account Manager',
  team: 'Enterprise Payments',
  avatarInitials: 'AS',
}

// ── Routing Strategies ──────────────────
export const routingStrategies = [
  {
    id: 'success_rate',
    label: 'Success Rate Based',
    description: 'Routes to gateway with highest success rate. Higher cost, better conversion.',
  },
  {
    id: 'cost_based',
    label: 'Cost Based',
    description: 'Routes to cheapest gateway. Lower cost, may have slightly lower success rate.',
  },
]

// ── Helpers ─────────────────────────────

export function computeMerchantRevenue(merchant) {
  const forwardRevenue = merchant.monthlyGMV * (merchant.forwardPricing / 100)
  const gateway = gateways.find((g) => g.id === merchant.currentGatewayId)
  const terminal = gateway?.terminals.find((t) => t.id === merchant.currentTerminalId)
  const backwardCost = merchant.monthlyTxnVolume * (terminal?.costPerTxn || 0)

  return {
    forwardRevenue,
    backwardCost,
    netRevenue: forwardRevenue - backwardCost,
    costPerTxn: terminal?.costPerTxn || 0,
  }
}

export function computeAggregateStats(merchantList) {
  const totalTxnVolume = merchantList.reduce((s, m) => s + m.monthlyTxnVolume, 0)
  const avgSuccessRate =
    merchantList.reduce((s, m) => s + m.avgPaymentSuccessRate, 0) / merchantList.length
  const merchantsOnCostRouting = merchantList.filter(
    (m) => m.routingStrategy === 'cost_based'
  ).length
  const merchantsOnSuccessRouting = merchantList.filter(
    (m) => m.routingStrategy === 'success_rate'
  ).length

  let totalNetRevenue = 0
  let totalBackwardCost = 0
  let totalForwardRevenue = 0
  merchantList.forEach((m) => {
    const rev = computeMerchantRevenue(m)
    totalNetRevenue += rev.netRevenue
    totalBackwardCost += rev.backwardCost
    totalForwardRevenue += rev.forwardRevenue
  })

  const avgCostPerTxn = totalBackwardCost / totalTxnVolume

  return {
    totalTxnVolume,
    avgSuccessRate: Number(avgSuccessRate.toFixed(1)),
    merchantsOnCostRouting,
    merchantsOnSuccessRouting,
    totalMerchants: merchantList.length,
    totalNetRevenue,
    totalBackwardCost,
    totalForwardRevenue,
    avgCostPerTxn: Number(avgCostPerTxn.toFixed(2)),
  }
}

export function computeZeroCostShare(merchantList) {
  let totalTxn = 0
  let zeroCostTxn = 0
  merchantList.forEach((m) => {
    const vol = m.monthlyTxnVolume
    m.gatewayMetrics.forEach((gm) => {
      const share = vol * (gm.txnShare / 100)
      totalTxn += share
      // Find if this terminal is zero-cost
      const gw = gateways.find((g) => g.id === gm.gatewayId)
      const term = gw?.terminals.find((t) => t.id === gm.terminalId)
      if (term?.isZeroCost) {
        zeroCostTxn += share
      }
    })
  })
  return totalTxn > 0 ? Number(((zeroCostTxn / totalTxn) * 100).toFixed(1)) : 0
}

export function isTerminalZeroCost(terminalId) {
  for (const gw of gateways) {
    const term = gw.terminals.find((t) => t.id === terminalId)
    if (term) return term.isZeroCost || false
  }
  return false
}

export function formatINR(amount) {
  if (Math.abs(amount) >= 10000000) {
    return '\u20B9' + (amount / 10000000).toFixed(1) + ' Cr'
  }
  if (Math.abs(amount) >= 100000) {
    return '\u20B9' + (amount / 100000).toFixed(1) + ' L'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function getMonthlyTargetData(merchantList) {
  const stats = computeAggregateStats(merchantList)
  const target = 120000000
  const achieved = stats.totalNetRevenue
  const daysElapsed = 10
  const daysInMonth = 31

  return {
    month: 'March 2026',
    target,
    achieved,
    percentage: Number(((achieved / target) * 100).toFixed(1)),
    daysElapsed,
    daysInMonth,
    projectedRevenue: achieved * (daysInMonth / daysElapsed),
  }
}

// ── Backward Pricing Schedule (granular per terminal) ──
export const backwardPricingSchedule = {
  'term-hdfc-001': [
    { network: 'Visa', cardType: 'Credit', amountRange: '0-2K', costPerTxn: 1.60, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: '2K-10K', costPerTxn: 1.80, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: '10K+', costPerTxn: 2.10, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: '0-2K', costPerTxn: 0.90, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: '2K+', costPerTxn: 1.20, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: '0-2K', costPerTxn: 1.55, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: '2K+', costPerTxn: 1.75, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.50, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 3.20, isInternational: true },
  ],
  'term-hdfc-002': [
    { network: 'All', cardType: 'UPI', amountRange: 'All', costPerTxn: 0, isInternational: false },
  ],
  'term-icici-001': [
    { network: 'Visa', cardType: 'Credit', amountRange: '0-2K', costPerTxn: 1.50, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: '2K+', costPerTxn: 1.70, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.65, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.85, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.45, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 3.00, isInternational: true },
  ],
  'term-icici-002': [
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.45, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.40, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.80, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.40, isInternational: false },
  ],
  'term-axis-001': [
    { network: 'Visa', cardType: 'Credit', amountRange: '0-5K', costPerTxn: 1.35, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: '5K+', costPerTxn: 1.50, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.45, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.75, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.35, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 2.80, isInternational: true },
  ],
  'term-axis-002': [
    { network: 'All', cardType: 'UPI', amountRange: 'All', costPerTxn: 0, isInternational: false },
  ],
  'term-rbl-001': [
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.10, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.05, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.60, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.30, isInternational: false },
  ],
  'term-rbl-002': [
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 0.95, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 0.90, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.55, isInternational: false },
  ],
  'term-yes-001': [
    { network: 'All', cardType: 'UPI', amountRange: 'All', costPerTxn: 0, isInternational: false },
  ],
  'term-yes-002': [
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 0.85, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 0.80, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.50, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.25, isInternational: false },
  ],
}

export function getBackwardPricingBreakdown(terminalId) {
  return backwardPricingSchedule[terminalId] || []
}

// ── TSP Compliance ────────────────────────
export function computeTSPCompliance(merchant) {
  if (merchant.dealType !== 'tsp' || !merchant.dealDetails) return null
  const gmvCommitment = merchant.dealDetails.tspCompliance?.gmvCommitment
  if (gmvCommitment == null) return null

  const lockedGwId = merchant.dealDetails.lockedGatewayId

  // Actual traffic % going through the locked gateway
  const actualTrafficPct = merchant.gatewayMetrics
    .filter((gm) => gm.gatewayId === lockedGwId)
    .reduce((sum, gm) => sum + gm.txnShare, 0)

  // Projected annual GMV via locked gateway
  const projectedAnnualGMV = merchant.monthlyGMV * (actualTrafficPct / 100) * 12

  // Gap: positive = ahead of commitment, negative = behind
  const gmvGap = projectedAnnualGMV - gmvCommitment

  // Suggested traffic % to meet commitment
  const suggestedTrafficPct = Number(
    ((gmvCommitment / 12 / merchant.monthlyGMV) * 100).toFixed(1)
  )

  // Status: advisory, not punitive
  let status
  if (projectedAnnualGMV >= gmvCommitment) {
    status = 'on_track'
  } else if (projectedAnnualGMV >= gmvCommitment * 0.8) {
    status = 'at_risk'
  } else {
    status = 'off_track'
  }

  return {
    gmvCommitment,
    projectedAnnualGMV,
    gmvGap,
    suggestedTrafficPct,
    actualTrafficPct,
    status,
    lockedGatewayName: gateways.find((g) => g.id === lockedGwId)?.shortName || 'Unknown',
  }
}

// ── CBR Terminal Ordering ──────────────────
export function computeCBROrder(merchant) {
  const thresholdLow = merchant.srThresholdLow ?? 85

  // Enrich terminal entries with gateway info
  const entries = merchant.gatewayMetrics.map((gm) => {
    const gw = gateways.find((g) => g.id === gm.gatewayId)
    const term = gw?.terminals.find((t) => t.id === gm.terminalId)
    return {
      terminalId: term?.terminalId || gm.terminalId,
      gatewayId: gm.gatewayId,
      gatewayName: gw?.name || 'Unknown',
      gatewayShort: gw?.shortName || '??',
      successRate: gm.successRate,
      costPerTxn: gm.costPerTxn,
      isZeroCost: gm.costPerTxn === 0,
      txnShare: gm.txnShare,
      hasGMVPriority: false,
    }
  })

  // Mark terminals on TSP locked gateway
  const lockedGwId =
    merchant.dealType === 'tsp' && merchant.dealDetails?.lockedGatewayId
      ? merchant.dealDetails.lockedGatewayId
      : null
  if (lockedGwId) {
    entries.forEach((e) => {
      if (e.gatewayId === lockedGwId) e.hasGMVPriority = true
    })
  }

  const maxSR = Math.max(...entries.map((e) => e.successRate))

  // Split into eligible and fallback
  const eligible = entries.filter((e) => e.successRate >= thresholdLow)
  const fallback = entries.filter((e) => e.successRate < thresholdLow)

  // Sort eligible: GMV priority first, then cost ascending, then SR descending
  eligible.sort((a, b) => {
    if (a.hasGMVPriority !== b.hasGMVPriority) return a.hasGMVPriority ? -1 : 1
    if (a.costPerTxn !== b.costPerTxn) return a.costPerTxn - b.costPerTxn
    return b.successRate - a.successRate
  })

  // Sort fallback by SR descending
  fallback.sort((a, b) => b.successRate - a.successRate)

  // Assign continuous ranks
  eligible.forEach((e, i) => { e.rank = i + 1 })
  fallback.forEach((e, i) => { e.rank = eligible.length + i + 1 })

  return { maxSR, thresholdLow, eligible, fallback }
}

// ── Sankey Data Generator ─────────────────
const SANKEY_COLORS = {
  CC: '#E65100',
  DC: '#1565C0',
  UPI: '#2E7D32',
  NB: '#7B1FA2',
  terminal: '#528FF0',
}

const SANKEY_SUBTYPES = {
  CC: [
    { id: 'visa-cc', name: 'Visa CC', weight: 55 },
    { id: 'mc-cc', name: 'Mastercard CC', weight: 35 },
    { id: 'rupay-cc', name: 'RuPay CC', weight: 10 },
  ],
  DC: [
    { id: 'visa-dc', name: 'Visa DC', weight: 25 },
    { id: 'rupay-dc', name: 'RuPay DC', weight: 65 },
    { id: 'mc-dc', name: 'Mastercard DC', weight: 10 },
  ],
  UPI: [
    { id: 'upi-collect', name: 'UPI Collect', weight: 40 },
    { id: 'upi-intent', name: 'UPI Intent', weight: 60 },
  ],
  NB: [
    { id: 'nb-sbi', name: 'SBI NB', weight: 35 },
    { id: 'nb-hdfc', name: 'HDFC NB', weight: 30 },
    { id: 'nb-other', name: 'Others NB', weight: 35 },
  ],
}

export function generateSankeyData(merchant) {
  const totalTxn = merchant.monthlyTxnVolume

  // Determine which payment method categories are supported
  const methodSet = new Set()
  merchant.gatewayMetrics.forEach((gm) => {
    if (gm.supportedMethods) gm.supportedMethods.forEach((m) => methodSet.add(m))
  })
  const activeMethods = ['CC', 'DC', 'UPI', 'NB'].filter((m) => methodSet.has(m))

  // Seed-based payment method split (varies per merchant)
  const seed0 = hashCode(merchant.id + '-sankey')
  const rawWeights = activeMethods.map((m, i) => {
    const base = m === 'CC' ? 30 : m === 'DC' ? 20 : m === 'UPI' ? 35 : 15
    const jitter = (seededRandom(seed0 + i * 7) - 0.5) * 20
    return Math.max(5, base + jitter)
  })
  const wTotal = rawWeights.reduce((s, w) => s + w, 0)

  // Build column-0 nodes (Payment Methods)
  const nodes = []
  const links = []
  const methodVolumes = {}

  activeMethods.forEach((m, i) => {
    const vol = Math.round(totalTxn * (rawWeights[i] / wTotal))
    methodVolumes[m] = vol
    nodes.push({ id: m, name: m === 'CC' ? 'Credit Cards' : m === 'DC' ? 'Debit Cards' : m === 'UPI' ? 'UPI' : 'Net Banking', column: 0, value: vol, color: SANKEY_COLORS[m] })
  })

  // Build column-1 nodes (Sub-types) + links from col-0 → col-1
  const subtypeVolumes = {}

  activeMethods.forEach((m) => {
    const subs = SANKEY_SUBTYPES[m] || []
    const mVol = methodVolumes[m]
    // Apply seeded jitter to sub-type weights
    const subSeed = hashCode(merchant.id + '-sub-' + m)
    const jittered = subs.map((s, i) => {
      const j = (seededRandom(subSeed + i * 3) - 0.5) * 15
      return { ...s, w: Math.max(3, s.weight + j) }
    })
    const subTotal = jittered.reduce((s, x) => s + x.w, 0)

    jittered.forEach((sub) => {
      const vol = Math.round(mVol * (sub.w / subTotal))
      if (vol <= 0) return
      subtypeVolumes[sub.id] = vol
      nodes.push({ id: sub.id, name: sub.name, column: 1, value: vol, color: SANKEY_COLORS[m] })
      links.push({ source: m, target: sub.id, value: vol })
    })
  })

  // Build column-2 nodes (Terminals) + links from col-1 → col-2
  // Build terminal info
  const termEntries = merchant.gatewayMetrics.map((gm) => {
    const gw = gateways.find((g) => g.id === gm.gatewayId)
    const term = gw?.terminals.find((t) => t.id === gm.terminalId)
    return {
      id: gm.terminalId,
      displayId: term?.terminalId || gm.terminalId,
      gatewayShort: gw?.shortName || '??',
      txnShare: gm.txnShare,
      supportedMethods: gm.supportedMethods || [],
    }
  })

  // Distribute each subtype's volume across terminals that support its parent method
  const terminalTotals = {}
  const subtypeIds = Object.keys(subtypeVolumes)

  subtypeIds.forEach((subId) => {
    // Determine parent method
    const parentMethod = Object.keys(SANKEY_SUBTYPES).find((m) =>
      SANKEY_SUBTYPES[m].some((s) => s.id === subId)
    )
    if (!parentMethod) return

    // Filter terminals that support this method
    const eligible = termEntries.filter((t) => t.supportedMethods.includes(parentMethod))
    if (eligible.length === 0) return

    const subVol = subtypeVolumes[subId]
    const shareTotal = eligible.reduce((s, t) => s + t.txnShare, 0)

    eligible.forEach((t) => {
      const vol = Math.round(subVol * (t.txnShare / shareTotal))
      if (vol <= 0) return
      terminalTotals[t.id] = (terminalTotals[t.id] || 0) + vol
      links.push({ source: subId, target: t.id, value: vol })
    })
  })

  // Add terminal nodes
  termEntries.forEach((t) => {
    if (terminalTotals[t.id]) {
      nodes.push({
        id: t.id,
        name: t.displayId,
        column: 2,
        value: terminalTotals[t.id],
        color: SANKEY_COLORS.terminal,
        gatewayShort: t.gatewayShort,
      })
    }
  })

  return { nodes, links, totalTxn }
}

// ── NTF Risk ──────────────────────────────
export function computeNTFRisk(merchant) {
  const rules = merchant.routingRules
  if (!rules) return { score: 0, level: 'low', factors: [] }

  let score = 0
  const factors = []

  // Cost-driven reject without fallback (40-50% of NTF)
  if (merchant.routingStrategy === 'cost_based' && rules.rejectRules > 0 && !rules.hasFallback) {
    score += 40
    factors.push('Cost-driven reject rules without fallback')
  }

  // Missing select rules (20-25%)
  if (rules.selectRules === 0) {
    score += 25
    factors.push('No SELECT rules configured')
  } else if (rules.selectRules < 2) {
    score += 10
    factors.push('Insufficient SELECT rule coverage')
  }

  // Network/card restrictions (15-20%)
  if (rules.hasNetworkRestrictions) {
    score += 15
    factors.push('Network restrictions active')
  }
  if (rules.hasCardRestrictions) {
    score += 15
    factors.push('Card type restrictions active')
  }

  // Few gateway options
  if (merchant.gatewayMetrics.length <= 2) {
    score += 10
    factors.push('Limited gateway diversity (\u22642 gateways)')
  }

  const level = score >= 50 ? 'critical' : score >= 30 ? 'high' : score >= 15 ? 'medium' : 'low'

  return { score: Math.min(score, 100), level, factors }
}

// ── Routing Conflict Detection ────────────
export function detectRoutingConflicts(merchant) {
  const conflicts = []

  // TSP deal but primary gateway doesn't match locked gateway
  if (merchant.dealType === 'tsp' && merchant.dealDetails?.lockedGatewayId) {
    if (merchant.currentGatewayId !== merchant.dealDetails.lockedGatewayId) {
      const lockedGw = gateways.find((g) => g.id === merchant.dealDetails.lockedGatewayId)
      conflicts.push({
        type: 'tsp_gateway_mismatch',
        severity: 'critical',
        message: `Primary gateway is not ${lockedGw?.shortName || 'locked gateway'}. TSP deal requires routing via ${lockedGw?.shortName}.`,
        recommendation: `Switch primary gateway to ${lockedGw?.shortName} to comply with TSP deal terms.`,
      })
    }
  }

  // Offer-linked deal but offer gateway not in active traffic
  if (merchant.dealType === 'offer_linked' && merchant.dealDetails?.lockedGatewayId) {
    const lockedGwId = merchant.dealDetails.lockedGatewayId
    const hasLockedGwInMetrics = merchant.gatewayMetrics.some((gm) => gm.gatewayId === lockedGwId)
    if (!hasLockedGwInMetrics) {
      const lockedGw = gateways.find((g) => g.id === lockedGwId)
      conflicts.push({
        type: 'offer_gateway_missing',
        severity: 'high',
        message: `Offer requires routing via ${lockedGw?.shortName}, but no traffic is routed there.`,
        recommendation: `Add ${lockedGw?.shortName} terminal to active routing to enable offer fulfillment.`,
      })
    }
  }

  // Cost-based routing on merchant with SR < 92%
  if (merchant.routingStrategy === 'cost_based' && merchant.avgPaymentSuccessRate < 92) {
    conflicts.push({
      type: 'cost_routing_low_sr',
      severity: 'medium',
      message: `Cost-based routing active but success rate is ${merchant.avgPaymentSuccessRate}% (below 92% threshold).`,
      recommendation: 'Consider switching to SR-based routing to improve payment reliability.',
    })
  }

  // All gateways have sub-93% SR
  const allSubOptimal = merchant.gatewayMetrics.every((gm) => gm.successRate < 93)
  if (allSubOptimal && merchant.gatewayMetrics.length >= 2) {
    conflicts.push({
      type: 'no_optimal_gateway',
      severity: 'medium',
      message: 'All active gateways have sub-optimal success rates (<93%).',
      recommendation: 'Request terminal procurement for a higher-SR gateway from TR team.',
    })
  }

  return conflicts
}

// ── Retention Risk ──────────────────────
export function computeRetentionRisk(merchants) {
  return merchants
    .map((m) => {
      const curr = m.txnVolumeHistory?.currentMonth || 0
      const prev = m.txnVolumeHistory?.lastYearSameMonth || 0
      if (prev === 0) return null
      const yoyChange = Number((((curr - prev) / prev) * 100).toFixed(1))
      if (yoyChange >= 0) return null
      const absChange = Math.abs(yoyChange)
      const riskLevel = absChange > 25 ? 'critical' : absChange > 15 ? 'high' : absChange > 5 ? 'medium' : null
      if (!riskLevel) return null
      return {
        merchantId: m.id,
        merchantName: m.name,
        mid: m.mid,
        currentVolume: curr,
        lastYearVolume: prev,
        yoyChange,
        riskLevel,
        srSensitive: m.srSensitive,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.yoyChange - b.yoyChange)
}

// ── NR Opportunity ──────────────────────
export function computeNROpportunity(merchants) {
  return merchants
    .filter((m) => !m.srSensitive && m.routingStrategy === 'success_rate')
    .map((m) => {
      const currentRevenue = computeMerchantRevenue(m)
      // Simulate: if switched to cost routing, find cheapest terminal
      const cheapestTerminal = m.gatewayMetrics
        .slice()
        .sort((a, b) => a.costPerTxn - b.costPerTxn)[0]
      if (!cheapestTerminal) return null
      const currentGw = gateways.find((g) => g.id === m.currentGatewayId)
      const currentTerm = currentGw?.terminals.find((t) => t.id === m.currentTerminalId)
      const currentCost = currentTerm?.costPerTxn || 0
      const saving = (currentCost - cheapestTerminal.costPerTxn) * m.monthlyTxnVolume
      if (saving <= 0) return null
      return {
        merchantId: m.id,
        merchantName: m.name,
        mid: m.mid,
        currentNR: currentRevenue.netRevenue,
        potentialSaving: saving,
        potentialNR: currentRevenue.netRevenue + saving,
        currentCostPerTxn: currentCost,
        cheapestCostPerTxn: cheapestTerminal.costPerTxn,
        cheapestTerminalId: cheapestTerminal.terminalId,
        suggestedAction: `Switch to cost routing via ${gateways.find((g) => g.id === cheapestTerminal.gatewayId)?.shortName || 'cheaper'} terminal`,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.potentialSaving - a.potentialSaving)
}

// ── Shared Helpers ──────────────────────

// Simple deterministic hash for reproducible mock data
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + ch
    hash |= 0
  }
  return Math.abs(hash)
}

// ── SR Time-Series Generator ────────────

const METHOD_LABELS = { CC: 'Credit Cards', DC: 'Debit Cards', UPI: 'UPI', NB: 'Net Banking' }

function seededRandom(seed) {
  // Simple xorshift-style PRNG from a seed number
  let s = seed | 0
  s ^= s << 13; s ^= s >> 17; s ^= s << 5
  return ((s < 0 ? ~s + 1 : s) % 10000) / 10000
}

// ---------------------------------------------------------------------------
// AI Recommended Actions generator
// ---------------------------------------------------------------------------
export function generateRecommendations(merchant) {
  const recs = []

  // 1. Churn risk: txn volume dropped YoY
  const { currentMonth, lastYearSameMonth } = merchant.txnVolumeHistory || {}
  if (currentMonth && lastYearSameMonth && lastYearSameMonth > 0) {
    const yoyChange = ((currentMonth - lastYearSameMonth) / lastYearSameMonth) * 100
    if (yoyChange < -15) {
      const dropPct = Math.abs(yoyChange).toFixed(0)
      if (!merchant.srSensitive) {
        recs.push({
          id: 'enable-sr-sensitivity',
          type: 'critical',
          title: 'Enable SR Sensitivity flag',
          description: `Transaction volume has dropped ${dropPct}% compared to the same month last year, indicating potential churn risk. Enabling SR sensitivity locks routing to the highest success-rate terminal, improving payment reliability and merchant experience.`,
          signal: `${dropPct}% YoY transaction decline`,
          action: 'enable_sr_sensitive',
          impact: 'Improve payment success rate, reduce failed transactions',
        })
      } else {
        recs.push({
          id: 'churn-risk-alert',
          type: 'warning',
          title: 'Monitor churn risk closely',
          description: `Transaction volume has dropped ${dropPct}% compared to the same month last year. SR sensitivity is already enabled. Consider reaching out to the merchant to understand if there are integration or business issues driving the decline.`,
          signal: `${dropPct}% YoY transaction decline`,
          action: 'contact_merchant',
          impact: 'Retain merchant, prevent further volume loss',
        })
      }
    }
  }

  // 2. Low SR: success rate below 93% with no SR sensitivity
  if (merchant.avgPaymentSuccessRate < 93 && !merchant.srSensitive) {
    recs.push({
      id: 'low-sr-action',
      type: 'critical',
      title: 'Investigate low success rate',
      description: `Current success rate is ${merchant.avgPaymentSuccessRate}%, which is below the 93% threshold. This may lead to poor checkout experience and merchant dissatisfaction. Consider enabling SR sensitivity or reviewing terminal health.`,
      signal: `SR at ${merchant.avgPaymentSuccessRate}% (below 93% benchmark)`,
      action: 'review_terminals',
      impact: 'Improve conversion rate by 2–4%',
    })
  }

  // 3. Underutilised zero-cost terminal
  const zeroCostTerminals = merchant.gatewayMetrics.filter((gm) => gm.costPerTxn === 0)
  if (zeroCostTerminals.length > 0) {
    const lowShare = zeroCostTerminals.filter((t) => t.txnShare < 15)
    if (lowShare.length > 0) {
      recs.push({
        id: 'increase-zero-cost',
        type: 'opportunity',
        title: 'Increase zero-cost terminal traffic share',
        description: `${lowShare.length} zero-cost terminal(s) are processing less than 15% of transactions. Routing more traffic through these terminals can reduce backward cost without impacting success rates (current SR: ${lowShare.map(t => t.successRate + '%').join(', ')}).`,
        signal: `Zero-cost terminal(s) at ${lowShare.map(t => t.txnShare + '% share').join(', ')}`,
        action: 'optimize_routing',
        impact: `Save ₹${(lowShare.reduce((s, t) => s + (1.5 * merchant.monthlyTxnVolume * 0.15 / 100), 0) / 100000).toFixed(1)}L/month in backward cost`,
      })
    }
  }

  // 4. TSP compliance risk
  if (merchant.dealType === 'tsp' && merchant.dealDetails) {
    const tspTerminal = merchant.gatewayMetrics.find(
      (gm) => gm.gatewayId === merchant.currentGatewayId
    )
    if (tspTerminal && tspTerminal.txnShare < 50) {
      recs.push({
        id: 'tsp-compliance',
        type: 'warning',
        title: 'TSP deal compliance at risk',
        description: `The TSP-locked gateway is only receiving ${tspTerminal.txnShare}% of transactions, which may not meet the commitment threshold. Consider increasing routing share to avoid contract penalties.`,
        signal: `TSP gateway at ${tspTerminal.txnShare}% share (target: >50%)`,
        action: 'adjust_routing',
        impact: 'Avoid TSP contract penalty, maintain deal terms',
      })
    }
  }

  // 5. High SR merchant not flagged as SR sensitive (opportunity)
  if (merchant.avgPaymentSuccessRate >= 96 && !merchant.srSensitive) {
    const yoyChange = currentMonth && lastYearSameMonth
      ? ((currentMonth - lastYearSameMonth) / lastYearSameMonth) * 100
      : 0
    if (yoyChange >= 10) {
      recs.push({
        id: 'cost-optimise',
        type: 'opportunity',
        title: 'Switch to cost-optimised routing',
        description: `This merchant has a strong SR of ${merchant.avgPaymentSuccessRate}% and transaction volume is growing ${yoyChange.toFixed(0)}% YoY. The high SR provides headroom to route through cheaper terminals without impacting payment reliability.`,
        signal: `${merchant.avgPaymentSuccessRate}% SR with ${yoyChange.toFixed(0)}% volume growth`,
        action: 'optimize_cost',
        impact: 'Reduce backward cost while maintaining SR above 95%',
      })
    }
  }

  // 6. Terminal prioritization — cost vs SR tradeoff
  if (merchant.gatewayMetrics.length >= 2) {
    const sorted = [...merchant.gatewayMetrics].sort((a, b) => b.txnShare - a.txnShare)
    const primary = sorted[0] // highest share terminal

    const cheaperAlts = merchant.gatewayMetrics.filter(
      (t) => t.costPerTxn < primary.costPerTxn && t.terminalId !== primary.terminalId
    )

    cheaperAlts.forEach((alt) => {
      const srDiff = primary.successRate - alt.successRate
      const costDiff = primary.costPerTxn - alt.costPerTxn

      if (srDiff > 0 && srDiff <= 1.5 && costDiff >= 0.5) {
        const primaryGw = gateways.find((g) => g.id === primary.gatewayId)
        const primaryTermId = primaryGw?.terminals.find((t) => t.id === primary.terminalId)?.terminalId || primary.terminalId
        const altGw = gateways.find((g) => g.id === alt.gatewayId)
        const altTermId = altGw?.terminals.find((t) => t.id === alt.terminalId)?.terminalId || alt.terminalId

        const srBps = Math.round(srDiff * 100) // basis points
        const avgTxnValue = merchant.monthlyGMV / merchant.monthlyTxnVolume
        const costBps = Math.round((costDiff / avgTxnValue) * 10000)
        const monthlySaving = Math.round(costDiff * (primary.txnShare / 100) * merchant.monthlyTxnVolume)
        const savingLakhs = (monthlySaving / 100000).toFixed(1)

        recs.push({
          id: `terminal-prioritize-${alt.terminalId}`,
          type: 'opportunity',
          title: `Prioritise ${altTermId} over ${primaryTermId}`,
          description: `${primaryTermId} currently processes ${primary.txnShare}% of transactions at ₹${primary.costPerTxn.toFixed(2)}/txn. By shifting traffic to ${altTermId} (${alt.costPerTxn === 0 ? 'zero-cost' : '₹' + alt.costPerTxn.toFixed(2) + '/txn'}), you lose only ${srBps} bps in SR (${primary.successRate}% → ${alt.successRate}%) but save ${costBps} bps in backward cost. The SR tradeoff is minimal for a cost saving of ₹${savingLakhs}L/month.`,
          signal: `${srBps} bps SR loss vs ${costBps} bps cost saving`,
          action: 'prioritize_terminal',
          impact: `Save ₹${savingLakhs}L/month in backward cost with minimal SR impact`,
          meta: {
            fromTerminal: primaryTermId,
            toTerminal: altTermId,
            srBps,
            costBps,
            savingLakhs,
          },
        })
      }
    })
  }

  // 7. Card network routing — route Visa CC to preferred gateway
  const ccTerminals = merchant.gatewayMetrics.filter(
    (t) => (t.supportedMethods || []).includes('CC')
  )
  if (ccTerminals.length >= 2 && merchant.monthlyGMV >= 500000000) {
    const sortedCC = [...ccTerminals].sort((a, b) => a.costPerTxn - b.costPerTxn)
    const cheapestCC = sortedCC[0]
    const expensiveCC = sortedCC[sortedCC.length - 1]

    if (cheapestCC.costPerTxn < expensiveCC.costPerTxn && cheapestCC.successRate >= 93) {
      const ccGw = gateways.find((g) => g.id === cheapestCC.gatewayId)
      const ccTermId = ccGw?.terminals.find((t) => t.id === cheapestCC.terminalId)?.terminalId || cheapestCC.terminalId
      const ccGwName = ccGw?.name || 'gateway'

      // Estimate Visa CC GMV share based on category
      const visaSharePct = merchant.category === 'E-commerce' ? 38
        : merchant.category === 'Fintech' ? 42
        : merchant.category === 'Fashion' ? 35
        : 30
      const visaGMV = Math.round(merchant.monthlyGMV * visaSharePct / 100)
      const visaGMVCr = (visaGMV / 10000000).toFixed(0)

      const costPerTxnSaving = expensiveCC.costPerTxn - cheapestCC.costPerTxn
      const avgTxnVal = merchant.monthlyGMV / merchant.monthlyTxnVolume
      const nrImprovementBps = Math.round((costPerTxnSaving / avgTxnVal) * 10000)

      recs.push({
        id: 'visa-routing',
        type: 'opportunity',
        title: `Route Visa transactions to ${ccGwName}`,
        description: `Estimated monthly Visa CC GMV is ~₹${visaGMVCr}Cr. Routing Visa transactions to ${ccTermId} (${cheapestCC.costPerTxn === 0 ? 'zero-cost' : '₹' + cheapestCC.costPerTxn.toFixed(2) + '/txn'}) at ${ccGwName} — where SR is at ${cheapestCC.successRate}% — will reduce backward cost on these transactions${cheapestCC.costPerTxn === 0 ? ' to zero' : ` by ₹${costPerTxnSaving.toFixed(2)}/txn`}. This helps meet GMV targets on ${ccGwName}, earns clawback benefits, and improves net revenue by ~${nrImprovementBps} bps.`,
        signal: `₹${visaGMVCr}Cr/month Visa GMV, ${cheapestCC.successRate}% SR at ${ccGwName}`,
        action: 'visa_card_routing',
        impact: `Improve NR by ~${nrImprovementBps} bps, earn clawback on ₹${visaGMVCr}Cr Visa GMV`,
        meta: {
          gateway: ccGwName,
          terminal: ccTermId,
          visaGMVCr,
          nrBps: nrImprovementBps,
        },
      })
    }
  }

  // Ensure at least one recommendation for every merchant
  if (recs.length === 0) {
    recs.push({
      id: 'routine-review',
      type: 'info',
      title: 'Routine health check',
      description: `All metrics are within normal ranges. Current SR is ${merchant.avgPaymentSuccessRate}% and transaction volume is stable. Consider scheduling a quarterly review with the merchant to discuss growth opportunities.`,
      signal: 'All metrics nominal',
      action: 'schedule_review',
      impact: 'Strengthen merchant relationship',
    })
  }

  return recs
}

export function generateSRTimeSeries(merchant) {
  const days = 30
  const endDate = new Date(2026, 2, 10) // March 10, 2026
  const dates = []
  for (let d = 0; d < days; d++) {
    const dt = new Date(endDate)
    dt.setDate(dt.getDate() - (days - 1 - d))
    dates.push(dt.toISOString().slice(0, 10))
  }

  // Build terminal info with display IDs
  const terminalInfos = merchant.gatewayMetrics.map((gm) => {
    const gw = gateways.find((g) => g.id === gm.gatewayId)
    const term = gw?.terminals.find((t) => t.id === gm.terminalId)
    return {
      terminalId: gm.terminalId,
      displayId: term?.terminalId || gm.terminalId,
      gatewayShort: gw?.shortName || 'Unknown',
      baseSR: gm.successRate,
      txnShare: gm.txnShare,
      supportedMethods: gm.supportedMethods || ['CC', 'DC', 'UPI', 'NB'],
    }
  })

  // Determine which methods this merchant has across all terminals
  const allMethods = new Set()
  terminalInfos.forEach((t) => t.supportedMethods.forEach((m) => allMethods.add(m)))

  // Decide if this merchant gets a SR dip event (deterministic)
  const merchantSeed = hashCode(merchant.id + '-dip')
  const hasDip = merchantSeed % 3 === 0 // ~33% of merchants
  const dipStartDay = (merchantSeed % 20) + 3 // day 3-22
  const dipDuration = 3 + (merchantSeed % 4) // 3-6 days
  const dipTerminalIdx = merchantSeed % terminalInfos.length
  const dipMagnitude = 3 + (merchantSeed % 5) // 3-7% drop

  // Generate per-terminal, per-method, per-day SR
  const byMethod = {}
  const methodOrder = ['CC', 'DC', 'UPI', 'NB']

  methodOrder.forEach((method) => {
    if (!allMethods.has(method)) return

    const terminalsForMethod = terminalInfos.filter((t) => t.supportedMethods.includes(method))
    if (terminalsForMethod.length === 0) return

    const terminals = {}
    terminalsForMethod.forEach((term) => {
      const dailySR = []
      for (let d = 0; d < days; d++) {
        const seed = hashCode(merchant.id + '-' + method + '-' + term.terminalId + '-' + d)
        const noise = (seededRandom(seed) - 0.5) * 4 // ±2% noise
        let sr = term.baseSR + noise

        // Apply dip event
        if (hasDip && term === terminalInfos[dipTerminalIdx] && d >= dipStartDay && d < dipStartDay + dipDuration) {
          const dipProgress = (d - dipStartDay) / dipDuration
          const dipCurve = Math.sin(dipProgress * Math.PI) // peaks in middle
          sr -= dipMagnitude * dipCurve
        }

        dailySR.push(Math.round(Math.max(75, Math.min(100, sr)) * 10) / 10)
      }
      terminals[term.displayId] = dailySR
    })

    // Method-level SR = weighted average of terminal SRs
    const methodSR = []
    for (let d = 0; d < days; d++) {
      let totalWeight = 0
      let weightedSum = 0
      terminalsForMethod.forEach((term) => {
        const w = term.txnShare
        weightedSum += terminals[term.displayId][d] * w
        totalWeight += w
      })
      methodSR.push(Math.round((weightedSum / totalWeight) * 10) / 10)
    }

    byMethod[method] = { sr: methodSR, label: METHOD_LABELS[method], terminals }
  })

  // Overall SR = weighted average across all methods (equal weight per method for simplicity)
  const activeMethodKeys = Object.keys(byMethod)
  const overall = []
  for (let d = 0; d < days; d++) {
    let sum = 0
    activeMethodKeys.forEach((m) => { sum += byMethod[m].sr[d] })
    overall.push(Math.round((sum / activeMethodKeys.length) * 10) / 10)
  }

  return { dates, overall, byMethod }
}

// ── Transaction Generator ───────────────

const PAYMENT_METHODS = [
  { type: 'Visa Credit', short: 'CC' },
  { type: 'Mastercard Credit', short: 'CC' },
  { type: 'Visa Debit', short: 'DC' },
  { type: 'RuPay Debit', short: 'DC' },
  { type: 'UPI', short: 'UPI' },
  { type: 'Net Banking', short: 'NB' },
]

export function generateMerchantTransactions(merchant) {
  const txnCount = 30
  const transactions = []
  const avgTxnValue = merchant.monthlyGMV / merchant.monthlyTxnVolume

  // Build terminal info from gatewayMetrics + gateways
  const terminalInfos = merchant.gatewayMetrics.map((gm) => {
    const gw = gateways.find((g) => g.id === gm.gatewayId)
    const term = gw?.terminals.find((t) => t.id === gm.terminalId)
    return {
      gatewayId: gm.gatewayId,
      terminalId: gm.terminalId,
      displayTerminalId: term?.terminalId || gm.terminalId,
      gatewayShort: gw?.shortName || 'Unknown',
      successRate: gm.successRate,
      costPerTxn: gm.costPerTxn,
      txnShare: gm.txnShare,
    }
  })

  // Find the preferred terminal (highest txnShare)
  const preferred = terminalInfos.slice().sort((a, b) => b.txnShare - a.txnShare)[0]

  for (let i = 0; i < txnCount; i++) {
    const seed = hashCode(merchant.id + '-txn-' + i)
    const txnId = 'pay_' + seed.toString(36).padStart(8, '0').slice(0, 8).toUpperCase()

    // Timestamp: within last 7 days
    const now = new Date(2026, 2, 11, 10, 0, 0) // March 11, 2026
    const hoursAgo = (seed % 168) // up to 7 days * 24 hours
    const timestamp = new Date(now.getTime() - hoursAgo * 3600000)

    // Amount
    const amountSeed = hashCode(merchant.id + '-amt-' + i)
    const amount = Math.round(avgTxnValue * (0.3 + (amountSeed % 300) / 100))

    // Payment method
    const pmIdx = seed % PAYMENT_METHODS.length
    const paymentMethod = PAYMENT_METHODS[pmIdx]

    // Status: ~80% success, 10% failed, 10% refunded
    const statusSeed = hashCode(merchant.id + '-st-' + i) % 10
    const status = statusSeed < 8 ? 'success' : statusSeed < 9 ? 'failed' : 'refunded'

    // Simulate routing decision
    let routingDecision
    const srVariation = ((hashCode(merchant.id + '-sr-' + i) % 80) - 40) / 10 // -4 to +4

    if (merchant.srSensitive) {
      // SR Sensitive: always pick highest SR
      const sorted = terminalInfos.slice().sort((a, b) => b.successRate - a.successRate)
      const selected = sorted[0]
      routingDecision = {
        selectedTerminalId: selected.displayTerminalId,
        selectedGatewayShort: selected.gatewayShort,
        selectedSR: selected.successRate,
        selectedCost: selected.costPerTxn,
        reason: 'Merchant is SR-sensitive. Routing locked to highest SR terminal.',
        wasDePrioritized: false,
        dePrioritizedTerminal: null,
        allEvaluated: sorted.map((t, idx) => ({
          terminalId: t.displayTerminalId,
          gatewayShort: t.gatewayShort,
          successRate: t.successRate,
          costPerTxn: t.costPerTxn,
          status: idx === 0 ? 'selected' : 'rejected_sr_sensitive_not_highest',
          statusReason: idx === 0
            ? 'Highest SR terminal — selected for SR-sensitive merchant'
            : `SR ${t.successRate}% is lower than ${sorted[0].successRate}% (highest available)`,
        })),
      }
    } else {
      // Non-SR-sensitive: threshold-based routing
      const threshold = merchant.srThresholdLow || 87

      // Apply SR variation to simulate real-world fluctuation
      const variedTerminals = terminalInfos.map((t) => ({
        ...t,
        effectiveSR: Number((t.successRate + (hashCode(t.terminalId + '-' + i) % 60 - 30) / 10).toFixed(1)),
      }))

      // Check if preferred terminal is above threshold
      const preferredVaried = variedTerminals.find((t) => t.terminalId === preferred.terminalId)
      const aboveThreshold = variedTerminals
        .filter((t) => t.effectiveSR >= threshold)
        .sort((a, b) => a.costPerTxn - b.costPerTxn) // cheapest first

      let selected
      let wasDePrioritized = false
      let dePrioritizedTerminal = null

      if (preferredVaried && preferredVaried.effectiveSR < threshold && aboveThreshold.length > 0) {
        // Preferred terminal is below threshold — de-prioritize
        wasDePrioritized = true
        dePrioritizedTerminal = {
          id: preferredVaried.displayTerminalId,
          sr: preferredVaried.effectiveSR,
          threshold,
        }
        selected = aboveThreshold[0] // cheapest above threshold
      } else if (aboveThreshold.length > 0) {
        // Preferred terminal is fine, use cheapest above threshold
        selected = aboveThreshold[0]
      } else {
        // No terminal above threshold, use highest SR as fallback
        selected = variedTerminals.slice().sort((a, b) => b.effectiveSR - a.effectiveSR)[0]
      }

      const reason = wasDePrioritized
        ? `Terminal ${dePrioritizedTerminal.id} de-prioritized: SR ${dePrioritizedTerminal.sr}% below ${threshold}% threshold. Routed to ${selected.displayTerminalId}: SR ${selected.effectiveSR}%, Cost ₹${selected.costPerTxn.toFixed(2)} (cheapest above threshold)`
        : `Terminal ${selected.displayTerminalId} selected: SR ${selected.effectiveSR}% meets ${threshold}% threshold, Cost ₹${selected.costPerTxn.toFixed(2)}`

      routingDecision = {
        selectedTerminalId: selected.displayTerminalId,
        selectedGatewayShort: selected.gatewayShort,
        selectedSR: selected.effectiveSR,
        selectedCost: selected.costPerTxn,
        reason,
        wasDePrioritized,
        dePrioritizedTerminal,
        allEvaluated: variedTerminals.map((t) => {
          let evalStatus, evalReason
          if (t.terminalId === selected.terminalId) {
            evalStatus = 'selected'
            evalReason = wasDePrioritized
              ? `Cheapest terminal above ${threshold}% threshold`
              : `Meets ${threshold}% threshold at lowest cost`
          } else if (t.effectiveSR < threshold) {
            evalStatus = 'rejected_below_threshold'
            evalReason = `SR ${t.effectiveSR}% is below ${threshold}% threshold`
          } else {
            evalStatus = 'rejected_higher_cost'
            evalReason = `SR ${t.effectiveSR}% meets threshold but cost ₹${t.costPerTxn.toFixed(2)} is higher than selected (₹${selected.costPerTxn.toFixed(2)})`
          }
          return {
            terminalId: t.displayTerminalId,
            gatewayShort: t.gatewayShort,
            successRate: t.effectiveSR,
            costPerTxn: t.costPerTxn,
            status: evalStatus,
            statusReason: evalReason,
          }
        }),
      }
    }

    transactions.push({
      txnId,
      timestamp,
      amount,
      paymentMethod,
      status,
      gatewayId: terminalInfos.find((t) => t.displayTerminalId === routingDecision.selectedTerminalId)?.gatewayId || merchant.currentGatewayId,
      terminalId: terminalInfos.find((t) => t.displayTerminalId === routingDecision.selectedTerminalId)?.terminalId || merchant.currentTerminalId,
      routingDecision,
    })
  }

  // Sort by timestamp descending (most recent first)
  transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return transactions
}

// ---------------------------------------------------------------------------
// Monthly performance history (24 months) for heatmap
// ---------------------------------------------------------------------------
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Hardcoded achievement percentages for deterministic rendering
// Distribution: ~13 green (>=90%), ~8 yellow (70-89%), ~3 red (<70%)
const ACHIEVEMENT_PCT = [
  92.3, 88.5, 95.1, 67.4, 101.2, 85.7,   // Apr-Sep 2024
  93.8, 78.2, 96.5, 104.3, 91.0, 89.1,    // Oct 2024 - Mar 2025
  87.6, 94.2, 72.8, 98.7, 82.3, 95.9,     // Apr-Sep 2025
  103.1, 76.5, 90.8, 97.4, 88.3,          // Oct 2025 - Feb 2026
  // March 2026 uses live data — not in this array
]

function classifyMonth(pct) {
  if (pct >= 90) return 'green'
  if (pct >= 70) return 'yellow'
  return 'red'
}

export function generateMonthlyHistory(merchantList) {
  const stats = computeAggregateStats(merchantList)
  const baseTarget = 120000000 // 12 Cr

  const months = []
  const startYear = 2024
  const startMonth = 4 // April (1-indexed)

  for (let i = 0; i < 24; i++) {
    const monthIdx = (startMonth - 1 + i) % 12 // 0-indexed
    const year = startYear + Math.floor((startMonth - 1 + i) / 12)
    const isCurrent = year === 2026 && monthIdx === 2 // March 2026

    let pct, achieved
    if (isCurrent) {
      achieved = stats.totalNetRevenue
      pct = Number(((achieved / baseTarget) * 100).toFixed(1))
    } else {
      pct = ACHIEVEMENT_PCT[i]
      achieved = Math.round(baseTarget * (pct / 100))
    }

    months.push({
      year,
      month: monthIdx + 1,
      monthLabel: MONTH_LABELS[monthIdx],
      monthFull: `${MONTH_FULL[monthIdx]} ${year}`,
      target: baseTarget,
      achieved,
      percentage: pct,
      status: classifyMonth(pct),
      isCurrent,
    })
  }

  return months
}
