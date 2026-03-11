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
      { id: 'term-hdfc-001', terminalId: 'HDFC_T1', successRate: 96.2, costPerTxn: 1.80 },
      { id: 'term-hdfc-002', terminalId: 'HDFC_T2', successRate: 94.8, costPerTxn: 1.65 },
    ],
  },
  {
    id: 'gw-icici',
    name: 'ICICI Bank',
    shortName: 'ICICI',
    terminals: [
      { id: 'term-icici-001', terminalId: 'ICICI_T1', successRate: 95.1, costPerTxn: 1.70 },
      { id: 'term-icici-002', terminalId: 'ICICI_T2', successRate: 93.4, costPerTxn: 1.45 },
    ],
  },
  {
    id: 'gw-axis',
    name: 'Axis Bank',
    shortName: 'Axis',
    terminals: [
      { id: 'term-axis-001', terminalId: 'AXIS_T1', successRate: 93.8, costPerTxn: 1.50 },
      { id: 'term-axis-002', terminalId: 'AXIS_T2', successRate: 91.5, costPerTxn: 1.25 },
    ],
  },
  {
    id: 'gw-rbl',
    name: 'RBL Bank',
    shortName: 'RBL',
    terminals: [
      { id: 'term-rbl-001', terminalId: 'RBL_T1', successRate: 90.3, costPerTxn: 1.10 },
      { id: 'term-rbl-002', terminalId: 'RBL_T2', successRate: 88.9, costPerTxn: 0.95 },
    ],
  },
  {
    id: 'gw-yes',
    name: 'Yes Bank',
    shortName: 'Yes',
    terminals: [
      { id: 'term-yes-001', terminalId: 'YES_T1', successRate: 89.7, costPerTxn: 0.95 },
      { id: 'term-yes-002', terminalId: 'YES_T2', successRate: 88.2, costPerTxn: 0.85 },
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
    monthlyTxnVolume: 1250000,
    monthlyGMV: 437500000,
    avgPaymentSuccessRate: 95.8,
    forwardPricing: 2.0,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 65 },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 25 },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 10 },
    ],
    status: 'active',
    contactName: 'Deepinder Goyal',
    contactEmail: 'payments@zomato.com',
  },
  {
    id: 'merch-002',
    name: 'Swiggy',
    mid: 'MID_SWG_002',
    category: 'Food & Delivery',
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
    contactName: 'Sriharsha Majety',
    contactEmail: 'finance@swiggy.in',
  },
  {
    id: 'merch-003',
    name: 'CRED',
    mid: 'MID_CRD_003',
    category: 'Fintech',
    monthlyTxnVolume: 850000,
    monthlyGMV: 620000000,
    avgPaymentSuccessRate: 97.1,
    forwardPricing: 1.8,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 80 },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 20 },
    ],
    status: 'active',
    contactName: 'Kunal Shah',
    contactEmail: 'payments@cred.club',
  },
  {
    id: 'merch-004',
    name: 'Flipkart',
    mid: 'MID_FLK_004',
    category: 'E-commerce',
    monthlyTxnVolume: 2200000,
    monthlyGMV: 1320000000,
    avgPaymentSuccessRate: 94.2,
    forwardPricing: 1.6,
    currentGatewayId: 'gw-icici',
    currentTerminalId: 'term-icici-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 50 },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 1.65, txnShare: 30 },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 93.8, costPerTxn: 1.50, txnShare: 20 },
    ],
    status: 'active',
    contactName: 'Kalyan Krishnamurthy',
    contactEmail: 'payments@flipkart.com',
  },
  {
    id: 'merch-005',
    name: 'BigBasket',
    mid: 'MID_BBK_005',
    category: 'Grocery',
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
    contactName: 'Hari Menon',
    contactEmail: 'finance@bigbasket.com',
  },
  {
    id: 'merch-006',
    name: 'Myntra',
    mid: 'MID_MYN_006',
    category: 'Fashion',
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
    contactName: 'Nandita Sinha',
    contactEmail: 'payments@myntra.com',
  },
  {
    id: 'merch-007',
    name: 'BookMyShow',
    mid: 'MID_BMS_007',
    category: 'Entertainment',
    monthlyTxnVolume: 450000,
    monthlyGMV: 180000000,
    avgPaymentSuccessRate: 96.3,
    forwardPricing: 2.5,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 75 },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0.95, txnShare: 25 },
    ],
    status: 'active',
    contactName: 'Ashish Hemrajani',
    contactEmail: 'finance@bookmyshow.com',
  },
  {
    id: 'merch-008',
    name: 'MakeMyTrip',
    mid: 'MID_MMT_008',
    category: 'Travel',
    monthlyTxnVolume: 380000,
    monthlyGMV: 850000000,
    avgPaymentSuccessRate: 95.5,
    forwardPricing: 1.5,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-002',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 94.8, costPerTxn: 1.65, txnShare: 60 },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 40 },
    ],
    status: 'active',
    contactName: 'Rajesh Magow',
    contactEmail: 'payments@makemytrip.com',
  },
  {
    id: 'merch-009',
    name: 'Nykaa',
    mid: 'MID_NYK_009',
    category: 'Beauty',
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
    contactName: 'Falguni Nayar',
    contactEmail: 'finance@nykaa.com',
  },
  {
    id: 'merch-010',
    name: 'Urban Company',
    mid: 'MID_URC_010',
    category: 'Services',
    monthlyTxnVolume: 310000,
    monthlyGMV: 85000000,
    avgPaymentSuccessRate: 90.4,
    forwardPricing: 2.4,
    currentGatewayId: 'gw-axis',
    currentTerminalId: 'term-axis-002',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-axis', terminalId: 'term-axis-002', successRate: 91.5, costPerTxn: 1.25, txnShare: 60 },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0.95, txnShare: 40 },
    ],
    status: 'active',
    contactName: 'Abhiraj Bhal',
    contactEmail: 'payments@urbancompany.com',
  },
  {
    id: 'merch-011',
    name: 'Zepto',
    mid: 'MID_ZPT_011',
    category: 'Quick Commerce',
    monthlyTxnVolume: 780000,
    monthlyGMV: 195000000,
    avgPaymentSuccessRate: 93.9,
    forwardPricing: 2.0,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 55 },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 30 },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-002', successRate: 88.2, costPerTxn: 0.85, txnShare: 15 },
    ],
    status: 'active',
    contactName: 'Aadit Palicha',
    contactEmail: 'finance@zeptonow.com',
  },
  {
    id: 'merch-012',
    name: 'Ola',
    mid: 'MID_OLA_012',
    category: 'Mobility',
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
    contactName: 'Bhavish Aggarwal',
    contactEmail: 'payments@olacabs.com',
  },
  {
    id: 'merch-013',
    name: 'PhonePe',
    mid: 'MID_PPE_013',
    category: 'Fintech',
    monthlyTxnVolume: 3200000,
    monthlyGMV: 960000000,
    avgPaymentSuccessRate: 96.8,
    forwardPricing: 1.4,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 96.2, costPerTxn: 1.80, txnShare: 50 },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 95.1, costPerTxn: 1.70, txnShare: 35 },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-002', successRate: 91.5, costPerTxn: 1.25, txnShare: 15 },
    ],
    status: 'active',
    contactName: 'Sameer Nigam',
    contactEmail: 'finance@phonepe.com',
  },
  {
    id: 'merch-014',
    name: 'Paytm Mall',
    mid: 'MID_PTM_014',
    category: 'E-commerce',
    monthlyTxnVolume: 420000,
    monthlyGMV: 120000000,
    avgPaymentSuccessRate: 89.6,
    forwardPricing: 2.1,
    currentGatewayId: 'gw-rbl',
    currentTerminalId: 'term-rbl-001',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 90.3, costPerTxn: 1.10, txnShare: 70 },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-002', successRate: 88.2, costPerTxn: 0.85, txnShare: 30 },
    ],
    status: 'active',
    contactName: 'Vijay Shekhar',
    contactEmail: 'payments@paytmmall.com',
  },
  {
    id: 'merch-015',
    name: '1mg',
    mid: 'MID_1MG_015',
    category: 'Healthcare',
    monthlyTxnVolume: 290000,
    monthlyGMV: 75000000,
    avgPaymentSuccessRate: 91.2,
    forwardPricing: 2.2,
    currentGatewayId: 'gw-yes',
    currentTerminalId: 'term-yes-001',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 89.7, costPerTxn: 0.95, txnShare: 60 },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-002', successRate: 88.9, costPerTxn: 0.95, txnShare: 40 },
    ],
    status: 'active',
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
