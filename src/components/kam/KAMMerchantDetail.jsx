import React, { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useKAM } from '../../context/KAMContext'
import {
  formatINR,
  formatNumber,
  computeMerchantRevenue,
  isTerminalZeroCost,
  computeTSPCompliance,
  computeCBROrder,
  getBackwardPricingBreakdown,
  generateMerchantTransactions,
  generateSRTimeSeries,
  generateRecommendations,
  generateSankeyData,
  RULE_CONDITIONS,
  RULE_OPERATOR_LABELS,
  evaluateRules,
  detectNTFGaps,
  simulateTransaction,
  getTerminalDisplayId,
  getTerminalGatewayInfo,
  gateways as gatewayData,
} from '../../data/kamMockData'

// ---------------------------------------------------------------------------
// Deterministic pseudo-random from a string (for methods & daily volumes)
// ---------------------------------------------------------------------------
function hashStr(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

const METHOD_MAP = {
  HDFC: 'CC',
  ICICI: 'UPI',
  AXIS: 'DC',
  RBL: 'NB',
  YES: 'UPI',
}

function pickMethod(terminalId) {
  const prefix = terminalId.split('_')[0]
  return METHOD_MAP[prefix] || 'UPI'
}

function pickDailyVolume(terminalId) {
  // 8L - 60L range
  const h = hashStr(terminalId + '_vol')
  return 800000 + (h % 5200000)
}

function formatLakhs(amount) {
  return '\u20B9' + (amount / 100000).toFixed(1) + 'L'
}

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const PercentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
)

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const LightningIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const DollarLargeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const RoutingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const ServerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ShieldAlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const AlertCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

// ---------------------------------------------------------------------------
// SR Line Chart sub-component
// ---------------------------------------------------------------------------

const SR_COLORS = {
  overall: '#528FF0',
  CC: '#E65100',
  DC: '#1565C0',
  UPI: '#2E7D32',
  NB: '#7B1FA2',
}

const METHOD_DISPLAY = {
  CC: 'Credit',
  DC: 'Debit',
  UPI: 'UPI',
  NB: 'NB',
}

