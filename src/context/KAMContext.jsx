import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import {
  merchants as initialMerchants,
  gateways,
  computeMerchantRevenue,
  computeAggregateStats,
  getMonthlyTargetData,
} from '../data/kamMockData'

const KAMContext = createContext(null)

export function KAMProvider({ children }) {
  const [merchants, setMerchants] = useState(() =>
    initialMerchants.map((m) => ({ ...m, gatewayMetrics: [...m.gatewayMetrics] }))
  )

  // Table state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filterRouting, setFilterRouting] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Selection
  const [selectedIds, setSelectedIds] = useState([])

  // Modal state
  const [activeModal, setActiveModal] = useState(null)
  const [modalMerchantId, setModalMerchantId] = useState(null)

  // Toast
  const [toast, setToast] = useState(null)

  // Audit log
  const [auditLog, setAuditLog] = useState([
    {
      id: 'log-001',
      timestamp: '09 Mar, 10:30 am',
      user: 'anugrah.sharma@razorpay.com',
      action: 'Reviewed Zomato gateway performance metrics',
      reason: 'Monthly review of top merchants',
      merchantId: 'merch-001',
    },
    {
      id: 'log-002',
      timestamp: '08 Mar, 03:15 pm',
      user: 'admin@razorpay.com',
      action: 'Adjusted Cost Threshold to -4.5% for CRED',
      reason: 'Optimizing for Q4 cost reduction targets',
      merchantId: 'merch-004',
    },
    {
      id: 'log-003',
      timestamp: '07 Mar, 11:30 am',
      user: 'ops@razorpay.com',
      action: 'Disabled terminal ICICI_T1 for Zomato',
      reason: 'High failure rate during peak hours',
      merchantId: 'merch-001',
    },
    {
      id: 'log-004',
      timestamp: '06 Mar, 09:15 am',
      user: 'admin@razorpay.com',
      action: 'Switched Swiggy to Cost Optimised mode',
      reason: 'Monthly cost optimization cycle',
      merchantId: 'merch-002',
    },
    {
      id: 'log-005',
      timestamp: '05 Mar, 04:45 pm',
      user: 'system@razorpay.com',
      action: 'Auto-enabled terminal HDFC_T1 for Zomato',
      reason: 'SR threshold recovery detected',
      merchantId: 'merch-001',
    },
    {
      id: 'log-006',
      timestamp: '04 Mar, 02:00 pm',
      user: 'anugrah.sharma@razorpay.com',
      action: 'Bulk changed 5 merchants to Cost Based routing',
      reason: 'Q1 cost optimization initiative',
      merchantId: null,
    },
    {
      id: 'log-007',
      timestamp: '03 Mar, 11:00 am',
      user: 'ops@razorpay.com',
      action: 'Changed Flipkart gateway to HDFC Bank',
      reason: 'Better success rates on HDFC for e-commerce',
      merchantId: 'merch-005',
    },
    {
      id: 'log-008',
      timestamp: '01 Mar, 09:00 am',
      user: 'system@razorpay.com',
      action: 'Monthly revenue targets reset for March 2026',
      reason: 'Automated monthly cycle',
      merchantId: null,
    },
  ])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const addAuditEntry = useCallback((action, reason, merchantId) => {
    const now = new Date()
    const timeStr = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    }) + ', ' + now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    setAuditLog((prev) => [
      {
        id: 'log-' + Date.now(),
        timestamp: timeStr,
        user: 'anugrah.sharma@razorpay.com',
        action,
        reason: reason || 'No reason provided',
        merchantId,
      },
      ...prev,
    ])
  }, [])

  // Selection actions
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  const selectAll = useCallback(
    (filteredIds) => {
      setSelectedIds(filteredIds)
    },
    []
  )

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  // Modal actions
  const openModal = useCallback((type, merchantId = null) => {
    setActiveModal(type)
    setModalMerchantId(merchantId)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setModalMerchantId(null)
  }, [])

  // Data mutations
  const changeRouting = useCallback(
    (merchantId, newStrategy, reason) => {
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === merchantId ? { ...m, routingStrategy: newStrategy } : m
        )
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      addAuditEntry(
        `Changed ${merchant?.name || merchantId} routing to ${newStrategy === 'cost_based' ? 'Cost Based' : 'Success Rate Based'}`,
        reason,
        merchantId
      )
      showToast(`Routing updated for ${merchant?.name}`)
    },
    [merchants, addAuditEntry, showToast]
  )

  const changeGateway = useCallback(
    (merchantId, newGatewayId, newTerminalId, reason) => {
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === merchantId
            ? { ...m, currentGatewayId: newGatewayId, currentTerminalId: newTerminalId }
            : m
        )
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      const gw = gateways.find((g) => g.id === newGatewayId)
      addAuditEntry(
        `Changed ${merchant?.name || merchantId} gateway to ${gw?.name} (${newTerminalId})`,
        reason,
        merchantId
      )
      showToast(`Gateway updated for ${merchant?.name}`)
    },
    [merchants, addAuditEntry, showToast]
  )

  const bulkChangeRouting = useCallback(
    (ids, newStrategy, reason) => {
      setMerchants((prev) =>
        prev.map((m) =>
          ids.includes(m.id) ? { ...m, routingStrategy: newStrategy } : m
        )
      )
      addAuditEntry(
        `Bulk changed ${ids.length} merchants to ${newStrategy === 'cost_based' ? 'Cost Based' : 'Success Rate Based'}`,
        reason,
        null
      )
      showToast(`Routing updated for ${ids.length} merchants`)
      setSelectedIds([])
    },
    [addAuditEntry, showToast]
  )

  const bulkChangeGateway = useCallback(
    (ids, newGatewayId, newTerminalId, reason) => {
      setMerchants((prev) =>
        prev.map((m) =>
          ids.includes(m.id)
            ? { ...m, currentGatewayId: newGatewayId, currentTerminalId: newTerminalId }
            : m
        )
      )
      const gw = gateways.find((g) => g.id === newGatewayId)
      addAuditEntry(
        `Bulk changed ${ids.length} merchants gateway to ${gw?.name}`,
        reason,
        null
      )
      showToast(`Gateway updated for ${ids.length} merchants`)
      setSelectedIds([])
    },
    [addAuditEntry, showToast]
  )

  // Computed: filtered + sorted merchants
  const getFilteredSortedMerchants = useMemo(() => {
    let list = [...merchants]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.mid.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      )
    }

    // Filter routing
    if (filterRouting !== 'all') {
      list = list.filter((m) => m.routingStrategy === filterRouting)
    }

    // Filter status
    if (filterStatus !== 'all') {
      list = list.filter((m) => m.status === filterStatus)
    }

    // Sort
    list.sort((a, b) => {
      let aVal, bVal
      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'successRate':
          aVal = a.avgPaymentSuccessRate
          bVal = b.avgPaymentSuccessRate
          break
        case 'txnVolume':
          aVal = a.monthlyTxnVolume
          bVal = b.monthlyTxnVolume
          break
        case 'netRevenue':
          aVal = computeMerchantRevenue(a).netRevenue
          bVal = computeMerchantRevenue(b).netRevenue
          break
        case 'costPerTxn':
          aVal = computeMerchantRevenue(a).costPerTxn
          bVal = computeMerchantRevenue(b).costPerTxn
          break
        case 'forwardPricing':
          aVal = a.forwardPricing
          bVal = b.forwardPricing
          break
        case 'routingStrategy':
          aVal = a.routingStrategy
          bVal = b.routingStrategy
          break
        default:
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [merchants, searchQuery, sortField, sortDirection, filterRouting, filterStatus])

  const getMerchantById = useCallback(
    (id) => merchants.find((m) => m.id === id),
    [merchants]
  )

  const stats = useMemo(() => computeAggregateStats(merchants), [merchants])
  const targetData = useMemo(() => getMonthlyTargetData(merchants), [merchants])

  const toggleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField]
  )

  const value = {
    merchants: getFilteredSortedMerchants,
    allMerchants: merchants,
    stats,
    targetData,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    toggleSort,
    filterRouting,
    setFilterRouting,
    filterStatus,
    setFilterStatus,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    activeModal,
    modalMerchantId,
    openModal,
    closeModal,
    changeRouting,
    changeGateway,
    bulkChangeRouting,
    bulkChangeGateway,
    getMerchantById,
    toast,
    showToast,
    auditLog,
    addAuditEntry,
    gateways,
  }

  return <KAMContext.Provider value={value}>{children}</KAMContext.Provider>
}

export function useKAM() {
  const ctx = useContext(KAMContext)
  if (!ctx) throw new Error('useKAM must be used within KAMProvider')
  return ctx
}
