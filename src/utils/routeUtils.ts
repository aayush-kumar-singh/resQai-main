/**
 * routeUtils.ts
 * Utility functions for safe route calculation (A* algorithm) and geo-distance checks.
 */
import type { Coordinates, PriorityLabel, Report } from '../types/report'

// ─── Haversine Distance ────────────────────────────────────────────────────
/**
 * Returns straight-line distance in metres between two lat/lng points.
 */
export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6_371_000 // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ─── Severity Weight ─────────────────────────────────────────────────────
const INFINITY_COST = 1e9

/**
 * Returns the traversal cost for a grid cell based on report severity.
 * Critical → blocked (∞), High → very high, Medium → moderate, Low → normal.
 */
export const getSeverityWeight = (severity: PriorityLabel): number => {
  switch (severity) {
    case 'Critical':
      return INFINITY_COST // blocked
    case 'High':
      return 80
    case 'Medium':
      return 20
    case 'Low':
    default:
      return 1
  }
}

// ─── Grid-based A* Safe Route ─────────────────────────────────────────────
const GRID_RESOLUTION = 60 // number of cells per dimension
const DANGER_RADIUS_M = 1_500 // metres — radius for each incident zone

interface GridNode {
  row: number
  col: number
  g: number // cost from start
  h: number // heuristic (Euclidean on grid)
  f: number // g + h
  parent: GridNode | null
}

/**
 * Build a 2D cost grid where each cell's base cost is determined by the
 * closest report inside its danger radius.
 */
function buildCostGrid(
  reports: Report[],
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  rows: number,
  cols: number,
): number[][] {
  const grid: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(1),
  )

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lat = minLat + (r / (rows - 1)) * (maxLat - minLat)
      const lng = minLng + (c / (cols - 1)) * (maxLng - minLng)

      let maxCost = 1
      for (const report of reports) {
        const dist = haversineDistance(lat, lng, report.coords.lat, report.coords.lng)
        if (dist <= DANGER_RADIUS_M) {
          const cost = getSeverityWeight(report.severity)
          if (cost > maxCost) maxCost = cost
        }
      }
      grid[r][c] = maxCost
    }
  }
  return grid
}

/** Map grid [row, col] → [lat, lng] */
function cellToCoords(
  row: number,
  col: number,
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  rows: number,
  cols: number,
): Coordinates {
  return {
    lat: minLat + (row / (rows - 1)) * (maxLat - minLat),
    lng: minLng + (col / (cols - 1)) * (maxLng - minLng),
  }
}

/** Map lat/lng → nearest grid [row, col] */
function coordsToCell(
  lat: number,
  lng: number,
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  rows: number,
  cols: number,
): { row: number; col: number } {
  const row = Math.round(((lat - minLat) / (maxLat - minLat)) * (rows - 1))
  const col = Math.round(((lng - minLng) / (maxLng - minLng)) * (cols - 1))
  return {
    row: Math.max(0, Math.min(rows - 1, row)),
    col: Math.max(0, Math.min(cols - 1, col)),
  }
}

/** 8-directional neighbours */
function getNeighbours(
  node: GridNode,
  rows: number,
  cols: number,
): Array<{ row: number; col: number; moveCost: number }> {
  const { row, col } = node
  const directions = [
    { dr: -1, dc: 0, cost: 1 },
    { dr: 1, dc: 0, cost: 1 },
    { dr: 0, dc: -1, cost: 1 },
    { dr: 0, dc: 1, cost: 1 },
    { dr: -1, dc: -1, cost: 1.414 },
    { dr: -1, dc: 1, cost: 1.414 },
    { dr: 1, dc: -1, cost: 1.414 },
    { dr: 1, dc: 1, cost: 1.414 },
  ]
  return directions
    .map(({ dr, dc, cost }) => ({
      row: row + dr,
      col: col + dc,
      moveCost: cost,
    }))
    .filter((n) => n.row >= 0 && n.row < rows && n.col >= 0 && n.col < cols)
}

/** Simple min-heap priority queue */
class MinHeap {
  private heap: GridNode[] = []

  push(node: GridNode): void {
    this.heap.push(node)
    this.bubbleUp(this.heap.length - 1)
  }