function SRLineChart({ srData }) {
  const [selectedSeries, setSelectedSeries] = useState(() => new Set(['overall']))
  const [expandedMethods, setExpandedMethods] = useState(() => new Set())
  const [hoverIdx, setHoverIdx] = useState(null)

  const { dates, overall, byMethod } = srData
  const methodKeys = Object.keys(byMethod)

  // Build all visible lines with their data & color
  const visibleLines = useMemo(() => {
    const lines = []
    if (selectedSeries.has('overall')) {
      lines.push({ key: 'overall', label: 'All Methods', color: SR_COLORS.overall, data: overall })
    }
    methodKeys.forEach((m) => {
      if (selectedSeries.has(m)) {
        lines.push({ key: m, label: METHOD_DISPLAY[m] || m, color: SR_COLORS[m] || '#888', data: byMethod[m].sr })
      }
      // Terminal lines
      const terminals = byMethod[m].terminals
      Object.keys(terminals).forEach((tId) => {
        const tKey = m + ':' + tId
        if (selectedSeries.has(tKey)) {
          lines.push({ key: tKey, label: tId, color: SR_COLORS[m] || '#888', data: terminals[tId], dashed: true })
        }
      })
    })
    return lines
  }, [selectedSeries, overall, byMethod, methodKeys])

  // Compute Y-axis bounds
  const { yMin, yMax, yTicks } = useMemo(() => {
    let lo = 100, hi = 0
    visibleLines.forEach((l) => l.data.forEach((v) => { if (v < lo) lo = v; if (v > hi) hi = v }))
    if (lo === 100 && hi === 0) { lo = 85; hi = 100 } // fallback
    const padding = 2
    const rMin = Math.floor((lo - padding) / 2) * 2
    const rMax = Math.ceil((hi + padding) / 2) * 2
    const ticks = []
    for (let t = rMin; t <= rMax; t += 2) ticks.push(t)
    if (ticks.length < 3) { ticks.unshift(ticks[0] - 2); ticks.push(ticks[ticks.length - 1] + 2) }
    return { yMin: ticks[0], yMax: ticks[ticks.length - 1], yTicks: ticks }
  }, [visibleLines])

  // Chart layout constants
  const chartPadLeft = 44
  const chartPadRight = 12
  const chartPadTop = 10
  const chartPadBottom = 28
  const chartH = 280

  const toggleSeries = useCallback((key) => {
    setSelectedSeries((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleExpand = useCallback((method) => {
    setExpandedMethods((prev) => {
      const next = new Set(prev)
      if (next.has(method)) next.delete(method); else next.add(method)
      return next
    })
  }, [])

  // Convert data point to SVG coordinates
  const toX = useCallback((i, w) => chartPadLeft + (i / (dates.length - 1)) * (w - chartPadLeft - chartPadRight), [dates.length])
  const toY = useCallback((v) => chartPadTop + ((yMax - v) / (yMax - yMin)) * (chartH - chartPadTop - chartPadBottom), [yMin, yMax])

  // Build polyline points string
  const buildPoints = useCallback((data, w) => data.map((v, i) => `${toX(i, w)},${toY(v)}`).join(' '), [toX, toY])

  // Build area path (fill under line)
  const buildArea = useCallback((data, w) => {
    const bottom = chartH - chartPadBottom
    const pts = data.map((v, i) => `${toX(i, w)},${toY(v)}`)
    return `M${toX(0, w)},${bottom} L${pts.join(' L')} L${toX(data.length - 1, w)},${bottom} Z`
  }, [toX, toY])

  // SVG ref for measuring width
  const [svgWidth, setSvgWidth] = useState(600)
  const svgRef = useCallback((node) => {
    if (node) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) setSvgWidth(entry.contentRect.width)
      })
      ro.observe(node)
      setSvgWidth(node.getBoundingClientRect().width)
    }
  }, [])

  // Hover handling
  const handleMouseMove = useCallback((e) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const dataAreaStart = chartPadLeft
    const dataAreaEnd = svgWidth - chartPadRight
    if (mouseX < dataAreaStart || mouseX > dataAreaEnd) { setHoverIdx(null); return }
    const ratio = (mouseX - dataAreaStart) / (dataAreaEnd - dataAreaStart)
    const idx = Math.round(ratio * (dates.length - 1))
    setHoverIdx(Math.max(0, Math.min(dates.length - 1, idx)))
  }, [svgWidth, dates.length])

  const handleMouseLeave = useCallback(() => setHoverIdx(null), [])

  // Format date for display
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="kam-sr-chart-card">
      <div className="kam-sr-chart-card-header">
        <div className="kam-sr-chart-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Success Rate Trend
        </div>
        <span className="kam-sr-chart-period">Last 30 days</span>
      </div>

      <div className="kam-sr-chart-body">
        {/* ── Sidebar ── */}
        <div className="kam-sr-chart-sidebar">
          {/* All Methods */}
          <label className="kam-sr-method-item overall">
            <input type="checkbox" checked={selectedSeries.has('overall')} onChange={() => toggleSeries('overall')} />
            <span className="kam-sr-color-dot" style={{ background: SR_COLORS.overall }} />
            <span className="kam-sr-method-label">All</span>
            <span className="kam-sr-method-value">{overall[overall.length - 1]}%</span>
          </label>

          {/* Per-method */}
          {methodKeys.map((m) => {
            const md = byMethod[m]
            const isExpanded = expandedMethods.has(m)
            const terminalKeys = Object.keys(md.terminals)
            return (
              <div key={m}>
                <div className="kam-sr-method-item">
                  <input type="checkbox" checked={selectedSeries.has(m)} onChange={() => toggleSeries(m)} />
                  <span className="kam-sr-color-dot" style={{ background: SR_COLORS[m] || '#888' }} />
                  <span className="kam-sr-method-label">{METHOD_DISPLAY[m] || m}</span>
                  <span className="kam-sr-method-value">{md.sr[md.sr.length - 1]}%</span>
                  {terminalKeys.length > 0 && (
                    <span className={`kam-sr-method-expand${isExpanded ? ' open' : ''}`} onClick={() => toggleExpand(m)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                    </span>
                  )}
                </div>
                <div className={`kam-sr-terminal-list ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  {terminalKeys.map((tId) => {
                    const tKey = m + ':' + tId
                    const tData = md.terminals[tId]
                    return (
                      <label key={tKey} className="kam-sr-terminal-item">
                        <input type="checkbox" checked={selectedSeries.has(tKey)} onChange={() => toggleSeries(tKey)} />
                        <span className="kam-sr-color-dot" style={{ background: SR_COLORS[m] || '#888', opacity: 0.6 }} />
                        <span className="kam-sr-method-label">{tId}</span>
                        <span className="kam-sr-method-value">{tData[tData.length - 1]}%</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Chart Area ── */}
        <div className="kam-sr-chart-area">
          <svg
            ref={svgRef}
            className="kam-sr-chart-svg"
            viewBox={`0 0 ${svgWidth} ${chartH}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid lines */}
            {yTicks.map((t) => (
              <g key={t}>
                <line
                  x1={chartPadLeft} y1={toY(t)} x2={svgWidth - chartPadRight} y2={toY(t)}
                  stroke="var(--rzp-border, #E8E8E8)" strokeDasharray="4 4" strokeWidth="1"
                />
                <text x={chartPadLeft - 6} y={toY(t) + 4} textAnchor="end" fontSize="11" fill="#888" fontFamily="inherit">
                  {t}%
                </text>
              </g>
            ))}

            {/* X-axis date labels (every 5th day) */}
            {dates.map((d, i) => (i % 5 === 0 || i === dates.length - 1) ? (
              <text key={d} x={toX(i, svgWidth)} y={chartH - 4} textAnchor="middle" fontSize="10" fill="#888" fontFamily="inherit">
                {formatDate(d)}
              </text>
            ) : null)}

            {/* Area fills */}
            {visibleLines.map((line) => (
              <path
                key={'area-' + line.key}
                d={buildArea(line.data, svgWidth)}
                fill={line.color}
                opacity={0.06}
              />
            ))}

            {/* Lines */}
            {visibleLines.map((line) => (
              <polyline
                key={'line-' + line.key}
                points={buildPoints(line.data, svgWidth)}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={line.dashed ? '6 3' : 'none'}
              />
            ))}

            {/* Hover crosshair */}
            {hoverIdx !== null && (
              <line
                x1={toX(hoverIdx, svgWidth)} y1={chartPadTop}
                x2={toX(hoverIdx, svgWidth)} y2={chartH - chartPadBottom}
                stroke="#aaa" strokeDasharray="3 3" strokeWidth="1"
              />
            )}

            {/* Hover dots */}
            {hoverIdx !== null && visibleLines.map((line) => (
              <circle
                key={'dot-' + line.key}
                cx={toX(hoverIdx, svgWidth)}
                cy={toY(line.data[hoverIdx])}
                r="4"
                fill="#fff"
                stroke={line.color}
                strokeWidth="2"
              />
            ))}
          </svg>

          {/* Tooltip */}
          {hoverIdx !== null && (
            <div
              className="kam-sr-chart-tooltip"
              style={{
                left: Math.min(toX(hoverIdx, svgWidth) + 12, svgWidth - 170),
                top: 20,
              }}
            >
              <div className="kam-sr-tooltip-date">{formatDate(dates[hoverIdx])}</div>
              {visibleLines.map((line) => (
                <div key={line.key} className="kam-sr-tooltip-row">
                  <span className="kam-sr-tooltip-dot" style={{ background: line.color }} />
                  <span className="kam-sr-tooltip-label">{line.label}</span>
                  <span className="kam-sr-tooltip-value">{line.data[hoverIdx]}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SR Threshold Slider sub-component (single-handle)
// ---------------------------------------------------------------------------
const SR_MIN = 70
const SR_MAX = 100

function SRThresholdSlider({ value, onChange }) {
  const pct = ((value - SR_MIN) / (SR_MAX - SR_MIN)) * 100

  const handleChange = useCallback((e) => {
    onChange(Number(e.target.value))
  }, [onChange])

  return (
    <div className="kam-sr-range-control">
      <div className="kam-sr-range-labels">
        <div className="kam-sr-range-label">
          <span className="label">SR Threshold</span>
          <span className="value low">{value}%</span>
        </div>
      </div>

      <div className="kam-sr-range-track-wrapper">
        {/* Background track */}
        <div className="kam-sr-range-track" />
        {/* Colored zones */}
        <div className="kam-sr-range-zone danger" style={{ left: 0, width: `${pct}%` }} />
        <div className="kam-sr-range-zone eligible" style={{ left: `${pct}%`, width: `${100 - pct}%` }} />
        {/* Single range input */}
        <input
          type="range"
          min={SR_MIN}
          max={SR_MAX}
          step={1}
          value={value}
          onChange={handleChange}
          className="kam-sr-range-input low"
        />
      </div>

      <div className="kam-sr-range-scale">
        <span>{SR_MIN}%</span>
        <span>80%</span>
        <span>90%</span>
        <span>{SR_MAX}%</span>
      </div>

      <div className="kam-sr-range-legend">
        <span className="kam-sr-range-legend-item danger">
          <span className="dot" /> Below {value}% — fallback
        </span>
        <span className="kam-sr-range-legend-item eligible">
          <span className="dot" /> Above {value}% — CBR eligible
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sankey Chart sub-component (pure SVG)
// ---------------------------------------------------------------------------
const SANKEY_CHART_H = 580
const SANKEY_NODE_W = 130
const SANKEY_NODE_GAP = 5
const SANKEY_PAD_TOP = 40
const SANKEY_PAD_BOTTOM = 10

function computeSankeyLayout(data, width) {
  const availH = SANKEY_CHART_H - SANKEY_PAD_TOP - SANKEY_PAD_BOTTOM
  const colXs = [60, width / 2 - SANKEY_NODE_W / 2, width - SANKEY_NODE_W - 60]

  // Group nodes by column
  const columns = [[], [], []]
  data.nodes.forEach((n) => columns[n.column].push({ ...n }))

  // Compute node positions for each column
  columns.forEach((col, ci) => {
    const total = col.reduce((s, n) => s + n.value, 0)
    const minH = 14
    const gapSize = col.length > 8 ? 3 : SANKEY_NODE_GAP
    const gaps = Math.max(0, col.length - 1) * gapSize
    const usable = availH - gaps

    // First pass: compute ideal heights
    const heights = col.map((n) => Math.max(minH, (n.value / total) * usable))
    // If total exceeds usable, scale down proportionally
    const hTotal = heights.reduce((s, h) => s + h, 0)
    if (hTotal > usable) {
      const scale = usable / hTotal
      heights.forEach((h, i) => { heights[i] = Math.max(minH * 0.7, h * scale) })
    }

    let y = SANKEY_PAD_TOP
    col.forEach((n, i) => {
      n.x = colXs[ci]
      n.y = y
      n.h = heights[i]
      y += heights[i] + gapSize
    })
  })

  // Flatten back to a map
  const nodeMap = {}
  columns.flat().forEach((n) => { nodeMap[n.id] = n })

  // Compute link paths with stacking
  // Track how much vertical space has been used on each side of each node
  const sourceOffsets = {}
  const targetOffsets = {}

  const layoutLinks = data.links.map((l) => {
    const src = nodeMap[l.source]
    const tgt = nodeMap[l.target]
    if (!src || !tgt) return null

    const srcTotal = data.links.filter((x) => x.source === l.source).reduce((s, x) => s + x.value, 0)
    const tgtTotal = data.links.filter((x) => x.target === l.target).reduce((s, x) => s + x.value, 0)

    const linkW_src = (l.value / srcTotal) * src.h
    const linkW_tgt = (l.value / tgtTotal) * tgt.h

    if (!sourceOffsets[l.source]) sourceOffsets[l.source] = 0
    if (!targetOffsets[l.target]) targetOffsets[l.target] = 0

    const sy = src.y + sourceOffsets[l.source] + linkW_src / 2
    const ty = tgt.y + targetOffsets[l.target] + linkW_tgt / 2

    sourceOffsets[l.source] += linkW_src
    targetOffsets[l.target] += linkW_tgt

    const sx = src.x + SANKEY_NODE_W
    const tx = tgt.x

    const midX = (sx + tx) / 2

    return {
      ...l,
      path: `M${sx},${sy - linkW_src / 2} C${midX},${sy - linkW_src / 2} ${midX},${ty - linkW_tgt / 2} ${tx},${ty - linkW_tgt / 2} L${tx},${ty + linkW_tgt / 2} C${midX},${ty + linkW_tgt / 2} ${midX},${sy + linkW_src / 2} ${sx},${sy + linkW_src / 2} Z`,
      color: src.color,
    }
  }).filter(Boolean)

  return { nodeMap, layoutLinks, columns }
}

function SankeyChart({ data }) {
  const [svgWidth, setSvgWidth] = useState(700)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const containerRef = useCallback((node) => {
    if (node) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) setSvgWidth(entry.contentRect.width)
      })
      ro.observe(node)
      setSvgWidth(node.getBoundingClientRect().width)
    }
  }, [])

  const layout = useMemo(() => computeSankeyLayout(data, svgWidth), [data, svgWidth])

  const connectedLinks = useMemo(() => {
    if (!hoveredNode) return new Set()
    const ids = new Set()
    data.links.forEach((l, i) => {
      if (l.source === hoveredNode || l.target === hoveredNode) ids.add(i)
    })
    return ids
  }, [hoveredNode, data.links])

  const formatVol = (v) => {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
    if (v >= 1000) return (v / 1000).toFixed(0) + 'K'
    return String(v)
  }

  const handleNodeEnter = useCallback((node, e) => {
    setHoveredNode(node.id)
    const rect = e.currentTarget.closest('svg').getBoundingClientRect()
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name: node.name,
      value: node.value,
      pct: ((node.value / data.totalTxn) * 100).toFixed(1),
      gateway: node.gatewayShort || null,
    })
  }, [data.totalTxn])

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null)
    setTooltip(null)
  }, [])

  const colHeaders = ['Payment Method', 'Network / Sub-type', 'Terminal']

  return (
    <div className="kam-sankey-container" ref={containerRef}>
      <svg
        className="kam-sankey-svg"
        viewBox={`0 0 ${svgWidth} ${SANKEY_CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Column headers */}
        {colHeaders.map((label, i) => {
          const x = i === 0 ? 60 + SANKEY_NODE_W / 2 : i === 1 ? svgWidth / 2 : svgWidth - 60 - SANKEY_NODE_W / 2
          return (
            <text key={i} className="kam-sankey-col-header" x={x} y={20} textAnchor="middle">
              {label}
            </text>
          )
        })}

        {/* Links */}
        {layout.layoutLinks.map((l, i) => (
          <path
            key={i}
            d={l.path}
            fill={l.color}
            className="kam-sankey-link"
            opacity={hoveredNode ? (connectedLinks.has(i) ? 0.5 : 0.06) : 0.25}
          />
        ))}

        {/* Nodes */}
        {layout.columns.flat().map((node) => {
          const isActive = !hoveredNode || hoveredNode === node.id ||
            data.links.some((l) => (l.source === node.id && l.target === hoveredNode) || (l.target === node.id && l.source === hoveredNode))
          const nodeOpacity = hoveredNode ? (isActive ? 1 : 0.3) : 1

          return (
            <g
              key={node.id}
              className="kam-sankey-node"
              opacity={nodeOpacity}
              onMouseEnter={(e) => handleNodeEnter(node, e)}
              onMouseLeave={handleNodeLeave}
            >
              <rect
                x={node.x}
                y={node.y}
                width={SANKEY_NODE_W}
                height={node.h}
                rx={4}
                fill={node.color}
              />
              {node.h >= 22 && (
                <text
                  x={node.x + SANKEY_NODE_W / 2}
                  y={node.y + node.h / 2 - (node.h >= 36 ? 5 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="kam-sankey-label"
                >
                  {node.name}
                </text>
              )}
              {node.h >= 36 && (
                <text
                  x={node.x + SANKEY_NODE_W / 2}
                  y={node.y + node.h / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="kam-sankey-value"
                >
                  {formatVol(node.value)} txns
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="kam-sankey-tooltip"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
          }}
        >
          <div className="kam-sankey-tooltip-name">{tooltip.name}</div>
          {tooltip.gateway && <div className="kam-sankey-tooltip-detail">Gateway: {tooltip.gateway}</div>}
          <div className="kam-sankey-tooltip-detail">{formatVol(tooltip.value)} transactions</div>
          <div className="kam-sankey-tooltip-detail">{tooltip.pct}% of total</div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function KAMMerchantDetail() {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const {
    getMerchantById,
    gateways,
    auditLog,
    addAuditEntry,
    showToast,
    toggleSRSensitive,
    updateSRThreshold,
    addRule,
    updateRule,
    deleteRule,
    toggleRuleEnabled,
    reorderRules,
  } = useKAM()

  const merchant = getMerchantById(merchantId)

  // ---- Terminal management state ----
  const [terminalSearch, setTerminalSearch] = useState('')
  const [terminalStates, setTerminalStates] = useState({})
  const [confirmTerminal, setConfirmTerminal] = useState(null)
  const [showDealWarning, setShowDealWarning] = useState(false)
  const [expandedTerminal, setExpandedTerminal] = useState(null)

  // ---- Tab & transaction state ----
  const [activeTab, setActiveTab] = useState('overview')
  const [txnSearch, setTxnSearch] = useState('')
  const [selectedTxn, setSelectedTxn] = useState(null)

  // ---- Recommendation state ----
  const [approvedRecs, setApprovedRecs] = useState(new Set())
  const [dismissedRecs, setDismissedRecs] = useState(new Set())

  // ---- Rules tab state ----
  const [showRuleBuilder, setShowRuleBuilder] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [simForm, setSimForm] = useState({ payment_method: 'CC', card_network: 'Visa', card_type: 'credit', issuer_bank: 'HDFC', amount: 5000 })
  const [simResult, setSimResult] = useState(null)
  // Rule builder form state
  const [ruleForm, setRuleForm] = useState({ name: '', type: 'conditional', conditions: [], conditionLogic: 'AND', terminals: [], splits: [] })

  // ---- Guard ----
  if (!merchant) {
    return (
      <div className="kam-empty-state" style={{ minHeight: 400 }}>
        <ServerIcon />
        <h4>Merchant not found</h4>
        <p>The merchant you are looking for does not exist or has been removed.</p>
        <Link to="/kam/merchants" className="kam-btn kam-btn-primary" style={{ marginTop: 16 }}>
          Back to Merchants
        </Link>
      </div>
    )
  }

  // ---- Computed values ----
  const tspCompliance = useMemo(() => computeTSPCompliance(merchant), [merchant])
  const revenue = computeMerchantRevenue(merchant)
  const cbrOrder = useMemo(() => {
    if (merchant.srSensitive) return null
    return computeCBROrder(merchant)
  }, [merchant])

  // Build terminal rows from gatewayMetrics
  const terminals = useMemo(() => {
    return merchant.gatewayMetrics.map((gm) => {
      const gw = gateways.find((g) => g.id === gm.gatewayId)
      const term = gw?.terminals.find((t) => t.id === gm.terminalId)
      const terminalId = term?.terminalId || gm.terminalId
      return {
        key: gm.terminalId,
        terminalId,
        provider: gw?.name || 'Unknown',
        providerShort: gw?.shortName || '??',
        method: pickMethod(terminalId),
        successRate: gm.successRate,
        costPerTxn: gm.costPerTxn,
        txnShare: gm.txnShare,
        dailyVolume: pickDailyVolume(terminalId),
        gatewayId: gm.gatewayId,
        internalTermId: gm.terminalId,
      }
    })
  }, [merchant.gatewayMetrics, gateways])

  // Filtered terminals
  const filteredTerminals = useMemo(() => {
    if (!terminalSearch) return terminals
    const q = terminalSearch.toLowerCase()
    return terminals.filter(
      (t) =>
        t.terminalId.toLowerCase().includes(q) ||
        t.provider.toLowerCase().includes(q) ||
        t.method.toLowerCase().includes(q)
    )
  }, [terminals, terminalSearch])

  // Transaction data
  const transactions = useMemo(() => generateMerchantTransactions(merchant), [merchant])
  const srData = useMemo(() => generateSRTimeSeries(merchant), [merchant])
  const recommendations = useMemo(() => generateRecommendations(merchant), [merchant])
  const sankeyData = useMemo(() => generateSankeyData(merchant), [merchant])

  const filteredTxns = useMemo(() => {
    if (!txnSearch) return transactions
    const q = txnSearch.toLowerCase()
    return transactions.filter(
      (t) =>
        t.txnId.toLowerCase().includes(q) ||
        t.paymentMethod.type.toLowerCase().includes(q) ||
        t.paymentMethod.short.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        t.routingDecision.selectedGatewayShort.toLowerCase().includes(q)
    )
  }, [transactions, txnSearch])

  // Filtered audit log for this merchant
  const relevantLogs = useMemo(() => {
    return auditLog
      .filter((e) => e.merchantId === merchantId || !e.merchantId)
      .slice(0, 5)
  }, [auditLog, merchantId])

  // ---- Terminal toggle helpers ----
  const isTerminalActive = useCallback(
    (termKey) => {
      if (terminalStates[termKey] !== undefined) return terminalStates[termKey]
      return true // default active
    },
    [terminalStates]
  )

  const handleTerminalToggle = useCallback(
    (terminal) => {
      const currentlyActive = isTerminalActive(terminal.key)
      if (currentlyActive) {
        // About to disable -- show confirmation
        setConfirmTerminal(terminal)
      } else {
        // Re-enable directly
        setTerminalStates((prev) => ({ ...prev, [terminal.key]: true }))
        addAuditEntry(
          `Enabled terminal ${terminal.terminalId} for ${merchant.name}`,
          'Manual re-enable',
          merchantId
        )
        showToast(`Terminal ${terminal.terminalId} enabled`)
      }
    },
    [isTerminalActive, merchant.name, merchantId, addAuditEntry, showToast]
  )

  const confirmDisableTerminal = useCallback(() => {
    if (!confirmTerminal) return
    setTerminalStates((prev) => ({ ...prev, [confirmTerminal.key]: false }))
    addAuditEntry(
      `Disabled terminal ${confirmTerminal.terminalId} for ${merchant.name}`,
      `Processes ${formatLakhs(confirmTerminal.dailyVolume)} daily`,
      merchantId
    )
    showToast(`Terminal ${confirmTerminal.terminalId} disabled`, 'info')
    setConfirmTerminal(null)
  }, [confirmTerminal, merchant.name, merchantId, addAuditEntry, showToast])

  // ---- Recommendation handlers ----
  const handleApproveRec = useCallback(
    (rec) => {
      setApprovedRecs((prev) => new Set([...prev, rec.id]))

      if (rec.action === 'enable_sr_sensitive') {
        toggleSRSensitive(merchantId)
      } else {
        addAuditEntry(
          `Approved AI recommendation: ${rec.title}`,
          rec.description.length > 140 ? rec.description.substring(0, 140) + '…' : rec.description,
          merchantId
        )
        showToast(`Recommendation approved: ${rec.title}`)
      }
    },
    [merchantId, toggleSRSensitive, addAuditEntry, showToast]
  )

  const handleDismissRec = useCallback((recId) => {
    setDismissedRecs((prev) => new Set([...prev, recId]))
  }, [])

  const visibleRecs = useMemo(
    () => recommendations.filter((r) => !dismissedRecs.has(r.id)),
    [recommendations, dismissedRecs]
  )

  // ---- Status & category badge helpers ----
  const statusBadgeClass = merchant.status === 'active' ? 'success' : 'warning'
  const statusLabel = merchant.status === 'active' ? 'Active' : 'Inactive'

  return (
    <>
      {/* ── Back Link ────────────────────────────────────────────── */}
      <Link to="/kam/merchants" className="kam-detail-back">
        <ArrowLeftIcon />
        Back to Merchants
      </Link>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="kam-detail-header">
        <div>
          <div className="kam-detail-title">
            <h2>{merchant.name}</h2>
            <span className="mid">{merchant.mid}</span>
            <span className="kam-badge neutral">{merchant.category}</span>
            <span className={`kam-badge ${statusBadgeClass}`}>{statusLabel}</span>
            {merchant.dealType === 'tsp' && (
              <span className="kam-badge deal-tsp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                TSP
              </span>
            )}
            {merchant.dealType === 'offer_linked' && (
              <span className="kam-badge deal-offer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
                Offer
              </span>
            )}
            {merchant.srSensitive && (
              <span className="kam-badge-sr" style={{ padding: '2px 10px', fontSize: 11 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                SR Sensitive
              </span>
            )}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--rzp-text-secondary)', fontFamily: 'var(--font-secondary)' }}>
            {merchant.contactName} &middot; {merchant.contactEmail}
            {merchant.mcc && (
              <span style={{ marginLeft: 12, color: 'var(--rzp-text-muted)' }}>
                &middot; MCC {merchant.mcc} &middot; {merchant.mccLabel}
              </span>
            )}
          </div>
        </div>
        <div className="kam-detail-actions">
          <button
            className="kam-btn kam-btn-secondary"
            onClick={() => {
              const el = document.getElementById('doppler-section')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <RoutingIcon />
            Change Routing
          </button>
          <button
            className="kam-btn kam-btn-secondary"
            onClick={() => {
              if (merchant.dealType === 'tsp' || merchant.dealType === 'offer_linked') {
                setShowDealWarning(true)
              } else {
                const el = document.getElementById('terminal-section')
                el?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            <ServerIcon />
            Change Gateway
          </button>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="kam-detail-tabs">
        <button
          className={`kam-detail-tab${activeTab === 'overview' ? ' active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`kam-detail-tab${activeTab === 'transactions' ? ' active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions ({transactions.length})
        </button>
        <button
          className={`kam-detail-tab${activeTab === 'config' ? ' active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Config
        </button>
        <button
          className={`kam-detail-tab${activeTab === 'routing' ? ' active' : ''}`}
          onClick={() => setActiveTab('routing')}
        >
          Routing
        </button>
        <button
          className={`kam-detail-tab${activeTab === 'rules' ? ' active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Rules
        </button>
      </div>

      {activeTab === 'overview' && (
      <>
      {/* ── SR Trend Chart ──────────────────────────────────────── */}
      <SRLineChart srData={srData} />

      {/* ── Deal Constraint Banner ────────────────────────────────── */}
      {merchant.dealType === 'tsp' && merchant.dealDetails && (
        <div className="kam-deal-banner tsp">
          <div className="kam-deal-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="kam-deal-banner-content">
            <div className="kam-deal-banner-title">
              TSP Deal Active
              <span className="kam-badge deal-tsp" style={{ fontSize: 10, padding: '1px 6px' }}>Routing Locked</span>
            </div>
            <div className="kam-deal-banner-desc">{merchant.dealDetails.description}</div>
            {merchant.dealDetails.constraint && (
              <div className="kam-deal-banner-desc" style={{ fontWeight: 600, color: 'var(--rzp-text-primary)', marginBottom: 4 }}>
                Constraint: {merchant.dealDetails.constraint}
              </div>
            )}
            {tspCompliance && (
              <div style={{ margin: '8px 0 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="kam-tsp-gauge" style={{ margin: 0, maxWidth: 320 }}>
                    <div className="kam-tsp-gauge-bar">
                      <div
                        className={`kam-tsp-gauge-fill ${tspCompliance.status === 'off_track' ? 'violation' : tspCompliance.status === 'at_risk' ? 'at-risk' : ''}`}
                        style={{ width: `${tspCompliance.gmvCommitment > 0 ? Math.min((tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100, 100) : 0}%` }}
                      />
                      <div className="kam-tsp-gauge-threshold" style={{ left: '100%' }} />
                    </div>
                    <span className="kam-tsp-gauge-label">{formatINR(tspCompliance.projectedAnnualGMV)} / {formatINR(tspCompliance.gmvCommitment)} commitment</span>
                  </div>
                  <span className={`kam-badge ${tspCompliance.status === 'on_track' ? 'success' : tspCompliance.status === 'at_risk' ? 'warning' : 'danger'}`}>
                    {tspCompliance.status === 'on_track' ? 'On Track' : tspCompliance.status === 'at_risk' ? 'At Risk' : 'Off Track'}
                  </span>
                </div>
                {tspCompliance.status === 'off_track' && (
                  <div style={{ fontSize: 12, color: 'var(--rzp-danger)', fontWeight: 600, marginTop: 6 }}>
                    At current routing ({tspCompliance.actualTrafficPct}% via {tspCompliance.lockedGatewayName}), projected annual GMV is {formatINR(tspCompliance.projectedAnnualGMV)} against {formatINR(tspCompliance.gmvCommitment)} commitment. Consider increasing {tspCompliance.lockedGatewayName} traffic share to ~{tspCompliance.suggestedTrafficPct}%.
                  </div>
                )}
                {tspCompliance.status === 'at_risk' && (
                  <div style={{ fontSize: 12, color: '#E65100', fontWeight: 600, marginTop: 6 }}>
                    At current routing ({tspCompliance.actualTrafficPct}% via {tspCompliance.lockedGatewayName}), projected annual GMV is {formatINR(tspCompliance.projectedAnnualGMV)} against {formatINR(tspCompliance.gmvCommitment)} commitment. Suggest routing ~{tspCompliance.suggestedTrafficPct}% via {tspCompliance.lockedGatewayName} to meet target.
                  </div>
                )}
              </div>
            )}
            <div className="kam-deal-banner-meta">
              {merchant.dealDetails.expiresAt && (
                <span>Expires: <strong>{merchant.dealDetails.expiresAt}</strong></span>
              )}
              {merchant.dealDetails.contact && (
                <span>Contact: <a href={`mailto:${merchant.dealDetails.contact}`}>{merchant.dealDetails.contact}</a></span>
              )}
            </div>
          </div>
        </div>
      )}

      {merchant.dealType === 'offer_linked' && merchant.dealDetails && (
        <div className="kam-deal-banner offer">
          <div className="kam-deal-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <div className="kam-deal-banner-content">
            <div className="kam-deal-banner-title">
              Offer-Linked Deal
              <span className="kam-badge deal-offer" style={{ fontSize: 10, padding: '1px 6px' }}>Active</span>
            </div>
            <div className="kam-deal-banner-desc">{merchant.dealDetails.description}</div>
            {merchant.dealDetails.constraint && (
              <div className="kam-deal-banner-desc" style={{ fontWeight: 600, color: 'var(--rzp-text-primary)', marginBottom: 4 }}>
                Constraint: {merchant.dealDetails.constraint}
              </div>
            )}
            <div className="kam-deal-banner-meta">
              {merchant.dealDetails.expiresAt && (
                <span>Expires: <strong>{merchant.dealDetails.expiresAt}</strong></span>
              )}
              {merchant.dealDetails.contact && (
                <span>Contact: <a href={`mailto:${merchant.dealDetails.contact}`}>{merchant.dealDetails.contact}</a></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Metric Cards (3x2) ───────────────────────────────────── */}
      <div className="kam-detail-metrics">
        <MetricCard
          icon={<CheckCircleIcon />}
          iconBg="var(--rzp-success-light)"
          iconColor="var(--rzp-success)"
          label="Success Rate"
          value={`${merchant.avgPaymentSuccessRate}%`}
          delta={merchant.avgPaymentSuccessRate >= 95 ? '+0.3%' : null}
          deltaType={merchant.avgPaymentSuccessRate >= 95 ? 'positive' : 'negative'}
        />
        <MetricCard
          icon={<BarChartIcon />}
          iconBg="var(--rzp-blue-light)"
          iconColor="var(--rzp-blue)"
          label="Monthly Transactions"
          value={formatNumber(merchant.monthlyTxnVolume)}
          delta="+2.1%"
          deltaType="positive"
        />
        <MetricCard
          icon={<TrendUpIcon />}
          iconBg="var(--rzp-success-light)"
          iconColor="var(--rzp-success)"
          label="Net Revenue"
          value={formatINR(revenue.netRevenue)}
          delta="+1.8%"
          deltaType="positive"
        />
      </div>

      {/* ── AI Recommended Actions ────────────────────────────────── */}
      {visibleRecs.length > 0 && (
        <div className="kam-recs-section">
          <div className="kam-recs-header">
            <div className="kam-recs-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              AI Recommended Actions
              <span className="kam-recs-ai-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                AI
              </span>
            </div>
            <span className="kam-recs-subtitle">
              {visibleRecs.length} recommendation{visibleRecs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="kam-recs-list">
            {visibleRecs.map((rec) => (
              <div
                key={rec.id}
                className={`kam-rec-card ${rec.type}${approvedRecs.has(rec.id) ? ' approved' : ''}`}
              >
                <div className="kam-rec-card-header">
                  <span className={`kam-rec-badge ${rec.type}`}>
                    {rec.type === 'critical' ? 'Critical' : rec.type === 'warning' ? 'Warning' : rec.type === 'opportunity' ? 'Opportunity' : 'Info'}
                  </span>
                  <span className="kam-rec-signal">{rec.signal}</span>
                </div>
                <div className="kam-rec-title">{rec.title}</div>
                <div className="kam-rec-desc">{rec.description}</div>
                <div className="kam-rec-impact">
                  <strong>Impact: </strong>{rec.impact}
                </div>
                <div className="kam-rec-actions">
                  {approvedRecs.has(rec.id) ? (
                    <span className="kam-rec-approved-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Approved
                    </span>
                  ) : (
                    <>
                      <button
                        className="kam-rec-approve-btn"
                        onClick={() => handleApproveRec(rec)}
                      >
                        Approve
                      </button>
                      <button
                        className="kam-rec-dismiss-btn"
                        onClick={() => handleDismissRec(rec.id)}
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  CONFIG TAB                                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'config' && (
      <>
      {/* ── SR Sensitivity ───────────────────────────────────── */}
      <div className="kam-sr-card">
        <div className="kam-sr-card-header">
          <div className="kam-sr-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            SR Sensitivity
          </div>
          <label className="kam-toggle">
            <input
              type="checkbox"
              checked={merchant.srSensitive}
              onChange={() => toggleSRSensitive(merchantId)}
            />
            <span className="kam-toggle-slider" />
          </label>
        </div>
        {merchant.srSensitive ? (
          <div className="kam-sr-info-banner locked">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div>
              <strong>Routing Locked</strong> — Cost optimization is disabled for this merchant. All transactions route to the highest success rate terminal to maximize payment reliability.
            </div>
          </div>
        ) : (
          <>
            <div className="kam-sr-info-banner threshold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>Cost-Based Routing active.</strong> Terminals above the lower threshold are CBR-eligible and sorted by cost (cheapest first).
                {merchant.dealType === 'tsp' && ' TSP deal terminals receive priority within the eligible set.'}
                {' '}Terminals below threshold serve as fallback, sorted by success rate.
              </div>
            </div>
            <SRThresholdSlider
              value={merchant.srThresholdLow ?? 85}
              onChange={(val) => updateSRThreshold(merchantId, val)}
            />

            {/* ── Routing Priority Preview ──────────────────────── */}
            {cbrOrder && (
              <div className="kam-cbr-preview-card">
                <div className="kam-cbr-preview-header">
                  <div className="kam-cbr-preview-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                      <polyline points="21 16 21 21 16 21" />
                      <line x1="15" y1="15" x2="21" y2="21" />
                      <line x1="4" y1="4" x2="9" y2="9" />
                    </svg>
                    Routing Priority Preview
                  </div>
                  <span className="kam-badge neutral">
                    {cbrOrder.eligible.length + cbrOrder.fallback.length} terminals
                  </span>
                </div>

                {/* Eligible Section */}
                <div className="kam-cbr-section">
                  <div className="kam-cbr-section-label">
                    <span className="kam-cbr-section-dot eligible" />
                    CBR Eligible — SR &ge; {cbrOrder.thresholdLow}%
                    <span className="kam-badge success" style={{ marginLeft: 8, fontSize: 10, padding: '1px 6px' }}>
                      {cbrOrder.eligible.length}
                    </span>
                  </div>
                  {cbrOrder.eligible.length === 0 ? (
                    <div className="kam-cbr-empty">
                      No terminals meet the SR threshold of {cbrOrder.thresholdLow}%
                    </div>
                  ) : (
                    <div className="kam-cbr-terminal-list">
                      {cbrOrder.eligible.map((t) => (
                        <div className="kam-cbr-terminal-row" key={t.terminalId}>
                          <span className="kam-cbr-rank">#{t.rank}</span>
                          <span className="kam-cbr-terminal-id">{t.terminalId}</span>
                          <span className="kam-cbr-gateway">{t.gatewayShort}</span>
                          <span className="kam-cbr-sr">{t.successRate}%</span>
                          <span className="kam-cbr-cost">
                            {'\u20B9'}{t.costPerTxn.toFixed(2)}
                            {t.isZeroCost && <span className="kam-cbr-zero-tag">0-Cost</span>}
                          </span>
                          {t.hasGMVPriority && (
                            <span className="kam-cbr-gmv-badge">
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              GMV Priority
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fallback Section */}
                {cbrOrder.fallback.length > 0 && (
                  <div className="kam-cbr-section">
                    <div className="kam-cbr-section-label">
                      <span className="kam-cbr-section-dot fallback" />
                      Fallback — SR &lt; {cbrOrder.thresholdLow}%
                      <span className="kam-badge warning" style={{ marginLeft: 8, fontSize: 10, padding: '1px 6px' }}>
                        {cbrOrder.fallback.length}
                      </span>
                    </div>
                    <div className="kam-cbr-terminal-list">
                      {cbrOrder.fallback.map((t) => (
                        <div className="kam-cbr-terminal-row fallback" key={t.terminalId}>
                          <span className="kam-cbr-rank">#{t.rank}</span>
                          <span className="kam-cbr-terminal-id">{t.terminalId}</span>
                          <span className="kam-cbr-gateway">{t.gatewayShort}</span>
                          <span className="kam-cbr-sr">{t.successRate}%</span>
                          <span className="kam-cbr-cost">
                            {'\u20B9'}{t.costPerTxn.toFixed(2)}
                            {t.isZeroCost && <span className="kam-cbr-zero-tag">0-Cost</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── GMV Commitment Progress (TSP + non-SR-sensitive) ──── */}
      {!merchant.srSensitive && tspCompliance && (
        <div className="kam-cbr-gmv-card">
          <div className="kam-cbr-gmv-header">
            <div className="kam-cbr-gmv-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              GMV Commitment Progress
            </div>
            <span className={`kam-badge ${
              tspCompliance.status === 'on_track' ? 'success'
              : tspCompliance.status === 'at_risk' ? 'warning'
              : 'danger'
            }`}>
              {tspCompliance.status === 'on_track' ? 'On Track'
              : tspCompliance.status === 'at_risk' ? 'At Risk'
              : 'Off Track'}
            </span>
          </div>

          <div className="kam-cbr-gmv-details">
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Locked Gateway</span>
              <span className="kam-cbr-gmv-value">{tspCompliance.lockedGatewayName}</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Annual Commitment</span>
              <span className="kam-cbr-gmv-value">{formatINR(tspCompliance.gmvCommitment)}</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Projected Annual GMV</span>
              <span className="kam-cbr-gmv-value">{formatINR(tspCompliance.projectedAnnualGMV)}</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Current Traffic Share</span>
              <span className="kam-cbr-gmv-value">{tspCompliance.actualTrafficPct}%</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Required Traffic Share</span>
              <span className="kam-cbr-gmv-value">{tspCompliance.suggestedTrafficPct}%</span>
            </div>
          </div>

          <div className="kam-cbr-gmv-progress">
            <div className="kam-cbr-gmv-progress-label">
              <span>Progress</span>
              <span>{Math.min(100, Math.round((tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100))}%</span>
            </div>
            <div className="kam-cbr-gmv-progress-bar">
              <div
                className="kam-cbr-gmv-progress-fill"
                style={{
                  width: `${Math.min(100, (tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100)}%`,
                  background: tspCompliance.status === 'on_track' ? 'var(--rzp-success)'
                    : tspCompliance.status === 'at_risk' ? '#FF9800'
                    : '#E53E3E',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Terminal Management ───────────────────────────────────── */}
      <div className="kam-detail-section" id="terminal-section">
        <div className="kam-card">
          <div className="kam-card-header">
            <span className="kam-card-title">
              <ServerIcon />
              Terminal Management
            </span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rzp-text-muted)', pointerEvents: 'none', display: 'flex' }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                className="kam-search-input"
                style={{ width: 220, paddingLeft: 32 }}
                placeholder="Search terminals..."
                value={terminalSearch}
                onChange={(e) => setTerminalSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="kam-terminal-table">
              <thead>
                <tr>
                  <th>Terminal ID</th>
                  <th>Provider</th>
                  <th>Method</th>
                  <th>Current SR</th>
                  <th>Daily Volume</th>
                  <th>Txn Share</th>
                  <th>Cost/Txn</th>
                  <th>Status</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredTerminals.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--rzp-text-muted)' }}>
                      No terminals match your search.
                    </td>
                  </tr>
                ) : (
                  filteredTerminals.map((t) => {
                    const active = isTerminalActive(t.key)
                    const srOptimal = t.successRate >= 93
                    const isExpanded = expandedTerminal === t.key
                    const pricingData = getBackwardPricingBreakdown(t.internalTermId)
                    return (
                      <React.Fragment key={t.key}>
                        <tr style={{ opacity: active ? 1 : 0.5 }}>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>
                              {t.terminalId}
                            </span>
                          </td>
                          <td>{t.provider}</td>
                          <td>
                            <span className={`kam-method-badge ${t.method.toLowerCase()}`}>
                              {t.method}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{t.successRate}%</span>
                            {' '}
                            <span className={`kam-badge ${srOptimal ? 'success' : 'warning'}`} style={{ fontSize: 10 }}>
                              {srOptimal ? 'Optimal' : 'Sub-optimal'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-secondary)' }}>
                            {formatLakhs(t.dailyVolume)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="kam-progress-bar" style={{ width: 60, height: 6 }}>
                                <div
                                  className="kam-progress-fill"
                                  style={{
                                    width: `${t.txnShare}%`,
                                    background: 'var(--rzp-blue)',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--rzp-text-secondary)' }}>
                                {t.txnShare}%
                              </span>
                            </div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: 13 }}>
                            {'\u20B9'}{t.costPerTxn.toFixed(2)}
                            {isTerminalZeroCost(t.internalTermId) && (
                              <span className="kam-zero-cost-tag">0-Cost</span>
                            )}
                          </td>
                          <td>
                            <button
                              className={`kam-toggle${active ? ' active' : ''}`}
                              onClick={() => handleTerminalToggle(t)}
                              aria-label={`Toggle terminal ${t.terminalId}`}
                            />
                          </td>
                          <td>
                            {pricingData.length > 0 && (
                              <button
                                className="kam-btn kam-btn-ghost kam-btn-sm"
                                onClick={() => setExpandedTerminal(isExpanded ? null : t.key)}
                                style={{ padding: 4 }}
                                aria-label="Toggle pricing details"
                              >
                                <svg
                                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                  style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && pricingData.length > 0 && (
                          <tr className="kam-pricing-expanded-row">
                            <td colSpan={9} style={{ padding: 0 }}>
                              <div className="kam-pricing-breakdown">
                                <div className="kam-pricing-breakdown-title">Backward Pricing Schedule</div>
                                <table className="kam-pricing-table">
                                  <thead>
                                    <tr>
                                      <th>Network</th>
                                      <th>Card Type</th>
                                      <th>Amount Range</th>
                                      <th>Cost/Txn</th>
                                      <th>International</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pricingData.map((tier, i) => (
                                      <tr key={i}>
                                        <td><span className="kam-network-badge">{tier.network}</span></td>
                                        <td>{tier.cardType}</td>
                                        <td>{tier.amountRange}</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                          {tier.costPerTxn === 0
                                            ? <span className="kam-zero-cost-tag">0-Cost</span>
                                            : `\u20B9${tier.costPerTxn.toFixed(2)}`}
                                        </td>
                                        <td>{tier.isInternational ? 'Yes' : '\u2014'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Audit Log ────────────────────────────────────────────── */}
      <div className="kam-detail-section">
        <div className="kam-detail-section-header">
          <h3>
            <ClockIcon style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
            Audit Log
          </h3>
          <span className="kam-badge neutral">{relevantLogs.length} entries</span>
        </div>

        {relevantLogs.length === 0 ? (
          <div className="kam-empty-state" style={{ minHeight: 120 }}>
            <ClockIcon />
            <p>No audit entries yet for this merchant.</p>
          </div>
        ) : (
          <div className="kam-audit-timeline">
            {relevantLogs.map((entry) => (
              <div className="kam-audit-entry" key={entry.id}>
                <div className="audit-header">
                  <span className="audit-time">{entry.timestamp}</span>
                  <span className="audit-user">{entry.user}</span>
                </div>
                <div className="audit-action">{entry.action}</div>
                {entry.reason && (
                  <div className="audit-reason">{entry.reason}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {activeTab === 'transactions' && (
        <>
          <div className="kam-txn-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search by ID, payment method, status, or gateway..."
              value={txnSearch}
              onChange={(e) => setTxnSearch(e.target.value)}
            />
          </div>

          <div className="kam-card">
            <table className="kam-txn-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Timestamp</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Gateway</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxns.map((txn) => (
                  <tr key={txn.txnId} onClick={() => setSelectedTxn(txn)}>
                    <td><span className="txn-id">{txn.txnId}</span></td>
                    <td>{txn.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {txn.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                    <td style={{ fontWeight: 600 }}>{formatINR(txn.amount)}</td>
                    <td><span className="kam-badge neutral">{txn.paymentMethod.short}</span></td>
                    <td><span className={`kam-txn-status ${txn.status}`}>{txn.status}</span></td>
                    <td>{txn.routingDecision.selectedGatewayShort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="kam-txn-footer">
              Showing {filteredTxns.length} of {transactions.length} transactions
            </div>
          </div>
        </>
      )}

      {activeTab === 'routing' && (
      <>
        <div className="kam-detail-card">
          <div className="kam-card-header">
            <span className="kam-card-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Transaction Flow
            </span>
            <span className="kam-badge neutral">{formatNumber(merchant.monthlyTxnVolume)} txns/month</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--rzp-text-secondary)', fontFamily: 'var(--font-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Visualisation of how {merchant.name}&apos;s monthly transactions flow from payment methods through card networks and sub-types to individual terminals. Hover over any node to highlight its connected paths.
          </div>
          <SankeyChart data={sankeyData} />
        </div>
      </>
      )}

      {activeTab === 'rules' && (
      <RulesTabContent
        merchant={merchant}
        gateways={gateways}
        tspCompliance={tspCompliance}
        addRule={addRule}
        updateRule={updateRule}
        deleteRule={deleteRule}
        toggleRuleEnabled={toggleRuleEnabled}
        reorderRules={reorderRules}
        showToast={showToast}
        addAuditEntry={addAuditEntry}
        showRuleBuilder={showRuleBuilder}
        setShowRuleBuilder={setShowRuleBuilder}
        editingRule={editingRule}
        setEditingRule={setEditingRule}
        showSimulator={showSimulator}
        setShowSimulator={setShowSimulator}
        simForm={simForm}
        setSimForm={setSimForm}
        simResult={simResult}
        setSimResult={setSimResult}
        ruleForm={ruleForm}
        setRuleForm={setRuleForm}
      />
      )}

      {/* ── Transaction Routing Drawer ─────────────────────── */}
      {selectedTxn && (
        <>
          <div className="kam-drawer-overlay" onClick={() => setSelectedTxn(null)} />
          <div className="kam-drawer">
            <div className="kam-drawer-header">
              <h3>Routing Decision</h3>
              <button className="kam-drawer-close" onClick={() => setSelectedTxn(null)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-drawer-body">
              {/* Transaction Info */}
              <div className="kam-drawer-section">
                <div className="kam-drawer-section-title">Transaction Details</div>
                <div className="kam-drawer-info-grid">
                  <div className="kam-drawer-info-item">
                    <span className="label">Transaction ID</span>
                    <span className="value">{selectedTxn.txnId}</span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Amount</span>
                    <span className="value">{formatINR(selectedTxn.amount)}</span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Payment Method</span>
                    <span className="value">{selectedTxn.paymentMethod.type}</span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Status</span>
                    <span className="value"><span className={`kam-txn-status ${selectedTxn.status}`}>{selectedTxn.status}</span></span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Timestamp</span>
                    <span className="value">{selectedTxn.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} {selectedTxn.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                </div>
              </div>

              {/* Routing Decision */}
              <div className="kam-drawer-section">
                <div className="kam-drawer-section-title">Routing Decision</div>
                <div className={`kam-routing-explanation ${merchant.srSensitive ? 'sr-locked' : selectedTxn.routingDecision.wasDePrioritized ? 'deprioritized' : 'normal'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {merchant.srSensitive ? (
                      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
                    ) : selectedTxn.routingDecision.wasDePrioritized ? (
                      <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>
                    ) : (
                      <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                    )}
                  </svg>
                  <div>{selectedTxn.routingDecision.reason}</div>
                </div>
              </div>

              {/* Routing Pipeline */}
              <div className="kam-drawer-section">
                <div className="kam-drawer-section-title">Routing Pipeline — All Evaluated Terminals</div>
                <div className="kam-pipeline-list">
                  {selectedTxn.routingDecision.allEvaluated.map((item, i) => (
                    <div
                      key={i}
                      className={`kam-pipeline-item ${item.status === 'selected' ? 'selected' : 'rejected'}`}
                    >
                      <div className="kam-pipeline-item-header">
                        <span className="kam-pipeline-item-terminal">
                          {item.terminalId} <span style={{ fontWeight: 400, color: 'var(--rzp-text-muted)', fontSize: 12 }}>({item.gatewayShort})</span>
                        </span>
                        <span className={`kam-pipeline-item-status ${item.status === 'selected' ? 'selected' : 'rejected'}`}>
                          {item.status === 'selected' ? 'Selected' : 'Rejected'}
                        </span>
                      </div>
                      <div className="kam-pipeline-item-metrics">
                        <span>SR: <strong>{item.successRate}%</strong></span>
                        <span>Cost: <strong>{'\u20B9'}{item.costPerTxn.toFixed(2)}</strong></span>
                      </div>
                      <div className="kam-pipeline-item-reason">{item.statusReason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Terminal Confirmation Modal ───────────────────────────── */}
      {confirmTerminal && (
        <div className="kam-modal-overlay" onClick={() => setConfirmTerminal(null)}>
          <div className="kam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kam-modal-header">
              <div>
                <h3>Disable Terminal</h3>
                <p>This action will remove the terminal from active routing.</p>
              </div>
              <button className="kam-modal-close" onClick={() => setConfirmTerminal(null)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-modal-body">
              <div className="kam-confirm-icon warning">
                <WarningIcon />
              </div>
              <p style={{ fontSize: 14, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-primary)', lineHeight: 1.6 }}>
                Are you sure you want to disable{' '}
                <strong>{confirmTerminal.terminalId}</strong>?
              </p>
              <p style={{ fontSize: 14, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.6, marginTop: 8 }}>
                This terminal currently processes{' '}
                <strong style={{ color: 'var(--rzp-warning)' }}>
                  {formatLakhs(confirmTerminal.dailyVolume)}
                </strong>{' '}
                in daily volume. Disabling it will redistribute traffic to the remaining active
                terminals.
              </p>
            </div>
            <div className="kam-modal-footer">
              <button className="kam-btn kam-btn-secondary" onClick={() => setConfirmTerminal(null)}>
                Cancel
              </button>
              <button className="kam-btn kam-btn-danger" onClick={confirmDisableTerminal}>
                Confirm Disable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deal Warning Modal ─────────────────────────────────────── */}
      {showDealWarning && (
        <div className="kam-modal-overlay" onClick={() => setShowDealWarning(false)}>
          <div className="kam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="kam-modal-header">
              <div>
                <h3>Gateway Change Warning</h3>
                <p>{merchant.name}</p>
              </div>
              <button className="kam-modal-close" onClick={() => setShowDealWarning(false)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-modal-body">
              <div className="kam-warning-box" style={{ marginBottom: 16 }}>
                <WarningIcon />
                <span>
                  This merchant has an active <strong>{merchant.dealType === 'tsp' ? 'TSP deal' : 'offer-linked deal'}</strong>.
                  Changing the primary gateway may void negotiated rates or break offer routing constraints.
                </span>
              </div>
              {merchant.dealDetails?.constraint && (
                <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                  <strong>Current constraint:</strong> {merchant.dealDetails.constraint}
                </p>
              )}
              {merchant.dealDetails?.contact && (
                <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5 }}>
                  Please contact <a href={`mailto:${merchant.dealDetails.contact}`} style={{ color: 'var(--rzp-blue)' }}>{merchant.dealDetails.contact}</a> before making changes.
                </p>
              )}
            </div>
            <div className="kam-modal-footer">
              <button className="kam-btn kam-btn-secondary" onClick={() => setShowDealWarning(false)}>
                Cancel
              </button>
              <button
                className="kam-btn kam-btn-danger"
                onClick={() => {
                  setShowDealWarning(false)
                  const el = document.getElementById('terminal-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// MetricCard sub-component
// ---------------------------------------------------------------------------
function MetricCard({ icon, iconBg, iconColor, label, value, delta, deltaType }) {
  return (
    <div className="kam-metric-card">
      <div className="metric-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {delta && (
        <div className={`metric-delta ${deltaType}`}>
          {deltaType === 'positive' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          {delta}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rules Tab Content
// ---------------------------------------------------------------------------
function RulesTabContent({
  merchant, gateways, tspCompliance,
  addRule, updateRule, deleteRule, toggleRuleEnabled, reorderRules,
  showToast, addAuditEntry,
  showRuleBuilder, setShowRuleBuilder,
  editingRule, setEditingRule,
  showSimulator, setShowSimulator,
  simForm, setSimForm, simResult, setSimResult,
  ruleForm, setRuleForm,
}) {
  const rules = merchant.routingRulesV2 || []
  const ntfGaps = useMemo(() => detectNTFGaps(rules, merchant), [rules, merchant])

  // Sort rules by priority
  const sortedRules = useMemo(() => {
    return [...rules].sort((a, b) => a.priority - b.priority)
  }, [rules])

  const nonDefaultRules = sortedRules.filter(r => !r.isDefault)
  const defaultRule = sortedRules.find(r => r.isDefault)

  // Build available terminals from merchant's gateway metrics
  const availableTerminals = useMemo(() => {
    return merchant.gatewayMetrics.map(gm => {
      const info = getTerminalGatewayInfo(gm.terminalId)
      return {
        terminalId: gm.terminalId,
        displayId: info?.displayId || gm.terminalId,
        gatewayShort: info?.gatewayShort || '??',
        successRate: gm.successRate,
        costPerTxn: gm.costPerTxn,
        supportedMethods: gm.supportedMethods || [],
      }
    })
  }, [merchant])

  // ── Handlers ──

  const handleOpenBuilder = useCallback((rule = null) => {
    if (rule) {
      setEditingRule(rule)
      setRuleForm({
        name: rule.name,
        type: rule.type,
        conditions: rule.conditions.map(c => ({ ...c })),
        conditionLogic: rule.conditionLogic,
        terminals: rule.action.type === 'route' ? [...rule.action.terminals] : [],
        splits: rule.action.type === 'split' ? rule.action.splits.map(s => ({ ...s })) : [],
      })
    } else {
      setEditingRule(null)
      setRuleForm({ name: '', type: 'conditional', conditions: [], conditionLogic: 'AND', terminals: [], splits: [] })
    }
    setShowRuleBuilder(true)
  }, [setEditingRule, setRuleForm, setShowRuleBuilder])

  const handleSaveRule = useCallback(() => {
    if (!ruleForm.name.trim()) {
      showToast('Rule name is required', 'error')
      return
    }
    const actionTerminals = ruleForm.type === 'conditional' ? ruleForm.terminals : []
    const actionSplits = ruleForm.type === 'volume_split' ? ruleForm.splits : []

    if (ruleForm.type === 'conditional' && actionTerminals.length === 0) {
      showToast('Select at least one target terminal', 'error')
      return
    }
    if (ruleForm.type === 'volume_split') {
      if (actionSplits.length === 0) {
        showToast('Add at least one terminal split', 'error')
        return
      }
      const totalPct = actionSplits.reduce((s, sp) => s + sp.percentage, 0)
      if (totalPct !== 100) {
        showToast(`Split percentages must total 100% (currently ${totalPct}%)`, 'error')
        return
      }
    }

    const ruleObj = {
      id: editingRule ? editingRule.id : `rule-${merchant.id}-${Date.now()}`,
      name: ruleForm.name.trim(),
      type: ruleForm.type,
      enabled: editingRule ? editingRule.enabled : true,
      priority: editingRule ? editingRule.priority : 0,
      conditions: ruleForm.conditions,
      conditionLogic: ruleForm.conditionLogic,
      action: {
        type: ruleForm.type === 'volume_split' ? 'split' : 'route',
        terminals: actionTerminals,
        splits: actionSplits,
      },
      isDefault: false,
      createdAt: editingRule ? editingRule.createdAt : new Date().toISOString(),
      createdBy: editingRule ? editingRule.createdBy : 'anugrah.sharma@razorpay.com',
    }

    if (editingRule) {
      updateRule(merchant.id, editingRule.id, ruleObj)
    } else {
      addRule(merchant.id, ruleObj)
    }
    setShowRuleBuilder(false)
    setEditingRule(null)
  }, [ruleForm, editingRule, merchant.id, addRule, updateRule, showToast, setShowRuleBuilder, setEditingRule])

  const handleMoveRule = useCallback((ruleId, direction) => {
    const idx = nonDefaultRules.findIndex(r => r.id === ruleId)
    if (idx < 0) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === nonDefaultRules.length - 1) return
    const newOrder = [...nonDefaultRules]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]
    const orderedIds = [...newOrder.map(r => r.id), defaultRule?.id].filter(Boolean)
    reorderRules(merchant.id, orderedIds)
  }, [nonDefaultRules, defaultRule, merchant.id, reorderRules])

  const handleSimulate = useCallback(() => {
    const result = simulateTransaction(rules, simForm, merchant)
    setSimResult(result)
  }, [rules, simForm, merchant, setSimResult])

  const handleApplySuggestedSplit = useCallback(() => {
    if (!tspCompliance) return
    const lockedGwId = merchant.dealDetails?.lockedGatewayId
    const lockedTerminals = merchant.gatewayMetrics.filter(gm => gm.gatewayId === lockedGwId)
    const otherTerminals = merchant.gatewayMetrics.filter(gm => gm.gatewayId !== lockedGwId)
    if (lockedTerminals.length === 0) {
      showToast('No terminal found for the locked gateway', 'error')
      return
    }
    const suggestedPct = Math.min(100, Math.ceil(tspCompliance.suggestedTrafficPct))
    const remainingPct = 100 - suggestedPct
    const splits = [
      { terminalId: lockedTerminals[0].terminalId, percentage: suggestedPct },
    ]
    if (otherTerminals.length > 0 && remainingPct > 0) {
      const perOther = Math.floor(remainingPct / otherTerminals.length)
      let remainder = remainingPct - (perOther * otherTerminals.length)
      otherTerminals.forEach((t, i) => {
        splits.push({ terminalId: t.terminalId, percentage: perOther + (i === 0 ? remainder : 0) })
      })
    }
    const splitRule = {
      id: `rule-${merchant.id}-tsp-${Date.now()}`,
      name: `${tspCompliance.lockedGatewayName} Volume Commitment`,
      type: 'volume_split',
      enabled: true,
      priority: 0,
      conditions: [],
      conditionLogic: 'AND',
      action: { type: 'split', terminals: [], splits },
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: 'anugrah.sharma@razorpay.com',
    }
    addRule(merchant.id, splitRule)
  }, [merchant, tspCompliance, addRule, showToast])

  // Condition row helpers
  const addCondition = useCallback(() => {
    setRuleForm(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'payment_method', operator: 'equals', value: 'CC' }],
    }))
  }, [setRuleForm])

  const removeCondition = useCallback((idx) => {
    setRuleForm(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== idx),
    }))
  }, [setRuleForm])

  const updateCondition = useCallback((idx, updates) => {
    setRuleForm(prev => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => i === idx ? { ...c, ...updates } : c),
    }))
  }, [setRuleForm])

  // Terminal selection helpers
  const toggleTerminal = useCallback((terminalId) => {
    setRuleForm(prev => {
      const has = prev.terminals.includes(terminalId)
      return { ...prev, terminals: has ? prev.terminals.filter(t => t !== terminalId) : [...prev.terminals, terminalId] }
    })
  }, [setRuleForm])

  const addSplit = useCallback((terminalId) => {
    setRuleForm(prev => {
      if (prev.splits.some(s => s.terminalId === terminalId)) return prev
      return { ...prev, splits: [...prev.splits, { terminalId, percentage: 0 }] }
    })
  }, [setRuleForm])

  const removeSplit = useCallback((terminalId) => {
    setRuleForm(prev => ({
      ...prev,
      splits: prev.splits.filter(s => s.terminalId !== terminalId),
    }))
  }, [setRuleForm])

  const updateSplitPct = useCallback((terminalId, pct) => {
    setRuleForm(prev => ({
      ...prev,
      splits: prev.splits.map(s => s.terminalId === terminalId ? { ...s, percentage: Number(pct) || 0 } : s),
    }))
  }, [setRuleForm])

  // ── Offer rule helper ──
  const hasOfferRule = useMemo(() => {
    if (merchant.dealType !== 'offer_linked') return false
    const lockedGwId = merchant.dealDetails?.lockedGatewayId
    return rules.some(r =>
      r.enabled && !r.isDefault &&
      r.action.terminals?.some(tid => {
        const info = getTerminalGatewayInfo(tid)
        return info?.gatewayId === lockedGwId
      })
    )
  }, [merchant, rules])

  const handleCreateOfferRule = useCallback(() => {
    const lockedGwId = merchant.dealDetails?.lockedGatewayId
    const lockedTerminals = merchant.gatewayMetrics.filter(gm => gm.gatewayId === lockedGwId)
    if (lockedTerminals.length === 0) {
      showToast('Locked gateway terminal not available for this merchant', 'error')
      return
    }
    const gwName = gatewayData.find(g => g.id === lockedGwId)?.shortName || 'Gateway'
    const offerRule = {
      id: `rule-${merchant.id}-offer-${Date.now()}`,
      name: `CC → ${gwName} (Offer)`,
      type: 'conditional',
      enabled: true,
      priority: 0,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'CC' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: [lockedTerminals[0].terminalId], splits: [] },
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: 'anugrah.sharma@razorpay.com',
    }
    addRule(merchant.id, offerRule)
  }, [merchant, addRule, showToast])

  return (
    <>
      {/* ── NTF Guard Banner ─────────────────────────── */}
      {ntfGaps.hasGaps && (
        <div className="kam-rules-ntf-banner">
          <div className="kam-rules-ntf-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <strong>NTF Risk Detected</strong>
            <span className="kam-badge danger">{ntfGaps.gaps.length} gap{ntfGaps.gaps.length !== 1 ? 's' : ''}</span>
          </div>
          <p>The current rule set has coverage gaps that could cause payment failures:</p>
          <ul className="kam-rules-ntf-list">
            {ntfGaps.gaps.map((gap, i) => (
              <li key={i}>
                {gap.method && <span className="kam-badge neutral" style={{ marginRight: 6 }}>{gap.method}</span>}
                {gap.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── GMV Commitment Card (TSP only) ────────────── */}
      {merchant.dealType === 'tsp' && tspCompliance && (
        <div className="kam-rules-commitment-card">
          <div className="kam-card-header">
            <span className="kam-card-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              GMV Commitment — {tspCompliance.lockedGatewayName}
            </span>
            <span className={`kam-badge ${tspCompliance.status === 'on_track' ? 'success' : tspCompliance.status === 'at_risk' ? 'warning' : 'danger'}`}>
              {tspCompliance.status === 'on_track' ? 'On Track' : tspCompliance.status === 'at_risk' ? 'At Risk' : 'Off Track'}
            </span>
          </div>
          <div className="kam-rules-commitment-body">
            <div className="kam-rules-commitment-metrics">
              <div className="kam-rules-commitment-metric">
                <span className="label">Annual Target</span>
                <span className="value">{formatINR(tspCompliance.gmvCommitment)}</span>
              </div>
              <div className="kam-rules-commitment-metric">
                <span className="label">Projected Annual</span>
                <span className="value">{formatINR(tspCompliance.projectedAnnualGMV)}</span>
              </div>
              <div className="kam-rules-commitment-metric">
                <span className="label">Current Traffic</span>
                <span className="value">{tspCompliance.actualTrafficPct}%</span>
              </div>
              <div className="kam-rules-commitment-metric">
                <span className="label">Suggested Traffic</span>
                <span className="value" style={{ color: 'var(--rzp-blue)' }}>{tspCompliance.suggestedTrafficPct}%</span>
              </div>
            </div>
            <div className="kam-rules-commitment-progress">
              <div className="kam-rules-progress-bar">
                <div
                  className={`kam-rules-progress-fill ${tspCompliance.status}`}
                  style={{ width: `${Math.min(100, (tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100)}%` }}
                />
              </div>
              <span className="kam-rules-progress-label">
                {((tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100).toFixed(0)}% of target
              </span>
            </div>
            {tspCompliance.status !== 'on_track' && (
              <button className="kam-btn kam-btn-primary" style={{ marginTop: 12, fontSize: 13 }} onClick={handleApplySuggestedSplit}>
                Apply Suggested Split ({tspCompliance.suggestedTrafficPct}% → {tspCompliance.lockedGatewayName})
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Offer Routing Card (offer-linked only) ─────── */}
      {merchant.dealType === 'offer_linked' && merchant.dealDetails && (
        <div className="kam-rules-offer-card">
          <div className="kam-card-header">
            <span className="kam-card-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
              Offer Routing
            </span>
            <span className={`kam-badge ${hasOfferRule ? 'success' : 'warning'}`}>
              {hasOfferRule ? 'Rule Active' : 'Rule Missing'}
            </span>
          </div>
          <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
            {merchant.dealDetails.description}
          </p>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-primary)', marginBottom: 12 }}>
            <span><strong>Constraint:</strong> {merchant.dealDetails.constraint}</span>
            <span><strong>Expires:</strong> {merchant.dealDetails.expiresAt}</span>
          </div>
          {!hasOfferRule && (
            <button className="kam-btn kam-btn-primary" style={{ fontSize: 13 }} onClick={handleCreateOfferRule}>
              Create Offer Rule
            </button>
          )}
        </div>
      )}

      {/* ── Rule List ──────────────────────────────────── */}
      <div className="kam-detail-card">
        <div className="kam-card-header">
          <span className="kam-card-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Routing Rules
          </span>
          <button className="kam-btn kam-btn-primary kam-rules-add-btn" onClick={() => handleOpenBuilder()}>
            + Add Rule
          </button>
        </div>
        <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
          Rules are evaluated in priority order. First matching rule wins. The default fallback rule catches unmatched transactions.
        </p>

        <div className="kam-rules-list">
          {nonDefaultRules.map((rule, idx) => (
            <div key={rule.id} className={`kam-rule-card ${rule.type === 'volume_split' ? 'volume-split' : 'conditional'}${!rule.enabled ? ' disabled' : ''}`}>
              <div className="kam-rule-card-header">
                <div className="kam-rule-left">
                  <span className="kam-rule-priority">#{idx + 1}</span>
                  <span className="kam-rule-name">{rule.name}</span>
                  <span className={`kam-badge ${rule.type === 'volume_split' ? 'deal-tsp' : 'info'}`} style={{ fontSize: 11 }}>
                    {rule.type === 'volume_split' ? 'Volume Split' : 'Conditional'}
                  </span>
                </div>
                <div className="kam-rule-actions">
                  <button className="kam-rule-move-btn" title="Move up" disabled={idx === 0} onClick={() => handleMoveRule(rule.id, 'up')}>↑</button>
                  <button className="kam-rule-move-btn" title="Move down" disabled={idx === nonDefaultRules.length - 1} onClick={() => handleMoveRule(rule.id, 'down')}>↓</button>
                  <label className="kam-rule-toggle">
                    <input type="checkbox" checked={rule.enabled} onChange={() => toggleRuleEnabled(merchant.id, rule.id)} />
                    <span className="kam-rule-toggle-slider" />
                  </label>
                  <button className="kam-rule-edit-btn" title="Edit" onClick={() => handleOpenBuilder(rule)}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button className="kam-rule-delete-btn" title="Delete" onClick={() => deleteRule(merchant.id, rule.id)}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              </div>

              {/* Conditions */}
              {rule.conditions.length > 0 && (
                <div className="kam-rule-conditions">
                  <span className="kam-rule-if">IF</span>
                  {rule.conditions.map((c, ci) => (
                    <React.Fragment key={ci}>
                      {ci > 0 && <span className="kam-rule-logic">{rule.conditionLogic}</span>}
                      <span className="kam-rule-condition-chip">
                        {RULE_CONDITIONS[c.field]?.label || c.field} {RULE_OPERATOR_LABELS[c.operator] || c.operator} {
                          Array.isArray(c.value)
                            ? `${c.value[0]}–${c.value[1]}`
                            : c.field === 'amount' ? `₹${Number(c.value).toLocaleString('en-IN')}` : c.value
                        }
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Action */}
              <div className="kam-rule-action">
                {rule.action.type === 'route' ? (
                  <>
                    <span className="kam-rule-then">THEN Route to:</span>
                    {rule.action.terminals.map((tid, i) => {
                      const info = getTerminalGatewayInfo(tid)
                      return (
                        <React.Fragment key={tid}>
                          {i > 0 && <span className="kam-rule-arrow">→</span>}
                          <span className="kam-rule-terminal-chip">{info?.displayId || tid} <span className="muted">({info?.gatewayShort || '??'})</span></span>
                        </React.Fragment>
                      )
                    })}
                  </>
                ) : (
                  <>
                    <span className="kam-rule-then">THEN Split:</span>
                    {rule.action.splits.map((s, i) => {
                      const info = getTerminalGatewayInfo(s.terminalId)
                      return (
                        <React.Fragment key={s.terminalId}>
                          {i > 0 && <span className="kam-rule-split-dot">·</span>}
                          <span className="kam-rule-terminal-chip">{info?.displayId || s.terminalId} ({s.percentage}%)</span>
                        </React.Fragment>
                      )
                    })}
                  </>
                )}
              </div>

              {/* Meta */}
              <div className="kam-rule-meta">
                Created {new Date(rule.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} by {rule.createdBy.split('@')[0]}
              </div>
            </div>
          ))}

          {/* Default Rule (read-only) */}
          {defaultRule && (
            <div className="kam-rule-card kam-rule-default">
              <div className="kam-rule-card-header">
                <div className="kam-rule-left">
                  <span className="kam-rule-priority" style={{ background: 'var(--rzp-bg-secondary)', color: 'var(--rzp-text-muted)' }}>∞</span>
                  <span className="kam-rule-name">{defaultRule.name}</span>
                  <span className="kam-badge neutral" style={{ fontSize: 11 }}>Default Fallback</span>
                </div>
              </div>
              <div className="kam-rule-action">
                <span className="kam-rule-then">Fallback:</span>
                {defaultRule.action.terminals.map((tid, i) => {
                  const info = getTerminalGatewayInfo(tid)
                  return (
                    <React.Fragment key={tid}>
                      {i > 0 && <span className="kam-rule-arrow">→</span>}
                      <span className="kam-rule-terminal-chip">{info?.displayId || tid} <span className="muted">({info?.gatewayShort || '??'})</span></span>
                    </React.Fragment>
                  )
                })}
              </div>
              <div className="kam-rule-meta">
                Strategy: {merchant.routingStrategy === 'cost_based' ? 'Cost-optimised' : 'SR-optimised'} · Cannot be deleted
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Transaction Simulator (collapsible) ──────── */}
      <div className="kam-detail-card kam-rules-simulator">
        <div className="kam-card-header" onClick={() => setShowSimulator(!showSimulator)} style={{ cursor: 'pointer' }}>
          <span className="kam-card-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Transaction Simulator
          </span>
          <span style={{ fontSize: 20, color: 'var(--rzp-text-muted)', transition: 'transform 0.2s', transform: showSimulator ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
        </div>
        {showSimulator && (
          <>
            <div className="kam-rules-sim-form">
              <div className="kam-rules-sim-field">
                <label>Payment Method</label>
                <select value={simForm.payment_method} onChange={e => setSimForm(p => ({ ...p, payment_method: e.target.value }))}>
                  {RULE_CONDITIONS.payment_method.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="kam-rules-sim-field">
                <label>Card Network</label>
                <select value={simForm.card_network} onChange={e => setSimForm(p => ({ ...p, card_network: e.target.value }))}>
                  {RULE_CONDITIONS.card_network.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="kam-rules-sim-field">
                <label>Amount (₹)</label>
                <input type="number" value={simForm.amount} onChange={e => setSimForm(p => ({ ...p, amount: Number(e.target.value) || 0 }))} />
              </div>
              <div className="kam-rules-sim-field">
                <label>Issuer Bank</label>
                <select value={simForm.issuer_bank} onChange={e => setSimForm(p => ({ ...p, issuer_bank: e.target.value }))}>
                  {RULE_CONDITIONS.issuer_bank.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <button className="kam-btn kam-btn-primary" onClick={handleSimulate} style={{ alignSelf: 'flex-end' }}>Simulate</button>
            </div>
            {simResult && (
              <div className="kam-rules-sim-result">
                {simResult.matchedRule ? (
                  <>
                    <div className="kam-rules-sim-match">
                      <span className="kam-rules-sim-label">Matched Rule:</span>
                      <span className="kam-rules-sim-value">{simResult.matchedRule.name}</span>
                      <span className={`kam-badge ${simResult.matchedRule.isDefault ? 'neutral' : 'info'}`} style={{ fontSize: 11 }}>
                        {simResult.matchedRule.isDefault ? 'Default' : `#${simResult.matchedRule.priority}`}
                      </span>
                    </div>
                    <div className="kam-rules-sim-terminals">
                      <span className="kam-rules-sim-label">Terminal Route:</span>
                      {simResult.terminals.map((t, i) => (
                        <span key={t.terminalId} className="kam-rule-terminal-chip">
                          {t.displayId} ({t.gatewayShort}) — SR {t.successRate}%, ₹{t.costPerTxn.toFixed(2)}
                          {t.percentage != null && ` · ${t.percentage}%`}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="kam-rules-sim-no-match">
                    <WarningIcon /> No rule matched — transaction would fail (NTF)
                  </div>
                )}
                {simResult.warnings.length > 0 && (
                  <div className="kam-rules-sim-warnings">
                    {simResult.warnings.map((w, i) => (
                      <div key={i} className="kam-rules-sim-warning">⚠ {w}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Rule Builder Modal ───────────────────────── */}
      {showRuleBuilder && (
        <div className="kam-modal-overlay" onClick={() => setShowRuleBuilder(false)}>
          <div className="kam-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="kam-modal-header">
              <div>
                <h3>{editingRule ? 'Edit Rule' : 'Add Rule'}</h3>
                <p>{merchant.name}</p>
              </div>
              <button className="kam-modal-close" onClick={() => setShowRuleBuilder(false)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-modal-body" style={{ maxHeight: 'calc(80vh - 160px)', overflowY: 'auto' }}>
              {/* Rule Name */}
              <div className="kam-rule-builder-field">
                <label>Rule Name</label>
                <input type="text" value={ruleForm.name} onChange={e => setRuleForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Visa CC High Value → HDFC" />
              </div>

              {/* Rule Type */}
              <div className="kam-rule-builder-field">
                <label>Rule Type</label>
                <div className="kam-rule-builder-type-cards">
                  <div
                    className={`kam-rule-type-card${ruleForm.type === 'conditional' ? ' selected' : ''}`}
                    onClick={() => setRuleForm(p => ({ ...p, type: 'conditional' }))}
                  >
                    <strong>Conditional</strong>
                    <span>If-then routing based on payment attributes</span>
                  </div>
                  <div
                    className={`kam-rule-type-card${ruleForm.type === 'volume_split' ? ' selected' : ''}`}
                    onClick={() => setRuleForm(p => ({ ...p, type: 'volume_split' }))}
                  >
                    <strong>Volume Split</strong>
                    <span>Distribute traffic by percentage</span>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="kam-rule-builder-field">
                <label>
                  Conditions
                  {ruleForm.type === 'volume_split' && <span style={{ fontWeight: 400, color: 'var(--rzp-text-muted)' }}> (optional for volume splits)</span>}
                </label>
                {ruleForm.conditions.length > 1 && (
                  <div className="kam-rule-builder-logic-toggle">
                    <button className={ruleForm.conditionLogic === 'AND' ? 'active' : ''} onClick={() => setRuleForm(p => ({ ...p, conditionLogic: 'AND' }))}>AND</button>
                    <button className={ruleForm.conditionLogic === 'OR' ? 'active' : ''} onClick={() => setRuleForm(p => ({ ...p, conditionLogic: 'OR' }))}>OR</button>
                  </div>
                )}
                <div className="kam-rule-builder-conditions">
                  {ruleForm.conditions.map((cond, ci) => (
                    <div key={ci} className="kam-rule-builder-condition-row">
                      <select value={cond.field} onChange={e => {
                        const newField = e.target.value
                        const config = RULE_CONDITIONS[newField]
                        updateCondition(ci, {
                          field: newField,
                          operator: config.operators[0],
                          value: config.type === 'number' ? 0 : config.options[0],
                        })
                      }}>
                        {Object.entries(RULE_CONDITIONS).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                      <select value={cond.operator} onChange={e => updateCondition(ci, { operator: e.target.value })}>
                        {(RULE_CONDITIONS[cond.field]?.operators || ['equals']).map(op => (
                          <option key={op} value={op}>{RULE_OPERATOR_LABELS[op] || op}</option>
                        ))}
                      </select>
                      {RULE_CONDITIONS[cond.field]?.type === 'select' ? (
                        <select value={cond.value} onChange={e => updateCondition(ci, { value: e.target.value })}>
                          {(RULE_CONDITIONS[cond.field]?.options || []).map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input type="number" value={cond.value} onChange={e => updateCondition(ci, { value: Number(e.target.value) || 0 })} placeholder="Amount" />
                      )}
                      <button className="kam-rule-builder-remove-btn" onClick={() => removeCondition(ci)}>×</button>
                    </div>
                  ))}
                  <button className="kam-btn kam-btn-secondary" style={{ fontSize: 12, padding: '4px 12px' }} onClick={addCondition}>+ Add Condition</button>
                </div>
              </div>

              {/* Action: Terminal Selection */}
              <div className="kam-rule-builder-field">
                <label>{ruleForm.type === 'conditional' ? 'Route to Terminals (priority order)' : 'Split Percentages'}</label>
                {ruleForm.type === 'conditional' ? (
                  <div className="kam-rule-builder-terminals">
                    {availableTerminals.map(t => (
                      <div
                        key={t.terminalId}
                        className={`kam-rule-terminal-option${ruleForm.terminals.includes(t.terminalId) ? ' selected' : ''}`}
                        onClick={() => toggleTerminal(t.terminalId)}
                      >
                        <span className="kam-rule-terminal-check">{ruleForm.terminals.includes(t.terminalId) ? '✓' : ''}</span>
                        <span className="kam-rule-terminal-id">{t.displayId}</span>
                        <span className="kam-rule-terminal-gw">{t.gatewayShort}</span>
                        <span className="kam-rule-terminal-sr">SR {t.successRate}%</span>
                        <span className="kam-rule-terminal-cost">₹{t.costPerTxn.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="kam-rule-builder-splits">
                    {ruleForm.splits.map(s => {
                      const t = availableTerminals.find(at => at.terminalId === s.terminalId)
                      return (
                        <div key={s.terminalId} className="kam-rule-split-row">
                          <span className="kam-rule-terminal-id">{t?.displayId || s.terminalId}</span>
                          <span className="kam-rule-terminal-gw">{t?.gatewayShort || '??'}</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={s.percentage}
                            onChange={e => updateSplitPct(s.terminalId, e.target.value)}
                            className="kam-rule-split-input"
                          />
                          <span>%</span>
                          <button className="kam-rule-builder-remove-btn" onClick={() => removeSplit(s.terminalId)}>×</button>
                        </div>
                      )
                    })}
                    <div className="kam-rule-split-total">
                      Total: {ruleForm.splits.reduce((s, sp) => s + sp.percentage, 0)}%
                      {ruleForm.splits.reduce((s, sp) => s + sp.percentage, 0) !== 100 && (
                        <span style={{ color: 'var(--rzp-danger)', marginLeft: 8 }}>Must equal 100%</span>
                      )}
                    </div>
                    <div className="kam-rule-builder-add-split">
                      {availableTerminals
                        .filter(t => !ruleForm.splits.some(s => s.terminalId === t.terminalId))
                        .map(t => (
                          <button key={t.terminalId} className="kam-btn kam-btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => addSplit(t.terminalId)}>
                            + {t.displayId}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="kam-modal-footer">
              <button className="kam-btn kam-btn-secondary" onClick={() => setShowRuleBuilder(false)}>Cancel</button>
              <button className="kam-btn kam-btn-primary" onClick={handleSaveRule}>
                {editingRule ? 'Update Rule' : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
