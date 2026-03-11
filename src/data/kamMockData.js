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
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 45 },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 20 },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 25 },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 10 },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 70 },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-002', successRate: 93.4, costPerTxn: 1.45, txnShare: 30 },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: true },
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
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 60 },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 20 },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 20 },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 50 },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 30 },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 20 },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 60 },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 40 },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 55 },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 45 },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 2, hasFallback: false, hasCardRestrictions: false, hasNetworkRestrictions: true },
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
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 75 },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 25 },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 60 },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 40 },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: true },
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
      { gatewayId: 'gw-icici', terminalId: 'term-icici-002', successRate: 93.4, costPerTxn: 1.45, txnShare: 50 },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 50 },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 2, hasFallback: false, hasCardRestrictions: true, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-axis', terminalId: 'term-axis-002', successRate: 91.5, costPerTxn: 0, txnShare: 60 },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 40 },
    ],
    status: 'active',
    routingRules: { selectRules: 0, rejectRules: 1, hasFallback: false, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 40 },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 15 },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 30 },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 15 },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 45 },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 35 },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 20 },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 35 },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 0, txnShare: 15 },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 35 },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-002', successRate: 91.5, costPerTxn: 0, txnShare: 15 },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 70 },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 30 },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 2, hasFallback: false, hasCardRestrictions: true, hasNetworkRestrictions: false },
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
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0, txnShare: 60 },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-002', successRate: 88.9, costPerTxn: 0.95, txnShare: 40 },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 1, hasFallback: false, hasCardRestrictions: false, hasNetworkRestrictions: false },
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