  pop(): GridNode | undefined {
    const top = this.heap[0]
    const last = this.heap.pop()
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last
      this.sinkDown(0)
    }
    return top
  }

  get size(): number {
    return this.heap.length
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      if (this.heap[parent].f <= this.heap[i].f) break
      ;[this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]]
      i = parent
    }
  }

  private sinkDown(i: number): void {
    const n = this.heap.length
    for (;;) {
      let smallest = i
      const l = 2 * i + 1
      const r = 2 * i + 2
      if (l < n && this.heap[l].f < this.heap[smallest].f) smallest = l
      if (r < n && this.heap[r].f < this.heap[smallest].f) smallest = r
      if (smallest === i) break
      ;[this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]]
      i = smallest
    }
  }
}

export type RouteResult =
  | { status: 'safe'; path: Coordinates[]; message: string }
  | { status: 'warning'; path: Coordinates[]; message: string }
  | { status: 'no_route'; path: []; message: string }

/**
 * Runs A* on a lat/lng grid to find the safest possible path.
 * Critical zones are blocked (∞ cost), High zones penalised heavily.
 */
export const calculateSafeRoute = (
  start: Coordinates,
  end: Coordinates,
  reports: Report[],
): RouteResult => {
  // Expand bounding box by 20% on each side to allow wide detours
  const latPad = Math.abs(end.lat - start.lat) * 0.4 + 0.02
  const lngPad = Math.abs(end.lng - start.lng) * 0.4 + 0.02

  const minLat = Math.min(start.lat, end.lat) - latPad
  const maxLat = Math.max(start.lat, end.lat) + latPad
  const minLng = Math.min(start.lng, end.lng) - lngPad
  const maxLng = Math.max(start.lng, end.lng) + lngPad

  const ROWS = GRID_RESOLUTION
  const COLS = GRID_RESOLUTION

  const costGrid = buildCostGrid(reports, minLat, maxLat, minLng, maxLng, ROWS, COLS)

  const startCell = coordsToCell(start.lat, start.lng, minLat, maxLat, minLng, maxLng, ROWS, COLS)
  const endCell = coordsToCell(end.lat, end.lng, minLat, maxLat, minLng, maxLng, ROWS, COLS)

  const heuristic = (row: number, col: number) =>
    Math.sqrt((row - endCell.row) ** 2 + (col - endCell.col) ** 2)

  const gScore: number[][] = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(Infinity),
  )
  gScore[startCell.row][startCell.col] = 0

  const startNode: GridNode = {
    row: startCell.row,
    col: startCell.col,
    g: 0,
    h: heuristic(startCell.row, startCell.col),
    f: heuristic(startCell.row, startCell.col),
    parent: null,
  }

  const openSet = new MinHeap()
  openSet.push(startNode)
  const closedSet = new Set<string>()

  while (openSet.size > 0) {
    const current = openSet.pop()!
    const key = `${current.row},${current.col}`

    if (closedSet.has(key)) continue
    closedSet.add(key)

    if (current.row === endCell.row && current.col === endCell.col) {
      // Reconstruct path
      const path: Coordinates[] = []
      let node: GridNode | null = current
      while (node) {
        path.unshift(
          cellToCoords(node.row, node.col, minLat, maxLat, minLng, maxLng, ROWS, COLS),
        )
        node = node.parent
      }

      // Check if path goes through any dangerous zones
      const hasDanger = path.some((pt) =>
        reports.some(
          (rep) =>
            (rep.severity === 'Critical' || rep.severity === 'High') &&
            haversineDistance(pt.lat, pt.lng, rep.coords.lat, rep.coords.lng) < DANGER_RADIUS_M,
        ),
      )

      return {
        status: hasDanger ? 'warning' : 'safe',
        path,
        message: hasDanger
          ? 'Route partially passes near high-risk areas. Proceed with caution.'
          : 'Safe route calculated avoiding all high-risk areas.',
      }
    }

    for (const neighbour of getNeighbours(current, ROWS, COLS)) {
      const nKey = `${neighbour.row},${neighbour.col}`
      if (closedSet.has(nKey)) continue

      const cellCost = costGrid[neighbour.row][neighbour.col]
      if (cellCost >= INFINITY_COST) continue // blocked

      const tentativeG = current.g + neighbour.moveCost * cellCost
      if (tentativeG >= gScore[neighbour.row][neighbour.col]) continue

      gScore[neighbour.row][neighbour.col] = tentativeG
      const h = heuristic(neighbour.row, neighbour.col)
      openSet.push({
        row: neighbour.row,
        col: neighbour.col,
        g: tentativeG,
        h,
        f: tentativeG + h,
        parent: current,
      })
    }
  }

  return {
    status: 'no_route',
    path: [],
    message: 'No safe route could be found. All paths are blocked by critical zones.',
  }
}
