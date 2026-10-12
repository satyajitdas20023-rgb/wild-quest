



'use client'



import { useCallback, useEffect, useRef, useState } from 'react'

import {

  ArrowRight,

  Award,

  Bell,


  BookOpen,

  Camera,

  ChevronRight,


  Compass,

  Fish,
  Expand,


  Footprints,


  Leaf,

  MapPin,



  MoreHorizontal,

  RefreshCw,

  Search,

  Sparkles,


  Target,

  Trophy,

  UserRound,

  Waves,

  X,

} from 'lucide-react'



type Tab = 'home' | 'quests' | 'explore' | 'collection' | 'community'

type SpeciesItem = {
  id?: string
  identificationStatus?: 'pending' | 'complete' | 'failed' | 'corrected'
  name: string
  latin: string
  category: string
  points: number
  rarity: string
  image: string
  status?: string
  dateFound?: string
  locationFound?: string
  notes?: string
  modelSuggestion?: string
  correctionNotes?: string
}

const species: SpeciesItem[] = [

  { name: 'European Robin', latin: 'Erithacus rubecula', category: 'Bird', points: 20, rarity: 'Uncommon', status: 'Demonstration entry', image: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=600&q=85' },

  { name: 'Field Poppy', latin: 'Papaver rhoeas', category: 'Plant', points: 10, rarity: 'Common', status: 'Demonstration entry', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=85' },

  { name: 'Common Blue', latin: 'Polyommatus icarus', category: 'Insect', points: 35, rarity: 'Rare', status: 'Demonstration entry', image: 'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=600&q=85' },

  { name: 'Atlantic Salmon', latin: 'Salmo salar', category: 'Fish', points: 35, rarity: 'Rare', status: 'Demonstration entry', image: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=600&q=85' },

]



const quests = [

  { title: 'Wildlife Explorer', desc: 'Slow down, look closer, and discover the living world around you.', icon: Leaf, color: '#a4ac86', image: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=85', progress: '65 / 150 pts', habitats: 'Woodland · Meadows · Wetlands' },

  { title: 'Fishing Mode', desc: 'Explore freshwater edges and coastal waters with care.', icon: Fish, color: '#8fa59a', image: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?auto=format&fit=crop&w=900&q=85', progress: '20 / 50 pts', habitats: 'Rivers · Lakes · Coast' },

  { title: 'Beach Mode', desc: 'Find small wonders where the land meets the tide.', icon: Waves, color: '#d5b78b', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85', progress: '0 / 50 pts', habitats: 'Tidal pools · Rocky shores' },

  { title: 'Zoo Mode', desc: 'A considered way to discover animals in a selected zoo.', icon: Compass, color: '#b19a7e', image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=900&q=85', progress: '40 / 150 pts', habitats: 'Rainforest House · Savannah' },

]



function Header({ onProfile }: { onProfile: () => void }) {

  return <header className="topbar"><div className="brand"><span className="brand-mark"><Leaf size={17} strokeWidth={2.5} /></span><span>WildQuest</span></div><div className="header-actions"><button className="icon-button" aria-label="Notifications"><Bell size={19} /></button><button className="avatar" onClick={onProfile} aria-label="Open profile">AM</button></div></header>

}



function Home({ onTab, onOpen, items, session }: { onTab: (tab: Tab) => void; onOpen: (kind: string) => void; items: SpeciesItem[]; session: QuestSession }) {
  const recentItems = [...items].slice(0, 3)
  const [greeting, setGreeting] = useState('Welcome back')
  const [dateLabel, setDateLabel] = useState('YOUR FIELD ADVENTURE')

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')
    setDateLabel(now.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long',
    }).toUpperCase())
  }, [])
  const activePoints = session.active ? sessionPoints(session) : 0
  const activeRank = activePoints >= 300 ? 'NATURE GUARDIAN' : activePoints >= 150 ? 'WILD EXPLORER' : activePoints >= 50 ? 'TRAIL SCOUT' : 'FIELD SESSION'
  const activePercent = Math.min(100, (activePoints / MAX_QUEST_POINTS) * 100)
  return <div className="screen">

    <section className="intro"><p className="eyebrow">{dateLabel}</p><h1>{greeting}, explorer.</h1><div className="location"><MapPin size={14} />{session.location ? ` ${session.location.latitude.toFixed(4)}, ${session.location.longitude.toFixed(4)} · GPS` : session.active ? ` ${'Waiting for GPS location'}` : ` Location tracked during a quest`}</div></section>

    <section className="progress-card"><div className="progress-top"><div><span className="eyebrow light">{session.active ? 'ACTIVE FIELD QUEST' : 'YOUR NEXT ADVENTURE'}</span><h2>{activePoints} <small>/ {MAX_QUEST_POINTS} pts</small></h2></div><div className="difficulty">{session.active ? activeRank : 'NOT STARTED'} <ChevronRight size={14} /></div></div><div className="progress-track"><span style={{ width: `${activePercent}%` }} /></div><div className="progress-bottom"><span>{Math.max(0, MAX_QUEST_POINTS - activePoints)} points to Nature Guardian</span><span>{session.active ? `${session.steps.toLocaleString()} steps` : 'Start to begin tracking'}</span></div></section>

    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">KEEP EXPLORING</p><h2>Continue your quest</h2></div><button className="text-link" onClick={() => onTab('quests')}>View all <ArrowRight size={15} /></button></div><div className="active-quest"><img src={quests[0].image} alt="Sunlight through a green woodland" /><div className="quest-overlay"><span className="pill">{session.active ? 'ACTIVE QUEST' : 'FIELD ADVENTURE'}</span><h3>{session.active ? 'Your field session' : 'Ready to explore?'}</h3><p>{session.active ? `${session.discoveries.length} unique species · ${session.steps.toLocaleString()} steps` : 'Start one quest and let your progress build as you walk and discover species.'}</p><button className="cream-button" onClick={() => onTab('quests')}>{session.active ? 'Continue quest' : 'Start a quest'} <ArrowRight size={15} /></button></div></div></section>

    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">CAPTURE A MOMENT</p><h2>Make a discovery</h2></div></div><div className="action-grid"><button className="action-card" onClick={() => onOpen('photo')}><span className="action-icon sage"><Camera size={21} /></span><span><strong>Photograph</strong><small>Identify a species</small></span><ArrowRight size={16} /></button></div></section>

    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">NEARBY, DEMONSTRATION</p><h2>Worth a closer look</h2></div><button className="text-link" onClick={() => onTab('explore')}>Explore <ArrowRight size={15} /></button></div><div className="recommendation"><img src={species[0].image} alt="European robin perched on a branch" /><div><span className="rarity">UNCOMMON · 20 PTS</span><h3>European Robin</h3><p>Often found in woodland edges and quiet gardens.</p><button className="outline-button" onClick={() => onTab('explore')}>Where should I look?</button></div></div></section>

    <section className="section-block collection-strip"><div className="section-heading"><div><p className="eyebrow">YOUR COMPENDIUM</p><h2>Recently added</h2></div><button className="text-link" onClick={() => onTab('collection')}>Open compendium <ArrowRight size={15} /></button></div><div className="mini-row">{recentItems.map((item, index) => <button className="mini-card" key={item.id ?? `${normalizeTaxonText(item.name)}-${index}`} onClick={() => onTab('collection')}><img src={item.image} alt={item.name} /><span>{item.name}</span></button>)}</div></section>

  </div>

}



type LocationPoint = {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

type QuestSession = {
  id: string
  active: boolean
  startedAt: number | null
  steps: number
  discoveries: string[]
  // Taxonomic keys stop aliases (for example, dog / golden retriever) counting twice.
  discoveryKeys?: string[]
  // Keys map to the exact points earned; zero means logged but not rewarded again today.
  discoveryPointAwards?: Record<string, number>
  location: LocationPoint | null
  route: LocationPoint[]
}

type QuestHistoryEntry = {
  id: string
  startedAt: number
  endedAt: number
  durationMs: number
  steps: number
  points: number
  discoveries: string[]
  discoveryKeys?: string[]
  discoveryPointAwards?: Record<string, number>
  location: LocationPoint | null
  routePoints: number
  distanceMeters?: number
  endReason: 'manual' | 'time-limit'
}

const QUEST_SESSION_KEY = 'wildquest-active-session'
const QUEST_HISTORY_KEY = 'wildquest-history'
const DAILY_SPECIES_REWARDS_KEY = 'wildquest-daily-species-rewards-v1'
const QUEST_SESSION_DURATION = 12 * 60 * 60 * 1000
const WALKING_POINT_INTERVAL = 100
const MAX_WALKING_POINTS = 100
const POINTS_PER_UNIQUE_DISCOVERY = 20 // default for identified taxa not in the common-species list
const POINTS_PER_COMMON_SPECIES = 5
const MAX_QUEST_POINTS = 300

// Alias mapping prevents common names, plural forms and familiar breeds from being
// used as separate discoveries. Keep the list conservative; scientific names are preferred.
const TAXON_ALIASES: Record<string, string> = {
  'dog': 'canis lupus familiaris', 'dogs': 'canis lupus familiaris',
  'puppy': 'canis lupus familiaris', 'golden retriever': 'canis lupus familiaris',
  'labrador retriever': 'canis lupus familiaris', 'domestic dog': 'canis lupus familiaris',
  'cat': 'felis catus', 'cats': 'felis catus', 'kitten': 'felis catus',
  'house cat': 'felis catus', 'domestic cat': 'felis catus',
  'pigeon': 'columba livia', 'pigeons': 'columba livia', 'rock pigeon': 'columba livia',
  'feral pigeon': 'columba livia',
  'crow': 'corvus splendens', 'house crow': 'corvus splendens', 'indian house crow': 'corvus splendens',
  'myna': 'acridotheres tristis', 'common myna': 'acridotheres tristis', 'indian myna': 'acridotheres tristis',
  'sparrow': 'passer domesticus', 'house sparrow': 'passer domesticus',
  'cow': 'bos taurus', 'cattle': 'bos taurus', 'domestic cow': 'bos taurus',
  'goat': 'capra hircus', 'domestic goat': 'capra hircus',
  'chicken': 'gallus gallus domesticus', 'hen': 'gallus gallus domesticus',
  'rooster': 'gallus gallus domesticus', 'domestic chicken': 'gallus gallus domesticus',
  'mouse': 'mus musculus', 'house mouse': 'mus musculus',
  'common house gecko': 'hemidactylus frenatus', 'house gecko': 'hemidactylus frenatus',
}

const COMMON_SPECIES_TAXA = new Set([
  'canis lupus familiaris', 'felis catus', 'columba livia', 'corvus splendens',
  'acridotheres tristis', 'passer domesticus', 'bos taurus', 'capra hircus',
  'gallus gallus domesticus', 'mus musculus', 'hemidactylus frenatus',
])

function normalizeTaxonText(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ')
}

function speciesTaxonKey(commonName: string, scientificName = '') {
  const normalizedName = normalizeTaxonText(commonName)
  const alias = TAXON_ALIASES[normalizedName]
  if (alias) return `sci:${alias}`

  const normalizedScientific = normalizeTaxonText(scientificName)
  if (normalizedScientific &&
      !normalizedScientific.includes('not verified') &&
      !normalizedScientific.includes('unknown') &&
      !normalizedScientific.includes('unidentified') &&
      /^[a-z][a-z-]+(?:\s+[a-z][a-z-]+){1,2}$/.test(normalizedScientific)) {
    return `sci:${normalizedScientific}`
  }

  return `name:${normalizedName}`
}

function pointsForSpeciesKey(taxonKey: string) {
  const scientificName = taxonKey.startsWith('sci:') ? taxonKey.slice(4) : ''
  return COMMON_SPECIES_TAXA.has(scientificName) ? POINTS_PER_COMMON_SPECIES : POINTS_PER_UNIQUE_DISCOVERY
}

function claimDailySpeciesReward(taxonKey: string) {
  const today = new Date()
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  try {
    const saved = JSON.parse(window.localStorage.getItem(DAILY_SPECIES_REWARDS_KEY) || 'null') as { date?: string; keys?: string[] } | null
    const keys = saved?.date === dateKey && Array.isArray(saved.keys) ? saved.keys : []
    if (keys.includes(taxonKey)) return false
    window.localStorage.setItem(DAILY_SPECIES_REWARDS_KEY, JSON.stringify({ date: dateKey, keys: [...keys, taxonKey] }))
    return true
  } catch (error) {
    console.warn('Could not persist daily species reward guard.', error)
    return true
  }
}

function totalDiscoveryPoints(session: Pick<QuestSession, 'steps' | 'discoveries' | 'discoveryPointAwards'>) {
  if (session.discoveryPointAwards) {
    return Object.values(session.discoveryPointAwards).reduce((total, points) => total + Math.max(0, Number(points) || 0), 0)
  }
  // Compatibility for older saved quests created before per-species reward amounts existed.
  return session.discoveries.length * 25
}

function walkingPoints(steps: number) {
  return Math.min(MAX_WALKING_POINTS, Math.floor(Math.max(0, steps) / WALKING_POINT_INTERVAL))
}

function sessionPoints(session: Pick<QuestSession, 'steps' | 'discoveries' | 'discoveryPointAwards'>) {
  return Math.min(MAX_QUEST_POINTS, walkingPoints(session.steps) + totalDiscoveryPoints(session))
}

function formatDuration(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

function distanceBetweenMeters(a: LocationPoint, b: LocationPoint) {
  const toRadians = (value: number) => (value * Math.PI) / 180
  const earthRadius = 6371000
  const dLat = toRadians(b.latitude - a.latitude)
  const dLon = toRadians(b.longitude - a.longitude)
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

function calculateRouteDistance(route: LocationPoint[]) {
  let totalMeters = 0
  for (let index = 1; index < route.length; index += 1) {
    const previous = route[index - 1]
    const current = route[index]
    const segmentMeters = distanceBetweenMeters(previous, current)
    const elapsedSeconds = Math.max(1, (current.timestamp - previous.timestamp) / 1000)
    // Ignore obvious GPS jumps (more than 15 m/s), which can otherwise inflate distance.
    if (Number.isFinite(segmentMeters) && segmentMeters <= elapsedSeconds * 15) totalMeters += segmentMeters
  }
  return Math.round(totalMeters)
}

function formatDistance(meters?: number) {
  if (meters === undefined || meters === null) return 'Not recorded'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(2)} km`
}

function entryDiscoveryPoints(entry: QuestHistoryEntry) {
  const awarded = entry.discoveryPointAwards
    ? Object.values(entry.discoveryPointAwards).reduce((total, value) => total + Math.max(0, Number(value) || 0), 0)
    : entry.discoveries.length * 25
  return Math.min(Math.max(0, MAX_QUEST_POINTS - walkingPoints(entry.steps)), awarded)
}

function Quests({
  session,
  history,
  stepStatus,
  locationStatus,
  items,
  summaryEntry,
  onStart,
  onEnd,
  onEnableSteps,
  onDismissSummary,
  
}: {
  session: QuestSession
  history: QuestHistoryEntry[]
  stepStatus: string
  locationStatus: string
  items: SpeciesItem[]
  summaryEntry: QuestHistoryEntry | null
  onStart: () => void
  onEnd: () => void
  onEnableSteps: () => void
  onDismissSummary: () => void
 
}) {
  const [view, setView] = useState<'current' | 'history'>('current')
  const [now, setNow] = useState(0)
  const maxPoints = MAX_QUEST_POINTS
  const points = sessionPoints(session)
  const progress = Math.min(100, (points / maxPoints) * 100)
  const remainingMs = session.startedAt ? Math.max(0, QUEST_SESSION_DURATION - ((now || Date.now()) - session.startedAt)) : 0
  const remainingHours = Math.floor(remainingMs / 3600000)
  const remainingMinutes = Math.floor((remainingMs % 3600000) / 60000)
  const stepScore = walkingPoints(session.steps)
  const discoveryScore = Math.min(MAX_QUEST_POINTS - stepScore, totalDiscoveryPoints(session))

  useEffect(() => {
    setNow(Date.now())
    if (!session.active) return
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [session.active, session.startedAt])

  if (summaryEntry) {
    const summaryWalkingPoints = walkingPoints(summaryEntry.steps)
    const summaryDiscoveryPoints = entryDiscoveryPoints(summaryEntry)
    const discoveredCards = summaryEntry.discoveries.map((name, index) => {
      const key = summaryEntry.discoveryKeys?.[index] || speciesTaxonKey(name, knownScientificName(name))
      const matchedItem = items.find((item) =>
        item.name.toLowerCase() === name.toLowerCase() ||
        item.modelSuggestion?.toLowerCase() === name.toLowerCase() ||
        speciesTaxonKey(item.name, item.latin) === key
      )
      const award = summaryEntry.discoveryPointAwards?.[key] ?? 0
      return { key: `${key}-${index}`, name, item: matchedItem, award }
    })

    return <div className="screen quest-completion-screen">
      <section className="quest-completion-hero">
        <span className="quest-completion-emblem">✓</span>
        <p className="eyebrow">FIELD SESSION COMPLETE</p>
        <h1>Well explored.</h1>
        <p>Your observations and activity from this session have been summarised below.</p>
        <div className="quest-completion-total"><strong>{summaryEntry.points}</strong><span>total points</span></div>
        <div className="quest-completion-rank">{summaryEntry.points >= 300 ? 'NATURE GUARDIAN' : summaryEntry.points >= 150 ? 'WILD EXPLORER' : summaryEntry.points >= 50 ? 'TRAIL SCOUT' : 'FIELD EXPLORER'}</div>
      </section>

      <section className="quest-completion-stats" aria-label="Quest summary statistics">
        <div className="quest-completion-stat"><span className="quest-summary-check">✓</span><Footprints size={19} /><strong>{summaryEntry.steps.toLocaleString()}</strong><span>Steps walked</span></div>
        <div className="quest-completion-stat"><span className="quest-summary-check">✓</span><MapPin size={19} /><strong>{summaryEntry.routePoints >= 2 ? formatDistance(summaryEntry.distanceMeters) : 'Not enough data'}</strong><span>GPS distance estimate</span></div>
        <div className="quest-completion-stat"><span className="quest-summary-check">✓</span><Compass size={19} /><strong>{formatDuration(summaryEntry.durationMs)}</strong><span>Time exploring</span></div>
        <div className="quest-completion-stat"><span className="quest-summary-check">✓</span><Footprints size={19} /><strong>{summaryWalkingPoints}</strong><span>Walking points</span></div>
        <div className="quest-completion-stat"><span className="quest-summary-check">✓</span><Sparkles size={19} /><strong>{summaryDiscoveryPoints}</strong><span>Discovery points</span></div>
        <div className="quest-completion-stat"><span className="quest-summary-check">✓</span><Camera size={19} /><strong>{summaryEntry.discoveries.length}</strong><span>Species cards found</span></div>
      </section>

      <section className="section-block quest-completion-species">
        <div className="section-heading"><div><p className="eyebrow">YOUR FIELD LOG</p><h2>Species you discovered</h2></div><span className="quest-completion-count">{summaryEntry.discoveries.length}</span></div>
        {discoveredCards.length ? <div className="quest-completion-species-grid">{discoveredCards.map(({ key, name, item, award }) => <article className="quest-completion-species-card" key={key}>
          {item?.image ? <img src={item.image} alt={name} /> : <div className="quest-completion-species-placeholder"><Leaf size={25} /></div>}
          <div><strong>{name}</strong><span>{item?.latin && item.latin !== 'Scientific name not verified' ? item.latin : item?.category || 'Species observation'}</span><small>{award > 0 ? `+${award} pts earned` : 'Recorded · no repeat points'}</small></div>
        </article>)}</div> : <div className="quest-history-empty"><h2>No species cards this time</h2><p>Your walking activity still counts. Identified species will appear here after you capture photos during a quest.</p></div>}
      </section>

      <p className="quest-completion-footnote">{summaryEntry.routePoints >= 2 ? 'Distance is estimated from GPS route samples and may differ from the actual route.' : 'Distance could not be estimated because this session did not record enough GPS positions.'} {summaryEntry.endReason === 'time-limit' ? 'The 12-hour session limit was reached.' : 'You ended this field session manually.'}</p>
      <div className="quest-completion-actions">
        <button className="dark-button full" onClick={() => { onDismissSummary(); setView('history') }}>View quest history <ArrowRight size={15} /></button>
        <button className="cream-button" onClick={() => { onDismissSummary(); setView('current'); onStart() }}>Start another quest <ArrowRight size={15} /></button>
        <button className="outline-button" onClick={() => { onDismissSummary(); setView('current') }}>Back to quests</button>
      </div>
    </div>
  }

  return <div className="screen">
    <div className="page-title"><p className="eyebrow">YOUR FIELD ADVENTURE</p><h1>{view === 'history' ? 'Past adventures.' : session.active ? 'Keep exploring.' : 'Ready to explore?'}</h1><p>{view === 'history' ? 'Review the time, steps, points and species recorded on each completed quest.' : session.active ? 'Your field session is running. Walking and unique species discoveries both move your rank forward.' : 'Start once, then focus on the world around you. Your session runs for up to 12 hours.'}</p></div>
    <div className="filter-row quest-view-switch"><button className={view === 'current' ? 'filter active' : 'filter'} onClick={() => setView('current')}>Current quest</button><button className={view === 'history' ? 'filter active' : 'filter'} onClick={() => setView('history')}>History ({history.length})</button></div>

    {view === 'history' ? <section className="section-block quest-history-list">
      {history.length === 0 ? <div className="quest-history-empty"><span className="action-icon sage"><BookOpen size={20} /></span><h2>No past quests yet</h2><p>When you end a quest or its 12-hour limit expires, its summary and discovered species will appear here.</p></div> : [...history].sort((a, b) => b.endedAt - a.endedAt).map((entry) => <article className="quest-history-card" key={entry.id}>
        <div className="quest-history-head"><div><p className="eyebrow">{new Date(entry.endedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p><h2>{new Date(entry.startedAt).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })} adventure</h2></div><strong>{entry.points} pts</strong></div>
        <div className="quest-history-stats"><span><Footprints size={15} /> {entry.steps.toLocaleString()} steps</span><span><Compass size={15} /> {formatDuration(entry.durationMs)}</span><span><MapPin size={15} /> {formatDistance(entry.distanceMeters)} GPS distance</span><span><MapPin size={15} /> {entry.routePoints} GPS points</span></div>
        {entry.location && <p className="quest-history-location">Last location: {entry.location.latitude.toFixed(5)}, {entry.location.longitude.toFixed(5)}</p>}
        <div className="quest-history-discoveries"><strong>Species discovered ({entry.discoveries.length})</strong>{entry.discoveries.length ? <p>{entry.discoveries.join(' · ')}</p> : <p>No confirmed photo identifications in this session.</p>}</div>
        {entry.endReason === 'time-limit' && <span className="quest-history-tag">12-hour limit reached</span>}
      </article>)}
    </section> : !session.active ? <>
      <section className="section-block quest-session-start"><div className="active-quest"><img src={quests[0].image} alt="Sunlight through a green woodland" /><div className="quest-overlay"><span className="pill">FIELD SESSION</span><h3>One adventure. Three ranks.</h3><p>Earn up to 100 walking points. Known common species earn 5 points; other identified species earn 20. Each species can earn discovery points only once per day, even if you restart a quest.</p><button className="cream-button" onClick={onStart}>Start a quest <ArrowRight size={15} /></button></div></div></section>
      <section className="section-block"><div className="section-heading"><div><p className="eyebrow">HOW IT WORKS</p><h2>Three ranks, one progress bar</h2></div></div><div className="quest-rank-list"><div><strong>Trail Scout</strong><span>50 points · Easy</span></div><div><strong>Wild Explorer</strong><span>150 points · Medium</span></div><div><strong>Nature Guardian</strong><span>300 points · Hard</span></div></div><p className="modal-text">Walking earns 1 point per 100 steps, capped at 100 walking points. Known common species earn 5 points and other identified species earn 20. A taxon can earn points only once per calendar day across quests; repeat observations still remain in your Compendium. Total quest progress is capped at 300 points.</p></section>
    </> : <>
      <section className="progress-card quest-session-card">
        <div className="progress-top"><div><span className="eyebrow light">QUEST IN PROGRESS</span><h2>{points} <small>/ {maxPoints} pts</small></h2></div><span className="quest-status">ACTIVE</span></div>
        <div className="quest-milestone-track"><div className="quest-track-base"><span style={{ width: `${progress}%` }} /></div>{[{ label: 'Trail Scout', pts: 50 }, { label: 'Wild Explorer', pts: 150 }, { label: 'Nature Guardian', pts: 300 }].map((level) => <div className={`quest-milestone ${points >= level.pts ? 'reached' : ''}`} key={level.label} style={{ left: `${(level.pts / maxPoints) * 100}%` }}><span className="quest-milestone-check">{points >= level.pts ? '✓' : ''}</span><span className="quest-milestone-label">{level.label}</span><span className="quest-milestone-points">{level.pts} pts</span></div>)}</div>
        <div className="progress-bottom"><span>{Math.max(0, maxPoints - points)} points to Nature Guardian</span><span>{remainingHours}h {remainingMinutes}m left</span></div>
        <div className="quest-activity-stats"><div><Footprints size={18} /><strong>{session.steps.toLocaleString()}</strong><span>steps</span></div><div><Award size={18} /><strong>{stepScore}</strong><span>walking pts</span></div><div><Camera size={18} /><strong>{session.discoveries.length}</strong><span>new species</span></div><div><Sparkles size={18} /><strong>{discoveryScore}</strong><span>discovery pts</span></div></div>
        <div className="quest-permission-block"><div className="quest-permission-row"><Footprints size={17} /><div><strong>Step tracking</strong><span>{stepStatus}</span></div>{!stepStatus.toLowerCase().includes('active') && !stepStatus.toLowerCase().includes('unavailable') && <button className="outline-button" onClick={onEnableSteps}>Enable</button>}</div><div className="quest-permission-row"><MapPin size={17} /><div><strong>GPS location</strong><span>{locationStatus}</span>{session.location && <small>Current: {session.location.latitude.toFixed(5)}, {session.location.longitude.toFixed(5)} · ±{Math.round(session.location.accuracy)} m</small>}</div></div></div>
        <p className="quest-session-note">Walking points are capped at 100. Known common species earn 5 points and other identified species earn 20. Each taxon can earn points once per calendar day across quests; repeat photos remain in your Compendium but do not farm points. GPS route samples are stored in this browser only.</p>
        <button className="outline-button quest-end-button" onClick={onEnd}>End quest and save history</button>
      </section>
      <section className="section-block"><div className="section-heading"><div><p className="eyebrow">FIELD LOG</p><h2>Species this quest</h2></div><button className="text-link" onClick={() => setView('history')}>Past quests <ArrowRight size={15} /></button></div>{session.discoveries.length ? <div className="quest-discovery-list">{session.discoveries.map((name, index) => { const key = session.discoveryKeys?.[index] || speciesTaxonKey(name, knownScientificName(name)); const reward = session.discoveryPointAwards?.[key]; return <div key={`${key}-${index}`}><Leaf size={16} /><span>{name}</span><strong>{reward === undefined ? '+25 pts' : reward > 0 ? `+${reward} pts` : 'Logged · no repeat points today'}</strong></div> })}</div> : <p className="modal-text">Your first successful photo identification during this session will appear here.</p>}</section>
    </>}
    
  </div>
}

type NearbySpecies = {
  key: string
  name: string
  scientificName: string
  latitude: number | null
  longitude: number | null
  observedAt: string | null
  photo: string | null
  photoSource?: string | null
  photoAttribution?: string | null
  source: string
  priorityLabel?: string
  nearbyRecordCount?: number
  taxonGroup?: string
  isInsect?: boolean
  isCoastalWildlife?: boolean
  recommendationReason?: string
}

type WorldCoverClass = {
  code: number
  name: string
  samples: number
  samplePercent: number
}

type NearbyHabitat = {
  source: string
  year: number
  resolutionMeters: number
  samplingRadiusKm: number
  attemptedSamples: number
  validSamples: number
  dominantHabitat: string | null
  classes: WorldCoverClass[]
  attribution: string
  note: string
}

const worldCoverColors: Record<number, string> = {
  10: '#587b4e', 20: '#a7a86f', 30: '#c6ce8b', 40: '#d7b85c', 50: '#9b7770',
  60: '#c8b9a1', 70: '#d8e5e7', 80: '#83b7c7', 90: '#6d9c8b', 95: '#4d8377', 100: '#a8b58c',
}

function Explore({ items, onSearchStatusChange }: { items: SpeciesItem[]; onSearchStatusChange: (status: 'running' | 'finished') => void }) {
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('Requesting your GPS location…')
  const [unavailablePhotoKeys, setUnavailablePhotoKeys] = useState<string[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [nearbySpecies, setNearbySpecies] = useState<NearbySpecies[]>([])
  const [habitat, setHabitat] = useState<NearbyHabitat | null>(null)
  const [habitatError, setHabitatError] = useState('')
  const [locationLabel, setLocationLabel] = useState('Location not shared')
  const [gpsCoordinates, setGpsCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)
  const [expandedSpeciesKey, setExpandedSpeciesKey] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<{ url: string; scientificName: string; commonName: string } | null>(null)

  useEffect(() => {
    if (!photoPreview) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPhotoPreview(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [photoPreview])

  async function findWildlife() {
    setError('')
    setMessage('')
    setHabitatError('')
    setHabitat(null)
    setNearbySpecies([])
    setUnavailablePhotoKeys([])
    setLoadingStage('Requesting your GPS location…')
    if (!('geolocation' in navigator)) {
      setError('This browser does not support location. Try a modern browser or use manual location later.')
      return
    }
    setLoading(true)
    onSearchStatusChange('running')
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude, accuracy } = position.coords
      setGpsCoordinates({ latitude, longitude })
      setGpsAccuracy(Number.isFinite(accuracy) ? accuracy : null)
      setExpandedSpeciesKey(null)
      setLocationLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} · GPS`)
      setLoadingStage('Checking nearby wildlife and mapping habitats…')
      const habitatRequest = fetch(`http://127.0.0.1:5000/explore/habitat?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`)
        .then(async (response) => {
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.error || 'Could not retrieve ESA WorldCover habitat data.')
          return payload as NearbyHabitat
        })
      const speciesRequest = fetch('http://127.0.0.1:5000/explore/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          existingSpecies: items.map((item) => ({ name: item.name, scientificName: item.latin })),
        }),
      }).then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Could not retrieve nearby species.')
        return payload
      })

      try {
        const [habitatResult, speciesResult] = await Promise.allSettled([habitatRequest, speciesRequest])

        if (habitatResult.status === 'fulfilled') {
          setHabitat(habitatResult.value)
        } else {
          setHabitatError(habitatResult.reason instanceof Error ? habitatResult.reason.message : 'Could not retrieve ESA WorldCover habitat data. Check that Flask is running and rasterio is installed.')
        }

        if (speciesResult.status === 'fulfilled') {
          const payload = speciesResult.value
          // Keep the five-species limit in the UI too, in addition to the backend limit.
          let records = (Array.isArray(payload.species) ? payload.species as NearbySpecies[] : []).slice(0, 5)
          if (records.length > 0 && habitatResult.status === 'fulfilled') {
            setLoadingStage('Asking hosted Gemma to rank the evidence…')
            try {
              const recommendationResponse = await fetch('http://127.0.0.1:5000/explore/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  coastalLocation: Boolean(payload.coastalLocation),
                  habitat: habitatResult.value,
                  species: records.map((item) => ({
                    key: item.key,
                    name: item.name,
                    scientificName: item.scientificName,
                    observedAt: item.observedAt,
                    nearbyRecordCount: item.nearbyRecordCount,
                    priorityLabel: item.priorityLabel,
                    taxonGroup: item.taxonGroup,
                    isInsect: item.isInsect,
                    isCoastalWildlife: item.isCoastalWildlife,
                  })),
                }),
              })
              const recommendationPayload = await recommendationResponse.json()
              if (!recommendationResponse.ok) throw new Error(recommendationPayload.error || 'Gemma recommendation request failed.')
              const byScientificName = new Map(records.map((item) => [item.scientificName.trim().toLowerCase(), item]))
              const ranked: NearbySpecies[] = []
              if (Array.isArray(recommendationPayload.recommendations)) {
                for (const recommendation of recommendationPayload.recommendations) {
                  if (!recommendation || typeof recommendation.scientificName !== 'string') continue
                  const candidate = byScientificName.get(recommendation.scientificName.trim().toLowerCase())
                  if (candidate && !ranked.some((item) => item.scientificName === candidate.scientificName)) {
                    ranked.push({ ...candidate, recommendationReason: typeof recommendation.reason === 'string' ? recommendation.reason : undefined })
                  }
                }
              }
              if (ranked.length) {
                const rankedNames = new Set(ranked.map((item) => item.scientificName.trim().toLowerCase()))
                records = [...ranked, ...records.filter((item) => !rankedNames.has(item.scientificName.trim().toLowerCase()))].slice(0, 5)
                setMessage(`Gemma ranked ${ranked.length} candidates using nearby GBIF records and ESA habitat context. These are evidence-based suggestions, not confirmation of current presence.`)
              } else {
                setMessage('Habitat and GBIF data loaded, but Gemma did not return a valid ranking. Showing the original GBIF order instead.')
              }
            } catch (recommendationError) {
              console.warn('Gemma wildlife recommendation failed; retaining GBIF ranking.', recommendationError)
              setMessage('Habitat and GBIF data loaded. Gemma recommendations were unavailable, so the original GBIF ranking is shown.')
            }
          }
          setNearbySpecies(records)
          if (!records.length) {
            setMessage('No eligible new animal species were found in this search batch. Species already in your Compendium are excluded; try again later.')
          } else if (habitatResult.status !== 'fulfilled') {
            setMessage('GBIF species records loaded, but habitat data was unavailable, so Gemma ranking was skipped.')
          }
        } else {
          setError(speciesResult.reason instanceof Error ? speciesResult.reason.message : 'Could not retrieve nearby species. Check that Flask is running on port 5000.')
        }
      } finally {
        setLoading(false)
        onSearchStatusChange('finished')
      }
    }, (geoError) => {
      setLoading(false)
      onSearchStatusChange('finished')
      if (geoError.code === geoError.PERMISSION_DENIED) setError('Location permission was denied. Allow location access in your browser settings and try again.')
      else if (geoError.code === geoError.TIMEOUT) setError('Location lookup timed out. Please try again.')
      else setError('Could not determine your location. Check your device location settings and try again.')
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 })
  }

  // Keep the two independent data sources together as one evidence bundle.
  // This is the structured context assembled from the two live data sources.
  const combinedExploreContext = habitat && nearbySpecies.length > 0 ? {
    coordinates: gpsCoordinates,
    radiusKm: habitat.samplingRadiusKm,
    dominantHabitat: habitat.dominantHabitat,
    habitatClasses: habitat.classes.slice(0, 4).map(({ name, samplePercent, samples }) => ({ name, samplePercent, samples })),
    species: nearbySpecies.slice(0, 5).map(({ scientificName, name, observedAt, nearbyRecordCount }) => ({ scientificName, commonName: name, observedAt, nearbyRecordCount })),
    evidenceNote: 'Land-cover classes describe the surrounding area. GBIF records document observations within the search radius; they do not prove that a species currently occurs in a particular land-cover class.',
  } : null

  const mapSrc = gpsCoordinates ? (() => {
    const { latitude, longitude } = gpsCoordinates
    const south = Math.max(-85, latitude - 0.11)
    const north = Math.min(85, latitude + 0.11)
    const west = Math.max(-180, longitude - 0.12)
    const east = Math.min(180, longitude + 0.12)
    const bounds = [west, south, east, north].map((value) => value.toFixed(6)).join(',')
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bounds)}&layer=mapnik&marker=${latitude}%2C${longitude}`
  })() : ''

  return <div className="screen">
    <div className="page-title"><p className="eyebrow">LOCAL BIODIVERSITY</p><h1>Look a little closer.</h1><p>Find up to five new species recorded near you per search. Anything already in your Compendium is excluded.</p></div>
    <div className="map-card explore-map-card">
      <div className="explore-map-wrap">
        {gpsCoordinates ? <iframe className="explore-map-iframe" title="OpenStreetMap centered on your GPS location" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="explore-map-empty"><span className="explore-map-empty-icon"><MapPin size={23} /></span><strong>Your map will appear here</strong><span>Share your location to view a real map centered on your GPS coordinates.</span></div>}
      </div>
      <div className="map-footer"><div><strong>Your exploration area</strong><span><MapPin size={13} /> {locationLabel}{gpsAccuracy !== null ? ` · ±${Math.round(gpsAccuracy)} m` : ''}</span></div><button className="outline-button" onClick={findWildlife} disabled={loading}>{loading ? 'Finding…' : gpsCoordinates ? 'Refresh nearby' : 'Find wildlife near me'}</button></div>
      {gpsCoordinates && <a className="explore-open-map" href={`https://www.openstreetmap.org/?mlat=${gpsCoordinates.latitude}&mlon=${gpsCoordinates.longitude}#map=14/${gpsCoordinates.latitude}/${gpsCoordinates.longitude}`} target="_blank" rel="noreferrer">Open larger map <ArrowRight size={13} /></a>}
    </div>
    {loading && <section className="explore-loading-panel" role="status" aria-live="polite" aria-label="Wildlife search in progress">
      <div className="explore-loading-visual" aria-hidden="true"><span className="explore-loading-ring" /><span className="explore-loading-leaf"><Leaf size={23} /></span></div>
      <div className="explore-loading-copy"><p className="eyebrow">EXPLORING YOUR AREA</p><h3>{loadingStage}</h3><p>Checking ESA WorldCover, nearby GBIF observations, and backup species photos. This can take a little time—you can keep using other WildQuest tabs.</p></div>
      <div className="explore-loading-progress" aria-hidden="true"><span /><span /><span /></div>
    </section>}
    {error && <p className="modal-text" role="alert" style={{ marginTop: 12 }}>{error}</p>}
    {habitatError && <p className="modal-text" role="status" style={{ marginTop: 12 }}>Habitat lookup unavailable: {habitatError}</p>}
    {habitat && <section className="worldcover-panel">
      <div className="section-heading compact"><div><p className="eyebrow">ESA WORLDCOVER · 2021</p><h2>Land cover near you</h2></div><span className="worldcover-radius">{habitat.samplingRadiusKm} km area</span></div>
      <p className="worldcover-intro">{habitat.validSamples} of {habitat.attemptedSamples} sample points were classified from the 10 m land-cover dataset.</p>
      {habitat.classes.slice(0, 4).map((landClass) => <div className="worldcover-class" key={landClass.code}>
        <div className="worldcover-class-heading"><span className="worldcover-dot" style={{ backgroundColor: worldCoverColors[landClass.code] || '#a4ac86' }} /><div className="worldcover-class-label"><strong>{landClass.name}</strong><small>{landClass.samples} sample {landClass.samples === 1 ? 'point' : 'points'}</small></div><b>{landClass.samplePercent}%</b></div>
        <div className="worldcover-bar"><span style={{ width: `${landClass.samplePercent}%`, backgroundColor: worldCoverColors[landClass.code] || '#a4ac86' }} /></div>
      </div>)}
      <p className="worldcover-attribution">{habitat.note} {habitat.attribution}</p>
    </section>}
    {combinedExploreContext && <section className="combined-context-panel" aria-label="Combined habitat and wildlife context">
      <div className="combined-context-heading"><div><p className="eyebrow">LOCAL BIODIVERSITY CONTEXT</p><h2>Habitat + wildlife records</h2></div><span className="combined-context-badge">Combined evidence</span></div>
      <div className="combined-context-stats"><div><span>Dominant sampled land cover</span><strong>{combinedExploreContext.dominantHabitat || 'Not classified'}</strong></div><div><span>New species records</span><strong>{combinedExploreContext.species.length} of 5 maximum</strong></div></div>
      <div className="combined-context-habitats"><span className="combined-context-label">Other sampled land-cover classes</span><div>{combinedExploreContext.habitatClasses.map((landClass) => <span key={landClass.name}>{landClass.name} · {landClass.samplePercent}%</span>)}</div></div>
      <p className="combined-context-note">{combinedExploreContext.evidenceNote}</p>
    </section>}
    {message && <p className="modal-text" role="status" style={{ marginTop: 12 }}>{message}</p>}
    <div className="section-heading compact"><div><p className="eyebrow">GBIF OCCURRENCE RECORDS</p><h2>{nearbySpecies.length ? 'Species recorded nearby' : 'What might you find?'}</h2></div><button className="icon-button" onClick={findWildlife} aria-label="Refresh nearby species" title="Refresh nearby species" disabled={loading}><RefreshCw size={16} /></button></div>
    {nearbySpecies.length ? <div className="nearby-species-list">{nearbySpecies.map((item, index) => {
      const cardKey = item.key || `${item.scientificName}-${index}`
      const expanded = expandedSpeciesKey === cardKey
      const hasCoordinates = item.latitude !== null && item.longitude !== null && Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
      const observationMapUrl = hasCoordinates ? `https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=15/${item.latitude}/${item.longitude}` : ''
      const scientificName = item.scientificName || item.name
      const commonName = item.name && item.name.toLowerCase() !== scientificName.toLowerCase() ? item.name : ''
      return <article className={`nearby-species-card ${expanded ? 'is-expanded' : ''}`} key={cardKey}>
        <div className="nearby-species-row">
          {item.photo && !unavailablePhotoKeys.includes(cardKey) ? <button className="nearby-species-photo-button" type="button" aria-label={`Expand photo of ${scientificName}`} onClick={() => setPhotoPreview({ url: item.photo as string, scientificName, commonName })}>
            <img src={item.photo} alt={`Photo of ${scientificName}`} loading="lazy" onError={() => setUnavailablePhotoKeys((current) => current.includes(cardKey) ? current : [...current, cardKey])} />
            <span className="nearby-photo-expand-hint"><Expand size={14} /></span>
          </button> : <span className="nearby-species-thumb" aria-label="No image available"><Leaf size={24} /></span>}
          <button className="nearby-species-trigger" type="button" aria-expanded={expanded} aria-controls={`nearby-species-details-${index}`} onClick={() => setExpandedSpeciesKey(expanded ? null : cardKey)}>
            <span className="nearby-species-main"><span className="rarity">GBIF · RECORDED OBSERVATION</span><strong>{scientificName}</strong>{commonName && <em>{commonName}</em>}<small>{item.observedAt ? item.observedAt.slice(0, 10) : 'Observation date not supplied'}</small>{item.priorityLabel && <span className="nearby-priority-label">{item.priorityLabel}</span>}</span>
            <ChevronRight className="nearby-species-chevron" size={18} aria-hidden="true" />
          </button>
        </div>
        {expanded && <div className="nearby-species-details" id={`nearby-species-details-${index}`}>
          <div><span>Scientific name</span><strong>{scientificName}</strong></div>
          {commonName && <div><span>Common name</span><strong>{commonName}</strong></div>}
          <div><span>Recorded date</span><strong>{item.observedAt ? item.observedAt.slice(0, 10) : 'Not supplied by GBIF'}</strong></div>
          {typeof item.nearbyRecordCount === 'number' && <div><span>Records in this nearby result batch</span><strong>{item.nearbyRecordCount}</strong></div>}
          {item.recommendationReason && <div><span>Why WildQuest recommends it</span><strong>{item.recommendationReason}</strong></div>}
          {hasCoordinates && <div><span>Observation coordinates</span><strong>{item.latitude!.toFixed(5)}, {item.longitude!.toFixed(5)}</strong></div>}
          <p>GBIF documents an occurrence record here; it does not confirm that the species is present today. Local record frequency is only a rough ranking signal, not proof of biological rarity.</p>
          {hasCoordinates && <a href={observationMapUrl} target="_blank" rel="noreferrer">View record location on map <ArrowRight size={13} /></a>}
          {item.photo && <button className="nearby-detail-photo-link" type="button" onClick={() => setPhotoPreview({ url: item.photo as string, scientificName, commonName })}>View larger photo <Expand size={13} /></button>}
        </div>}
      </article>
    })}</div> : <div className="quest-history-empty"><h2>{locationLabel === 'Location not shared' ? 'Start with your location' : 'No new species in this batch'}</h2><p>{locationLabel === 'Location not shared' ? 'Tap the button above to request GPS permission and find up to five species with documented observations nearby. Species already in your Compendium are excluded.' : 'No new species are currently displayed. Check the lookup message above. Habitat data is listed separately; Gemma-based recommendations will be added after these data sources are working.'}</p></div>}
    {photoPreview && <div className="nearby-photo-lightbox" role="dialog" aria-modal="true" aria-label={`Photo of ${photoPreview.scientificName}`} onClick={() => setPhotoPreview(null)}>
      <div className="nearby-photo-lightbox-panel" onClick={(event) => event.stopPropagation()}>
        <button className="nearby-photo-lightbox-close" type="button" aria-label="Close enlarged photo" onClick={() => setPhotoPreview(null)}><X size={21} /></button>
        <img src={photoPreview.url} alt={`Expanded photo associated with ${photoPreview.scientificName}`} onError={() => setPhotoPreview(null)} />
        <div className="nearby-photo-lightbox-caption"><strong>{photoPreview.scientificName}</strong>{photoPreview.commonName && <span>{photoPreview.commonName}</span>}<small>{nearbySpecies.find((item) => item.scientificName === photoPreview.scientificName)?.photoSource === 'iNaturalist taxon photo' ? 'Reference photo from iNaturalist for this taxon; it may not depict the individual recorded by GBIF.' : 'Image supplied with a GBIF occurrence record; identification may require independent verification.'}{nearbySpecies.find((item) => item.scientificName === photoPreview.scientificName)?.photoAttribution ? ` Attribution: ${nearbySpecies.find((item) => item.scientificName === photoPreview.scientificName)?.photoAttribution}` : ''}</small></div>
      </div>
    </div>}
    <p className="modal-text" style={{ fontSize: 12, marginTop: 14 }}>GBIF records show documented observations, not guaranteed current sightings. Photo licenses and attribution may vary by record.</p>
  </div>
}



function formatFoundDate(value: string) {
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function Compendium({ onOpen, items }: { onOpen: (kind: string, item?: SpeciesItem) => void; items: SpeciesItem[] }) { const [query, setQuery] = useState(''); const shown = items.filter((s) => `${s.name} ${s.latin} ${s.category}`.toLowerCase().includes(query.toLowerCase())); const acceptedPoints = items.filter((item) => item.status !== 'Demonstration entry' && item.identificationStatus !== 'pending' && item.identificationStatus !== 'failed').reduce((total, item) => total + item.points, 0); const discoveriesThisMonth = items.filter((item) => item.dateFound && new Date(item.dateFound).getMonth() === new Date().getMonth() && new Date(item.dateFound).getFullYear() === new Date().getFullYear()).length; return <div className="screen"><div className="page-title collection-title"><div><p className="eyebrow">YOUR FIELD GUIDE</p><h1>Compendium</h1></div><div className="collection-count"><strong>{items.length}</strong><span>species entries</span></div></div><div className="collection-stats"><div><strong>{acceptedPoints}</strong><span>recorded points</span></div><div><strong>{items.length}</strong><span>field notes</span></div><div><strong>{discoveriesThisMonth}</strong><span>added this month</span></div></div><div className="searchbox"><Search size={18} /><input aria-label="Search compendium" placeholder="Search species" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="filter-row"><button className="filter active">All</button><button className="filter">Birds</button><button className="filter">Plants</button><button className="filter">Insects</button></div><div className="species-grid compendium-species-scroll">{shown.map((item, index) => <button className={`species-card rarity-${item.rarity.toLowerCase().replace(' ', '-')}`} key={item.id ?? `${normalizeTaxonText(item.name)}-${index}`} onClick={() => onOpen('species', item)}><div className="species-photo"><img src={item.image} alt={item.name} /><span className="species-points">{item.identificationStatus === 'pending' ? 'Identifying…' : item.identificationStatus === 'failed' ? 'Retry needed' : item.identificationStatus === 'corrected' ? 'Corrected' : item.status?.startsWith('AI suggestion') ? (item.points > 0 ? `Review · +${item.points} pts` : 'Needs review') : item.status && item.status !== 'Demonstration entry' ? 'Needs review' : `+${item.points} pts`}</span></div><div className="species-copy"><strong>{item.name}</strong><em>{item.latin}</em></div><div className="species-meta"><span className="species-category">{item.identificationStatus === 'pending' ? 'Processing' : item.identificationStatus === 'failed' ? 'Identification failed' : item.identificationStatus === 'corrected' ? 'User corrected' : item.status && item.status !== 'Demonstration entry' ? 'Needs review' : item.status === 'Demonstration entry' ? 'Demo' : item.category}</span><span className="species-rarity">{item.rarity}</span></div>{item.dateFound ? <p style={{ padding: '0 12px 12px', margin: 0, fontSize: 12, color: '#656d4a' }}>Found: {formatFoundDate(item.dateFound)}</p> : item.status === 'Demonstration entry' ? <p style={{ padding: '0 12px 12px', margin: 0, fontSize: 12, color: '#936639' }}>Demonstration entry</p> : null}</button>)}</div></div> }



function Community() { return <div className="screen"><div className="page-title"><p className="eyebrow">THE WILD AROUND US</p><h1>Community</h1><p>Shared discoveries from a demonstration community.</p></div><div className="leaderboard-card"><div className="leader-head"><div><span className="eyebrow light">THIS WEEK</span><h2>Field notes leaderboard</h2></div><Trophy size={25} /></div><div className="leader-row you"><span className="rank">01</span><span className="community-avatar">AM</span><div><strong>Alex Morgan <small>YOU</small></strong><span>12 species discovered</span></div><b>65 pts</b></div>{['Maya Chen', 'Theo Williams', 'Samira Patel'].map((name, i) => <div className="leader-row" key={name}><span className="rank">0{i + 2}</span><span className="community-avatar muted">{name.split(' ').map(n => n[0]).join('')}</span><div><strong>{name} <small>DEMO</small></strong><span>{10 - i * 2} species discovered</span></div><b>{58 - i * 11} pts</b></div>)}</div><div className="section-heading compact"><div><p className="eyebrow">FROM THE COMMUNITY</p><h2>Recent discoveries</h2></div><button className="icon-button"><MoreHorizontal size={19} /></button></div><div className="community-grid">{species.slice(0, 3).map((item, index) => <div className="community-photo" key={item.id ?? `${normalizeTaxonText(item.name)}-${index}`}><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><span>Shared by demo explorer</span></div></div>)}</div></div> }




async function makeSmallImageDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const maxDimension = 1000
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not prepare the image for the compendium.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const compressed = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Could not compress the image.')),
      'image/jpeg',
      0.72,
    )
  })

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not save the image.'))
    reader.readAsDataURL(compressed)
  })
}

const CATEGORY_OPTIONS = [
  { value: 'auto', label: 'Auto-detect group' },
  { value: 'bird', label: 'Bird' },
  { value: 'mammal', label: 'Mammal' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'amphibian', label: 'Amphibian' },
  { value: 'fish', label: 'Fish' },
  { value: 'insect', label: 'Insect' },
  { value: 'arachnid', label: 'Spider / arachnid' },
  { value: 'crustacean', label: 'Crab / shrimp / crustacean' },
  { value: 'mollusc', label: 'Snail / octopus / mollusc' },
  { value: 'other_invertebrate', label: 'Other invertebrate' },
  { value: 'plant', label: 'Plant' },
  { value: 'fungus', label: 'Fungus / mushroom' },
  { value: 'other', label: 'Other / not sure' },
]

function humanCategory(value: string) {
  const normalized = value.trim().toLowerCase()
  return CATEGORY_OPTIONS.find((option) => option.value.toLowerCase() === normalized || option.label.toLowerCase() === normalized)?.label ?? value
}

function cleanSpeciesName(label: string) {
  return label.replace(/^a photograph of an? /i, '').trim()
}

function knownScientificName(commonName: string) {
  const known: Record<string, string> = {
    'white-throated kingfisher': 'Halcyon smyrnensis',
    'common myna': 'Acridotheres tristis',
    'asian koel': 'Eudynamys scolopaceus',
    'house sparrow': 'Passer domesticus',
    'rose-ringed parakeet': 'Psittacula krameri',
    'house crow': 'Corvus splendens',
    'pigeon': 'Columba livia',
    'common house gecko': 'Hemidactylus frenatus',
    'common garden lizard': 'Calotes versicolor',
    'house mouse': 'Mus musculus',
    'domestic cat': 'Felis catus',
    'domestic dog': 'Canis lupus familiaris',
    'indian bullfrog': 'Hoplobatrachus tigerinus',
    'asian common toad': 'Duttaphrynus melanostictus',
    'neem': 'Azadirachta indica',
    'mango tree': 'Mangifera indica',
  }
  return known[commonName.toLowerCase()] ?? 'Scientific name not verified'
}

function PhotoIdentify({ onIdentifyInBackground }: { onIdentifyInBackground: (file: File) => void }) {
  const cameraInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  function selectFile(selected?: File) {
    setError('')
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }
    // Queue immediately: the parent saves a pending Compendium entry, starts the
    // upload, closes this modal, and lets the user continue exploring.
    onIdentifyInBackground(selected)
  }

  return (
    <>
      <span className="modal-icon sage"><Camera size={24} /></span>
      <p className="eyebrow">QUICK FIELD CAPTURE</p>
      <h2>Capture and keep moving.</h2>
      <p className="modal-text">Take a photo or choose one from your gallery. WildQuest will save it now and identify it in the background, so you can keep exploring. You can correct the suggestion in your Compendium later.</p>
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={(event) => { selectFile(event.target.files?.[0]); event.currentTarget.value = '' }} />
      <input ref={galleryInput} type="file" accept="image/*" hidden onChange={(event) => { selectFile(event.target.files?.[0]); event.currentTarget.value = '' }} />
      <div className="modal-options">
        <button type="button" onClick={() => cameraInput.current?.click()}><Camera size={19} /> Take a photo</button>
        <button type="button" onClick={() => galleryInput.current?.click()}><BookOpen size={19} /> Choose from gallery</button>
      </div>
      {error && <p className="modal-text" role="alert">{error}</p>}
      <p className="modal-text" style={{ fontSize: 12, marginTop: 10 }}>Identification may take a little while. Keep WildQuest open while it works.</p>
    </>
  )
}

function SpeciesDetails({ item, onSave, onClose }: { item: SpeciesItem; onSave: (item: SpeciesItem) => void; onClose: () => void }) {
  const [editing, setEditing] = useState(false)
  const [correctedName, setCorrectedName] = useState(item.identificationStatus === 'pending' || item.identificationStatus === 'failed' ? '' : item.name)
  const [correctedCategory, setCorrectedCategory] = useState(() => {
    const match = CATEGORY_OPTIONS.find((option) => option.value.toLowerCase() === item.category.toLowerCase() || option.label.toLowerCase() === item.category.toLowerCase())
    return match?.value ?? 'other'
  })
  const [location, setLocation] = useState(item.locationFound || '')
  const [notes, setNotes] = useState(item.notes || '')

  const isPending = item.identificationStatus === 'pending'
  const isFailed = item.identificationStatus === 'failed'

  function saveCorrection() {
    const name = correctedName.trim()
    if (!name) return
    const knownLatin = knownScientificName(name)
    onSave({
      ...item,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      latin: knownLatin !== 'Scientific name not verified' ? knownLatin : item.latin,
      category: humanCategory(correctedCategory),
      status: 'User-corrected identification (unverified)',
      identificationStatus: 'corrected',
      correctionNotes: 'Corrected by user',
      locationFound: location.trim(),
      notes: notes.trim(),
      points: 0,
    })
  }

  return <>
    <img className="modal-image" src={item.image} alt={item.name} />
    <p className="eyebrow">COMPENDIUM ENTRY</p>
    <h2>{item.name}</h2>
    <em>{item.latin}</em>
    <p className="modal-text">Category: {item.category}<br />Status: {item.status || 'Unverified'}<br />Rarity: {item.rarity}<br />Points: {item.points}</p>
    {isPending && <p className="modal-text" role="status">The AI model is still identifying this photo. You can close this entry and keep exploring; the result will update here when ready.</p>}
    {isFailed && <p className="modal-text" role="alert">Identification didn't finish. You can still add the correct name below.</p>}
    {item.dateFound && <p className="modal-text">Date found: {formatFoundDate(item.dateFound)}</p>}
    {item.locationFound && <p className="modal-text">Location: {item.locationFound}</p>}
    {item.modelSuggestion && <p className="modal-text">Original AI suggestion: {item.modelSuggestion}</p>}
    {item.correctionNotes && <p className="modal-text">Correction note: {item.correctionNotes}</p>}
    {item.notes && <p className="modal-text">Field notes: {item.notes}</p>}
    {!editing ? <>
      <button className="outline-button" style={{ width: '100%', margin: '8px 0' }} onClick={() => setEditing(true)}>Wrong identification? Correct it</button>
      <button className="dark-button full" onClick={onClose}>Done <ArrowRight size={15} /></button>
    </> : <div style={{ display: 'grid', gap: 10, textAlign: 'left', marginTop: 12 }}>
      <p className="modal-text">Update this field note whenever convenient. Your correction will be saved as unverified.</p>
      <label style={{ display: 'grid', gap: 5, fontSize: 13 }}>Correct species name
        <input value={correctedName} onChange={(event) => setCorrectedName(event.target.value)} placeholder="e.g. domestic dog" maxLength={120} style={{ width: '100%', padding: 10, border: '1px solid #d8d1c3', borderRadius: 8, background: '#fffdf8' }} />
      </label>
      <label style={{ display: 'grid', gap: 5, fontSize: 13 }}>Organism group
        <select value={correctedCategory} onChange={(event) => setCorrectedCategory(event.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d8d1c3', borderRadius: 8, background: '#fffdf8' }}>
          {CATEGORY_OPTIONS.filter((option) => option.value !== 'auto').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label style={{ display: 'grid', gap: 5, fontSize: 13 }}>Location (optional)
        <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Where did you find it?" maxLength={120} style={{ width: '100%', padding: 10, border: '1px solid #d8d1c3', borderRadius: 8, background: '#fffdf8' }} />
      </label>
      <label style={{ display: 'grid', gap: 5, fontSize: 13 }}>Field notes (optional)
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What did you notice?" maxLength={500} rows={2} style={{ width: '100%', padding: 10, border: '1px solid #d8d1c3', borderRadius: 8, background: '#fffdf8', resize: 'vertical' }} />
      </label>
      <button className="dark-button full" onClick={saveCorrection} disabled={!correctedName.trim()}>Save correction</button>
      <button className="outline-button" onClick={() => setEditing(false)}>Cancel</button>
    </div>}
  </>
}

function Modal({ kind, close, onUpdateCompendium, onIdentifyInBackground, selectedSpecies }: {
  kind: string
  close: () => void
  onUpdateCompendium: (item: SpeciesItem) => void
  onIdentifyInBackground: (file: File) => void
  selectedSpecies?: SpeciesItem
}) {
  return <div className="modal-backdrop" onClick={close} style={{ overflowY: 'auto', alignItems: 'flex-start', justifyContent: 'center', padding: '16px 12px', boxSizing: 'border-box' }}>
    <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', boxSizing: 'border-box', margin: '0 auto' }}>
      <button className="modal-close" onClick={close} aria-label="Close"><X size={18} /></button>
      {kind === 'photo' ? <PhotoIdentify onIdentifyInBackground={onIdentifyInBackground} />
        : kind === 'species' ? <SpeciesDetails item={selectedSpecies || species[0]} onSave={onUpdateCompendium} onClose={close} />
        : <><span className="modal-icon sage"><Sparkles size={24} /></span><p className="eyebrow">QUEST READY</p><h2>Begin Wildlife Explorer?</h2><p className="modal-text">Your weekly target is 150 points on Medium. Unique species discoveries award points once per quest.</p><button className="dark-button full" onClick={close}>Start exploring <ArrowRight size={15} /></button></>}
    </div>
  </div>
}


export default function Page() {

  const [tab, setTab] = useState<Tab>('home');
  const [exploreTaskStatus, setExploreTaskStatus] = useState<'idle' | 'running' | 'finished'>('idle')

  const [modal, setModal] = useState<string | null>(null);

  const [profile, setProfile] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesItem | undefined>(undefined);

  const [compendium, setCompendium] = useState<SpeciesItem[]>(species)
  const [compendiumLoaded, setCompendiumLoaded] = useState(false)
  const [backgroundNotice, setBackgroundNotice] = useState('')
  const [questSession, setQuestSession] = useState<QuestSession>({
    id: '', active: false, startedAt: null, steps: 0, discoveries: [], location: null, route: [],
  })
  const [questSessionLoaded, setQuestSessionLoaded] = useState(false)
  const [questHistory, setQuestHistory] = useState<QuestHistoryEntry[]>([])
  const [questHistoryLoaded, setQuestHistoryLoaded] = useState(false)
  const [questCompletion, setQuestCompletion] = useState<QuestHistoryEntry | null>(null)
  const [stepTrackingEnabled, setStepTrackingEnabled] = useState(false)
  const [stepStatus, setStepStatus] = useState('Step tracking has not been enabled.')
  const [locationStatus, setLocationStatus] = useState('Location permission will be requested when a quest starts.')
  const questSessionRef = useRef(questSession)
  const motionRef = useRef({ baseline: null as number | null, wasAbove: false, lastStepAt: 0 })

  useEffect(() => {
    questSessionRef.current = questSession
  }, [questSession])

  // Keep the background-search notice only while the user is away from Explore.
  useEffect(() => {
    if (tab === 'explore' && exploreTaskStatus === 'finished') {
      setExploreTaskStatus('idle')
    }
  }, [tab, exploreTaskStatus])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('wildquest-compendium')
      if (saved) setCompendium(JSON.parse(saved) as SpeciesItem[])
    } catch (error) {
      console.warn('Could not load the saved compendium.', error)
    } finally {
      setCompendiumLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!compendiumLoaded) return
    try {
      window.localStorage.setItem('wildquest-compendium', JSON.stringify(compendium))
    } catch (error) {
      console.warn('Could not persist the compendium in local storage.', error)
    }
  }, [compendium, compendiumLoaded])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(QUEST_HISTORY_KEY)
      if (saved) setQuestHistory(JSON.parse(saved) as QuestHistoryEntry[])
    } catch (error) {
      console.warn('Could not load quest history.', error)
    } finally {
      setQuestHistoryLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!questHistoryLoaded) return
    try {
      window.localStorage.setItem(QUEST_HISTORY_KEY, JSON.stringify(questHistory.slice(0, 50)))
    } catch (error) {
      console.warn('Could not persist quest history.', error)
    }
  }, [questHistory, questHistoryLoaded])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(QUEST_SESSION_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved) as Partial<QuestSession> & { points?: number }
      if (parsed.active && parsed.startedAt && Date.now() - parsed.startedAt < QUEST_SESSION_DURATION) {
        const restored: QuestSession = {
          id: parsed.id || `quest-${parsed.startedAt}`,
          active: true,
          startedAt: parsed.startedAt,
          steps: Math.max(0, Number(parsed.steps) || 0),
          discoveries: Array.isArray(parsed.discoveries) ? parsed.discoveries.filter((x): x is string => typeof x === 'string') : [],
          discoveryKeys: Array.isArray(parsed.discoveryKeys) ? parsed.discoveryKeys.filter((x): x is string => typeof x === 'string') : (Array.isArray(parsed.discoveries) ? parsed.discoveries.filter((x): x is string => typeof x === 'string').map((name) => speciesTaxonKey(name, knownScientificName(name))) : []),
          discoveryPointAwards: parsed.discoveryPointAwards && typeof parsed.discoveryPointAwards === 'object' ? parsed.discoveryPointAwards as Record<string, number> : Object.fromEntries((Array.isArray(parsed.discoveries) ? parsed.discoveries.filter((x): x is string => typeof x === 'string').map((name) => speciesTaxonKey(name, knownScientificName(name))) : []).map((key) => [key, 25])),
          location: parsed.location ?? null,
          route: Array.isArray(parsed.route) ? parsed.route : [],
        }
        questSessionRef.current = restored
        setQuestSession(restored)
      } else if (parsed.active && parsed.startedAt) {
        const endedAt = Date.now()
        const steps = Math.max(0, Number(parsed.steps) || 0)
        const discoveries = Array.isArray(parsed.discoveries) ? parsed.discoveries.filter((x): x is string => typeof x === 'string') : []
        const discoveryKeys = Array.isArray(parsed.discoveryKeys) ? parsed.discoveryKeys.filter((x): x is string => typeof x === 'string') : discoveries.map((name) => speciesTaxonKey(name, knownScientificName(name)))
        const discoveryPointAwards = parsed.discoveryPointAwards && typeof parsed.discoveryPointAwards === 'object' ? parsed.discoveryPointAwards as Record<string, number> : Object.fromEntries(discoveryKeys.map((key) => [key, 25]))
        const route = Array.isArray(parsed.route) ? parsed.route : []
        const expiredEntry: QuestHistoryEntry = {
          id: parsed.id || `quest-${parsed.startedAt}`,
          startedAt: parsed.startedAt!, endedAt,
          durationMs: QUEST_SESSION_DURATION,
          steps,
          points: Math.min(MAX_QUEST_POINTS, walkingPoints(steps) + Object.values(discoveryPointAwards).reduce((total, value) => total + (Number(value) || 0), 0)),
          discoveries,
          discoveryKeys,
          discoveryPointAwards,
          location: parsed.location ?? null,
          routePoints: route.length,
          distanceMeters: route.length >= 2 ? calculateRouteDistance(route) : undefined,
          endReason: 'time-limit',
        }
        setQuestHistory((current) => [expiredEntry, ...current].slice(0, 50))
        setQuestCompletion(expiredEntry)
        setTab('quests')
        setBackgroundNotice('Your previous quest reached its 12-hour limit and was saved to history.')
        window.localStorage.removeItem(QUEST_SESSION_KEY)
      }
    } catch (error) {
      console.warn('Could not restore the quest session.', error)
    } finally {
      setQuestSessionLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!questSessionLoaded) return
    if (questSession.active && questSession.startedAt && Date.now() - questSession.startedAt >= QUEST_SESSION_DURATION) {
      // The interval below completes and records expired sessions using the latest ref.
      return
    }
    if (questSession.active) {
      try { window.localStorage.setItem(QUEST_SESSION_KEY, JSON.stringify(questSession)) }
      catch (error) { console.warn('Could not save active quest.', error) }
    } else {
      window.localStorage.removeItem(QUEST_SESSION_KEY)
    }
  }, [questSession, questSessionLoaded])

  const applySessionUpdate = useCallback((updater: (current: QuestSession) => QuestSession) => {
    const next = updater(questSessionRef.current)
    questSessionRef.current = next
    setQuestSession(next)
  }, [])

  const finishQuest = useCallback((timeLimitReached = false) => {
    const current = questSessionRef.current
    if (!current.active || !current.startedAt) return
    const endedAt = Date.now()
    const entry: QuestHistoryEntry = {
      id: current.id,
      startedAt: current.startedAt,
      endedAt,
      durationMs: Math.min(QUEST_SESSION_DURATION, Math.max(0, endedAt - current.startedAt)),
      steps: current.steps,
      points: sessionPoints(current),
      discoveries: [...current.discoveries],
      discoveryKeys: [...(current.discoveryKeys ?? current.discoveries.map((name) => speciesTaxonKey(name, knownScientificName(name))) )],
      discoveryPointAwards: { ...(current.discoveryPointAwards ?? Object.fromEntries(current.discoveries.map((name) => [speciesTaxonKey(name, knownScientificName(name)), 25]))) },
      location: current.location,
      routePoints: current.route.length,
      distanceMeters: current.route.length >= 2 ? calculateRouteDistance(current.route) : undefined,
      endReason: timeLimitReached ? 'time-limit' : 'manual',
    }
    setQuestCompletion(entry)
    setTab('quests')
    questSessionRef.current = { ...current, active: false }
    setQuestSession(questSessionRef.current)
    setQuestHistory((previous) => [entry, ...previous.filter((item) => item.id !== entry.id)].slice(0, 50))
    setBackgroundNotice(timeLimitReached ? 'Your 12-hour quest has ended. Its summary is saved in Quest History.' : 'Quest ended. Your steps, points and discoveries are saved in Quest History.')
    setStepTrackingEnabled(false)
    setStepStatus('Step tracking is off because the quest has ended.')
  }, [])

  useEffect(() => {
    if (!questSession.active || !questSession.startedAt) return
    const timer = window.setInterval(() => {
      const current = questSessionRef.current
      if (current.active && current.startedAt && Date.now() - current.startedAt >= QUEST_SESSION_DURATION) {
        finishQuest(true)
      }
    }, 10000)
    return () => window.clearInterval(timer)
  }, [questSession.active, questSession.startedAt, finishQuest])

  async function enableStepTracking() {
    const motionConstructor = (window as Window & { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent
    if (!motionConstructor) {
      setStepTrackingEnabled(false)
      setStepStatus('Step tracking is unavailable in this browser/device. Open WildQuest on a phone with motion sensors.')
      return
    }
    try {
      const permission = motionConstructor.requestPermission ? await motionConstructor.requestPermission() : 'granted'
      if (permission !== 'granted') {
        setStepTrackingEnabled(false)
        setStepStatus('Motion permission was not granted. Enable it to count steps.')
        return
      }
      motionRef.current = { baseline: null, wasAbove: false, lastStepAt: 0 }
      setStepTrackingEnabled(true)
      setStepStatus('Step tracking is active on this device.')
    } catch (error) {
      console.warn('Could not enable motion tracking.', error)
      setStepTrackingEnabled(false)
      setStepStatus('Motion permission was blocked. Try enabling it again on your phone.')
    }
  }

  function startQuest() {
    setQuestCompletion(null)
    const startedAt = Date.now()
    const next: QuestSession = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `quest-${startedAt}`,
      active: true,
      startedAt,
      steps: 0,
      discoveries: [],
      discoveryKeys: [],
      discoveryPointAwards: {},
      location: null,
      route: [],
    }
    questSessionRef.current = next
    setQuestSession(next)
    setStepStatus('Requesting motion permission…')
    setLocationStatus('Requesting GPS permission…')
    setTab('quests')
    setBackgroundNotice('Quest started. New species and walking activity both count toward your progress.')
    void enableStepTracking()
  }

  function endQuest() {
    finishQuest(false)
  }

  function awardDiscoveryIfNew(name: string, scientificName: string) {
    const current = questSessionRef.current
    const normalized = normalizeTaxonText(name)
    if (!current.active || !current.startedAt || Date.now() - current.startedAt >= QUEST_SESSION_DURATION || !normalized || normalized === 'unidentified organism') {
      return { newForQuest: false, pointsAwarded: 0, alreadyRewardedToday: false }
    }

    const taxonKey = speciesTaxonKey(name, scientificName)
    const currentKeys = current.discoveryKeys ?? current.discoveries.map((item) => speciesTaxonKey(item, knownScientificName(item)))
    if (currentKeys.includes(taxonKey)) {
      return { newForQuest: false, pointsAwarded: 0, alreadyRewardedToday: true }
    }

    const legacyAwards = current.discoveryPointAwards ?? Object.fromEntries(currentKeys.map((key) => [key, 25]))
    const alreadyRewardedToday = !claimDailySpeciesReward(taxonKey)
    const pointsAwarded = alreadyRewardedToday ? 0 : pointsForSpeciesKey(taxonKey)
    const next: QuestSession = {
      ...current,
      discoveries: [...current.discoveries, name.trim()],
      discoveryKeys: [...currentKeys, taxonKey],
      discoveryPointAwards: { ...legacyAwards, [taxonKey]: pointsAwarded },
    }
    questSessionRef.current = next
    setQuestSession(next)
    return { newForQuest: true, pointsAwarded, alreadyRewardedToday }
  }

  useEffect(() => {
    if (!questSession.active || !questSession.startedAt) return
    if (!navigator.geolocation) {
      setLocationStatus('GPS is unavailable in this browser/device.')
      return
    }
    setLocationStatus('Waiting for GPS position…')
    const watchId = navigator.geolocation.watchPosition((position) => {
      const point: LocationPoint = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp || Date.now(),
      }
      applySessionUpdate((current) => {
        if (!current.active) return current
        const lastPoint = current.route[current.route.length - 1]
        const shouldAddRoutePoint = !lastPoint || distanceBetweenMeters(lastPoint, point) >= 15 || point.timestamp - lastPoint.timestamp >= 60000
        const route = shouldAddRoutePoint ? [...current.route, point].slice(-1500) : current.route
        return { ...current, location: point, route }
      })
      setLocationStatus('GPS tracking is active.')
    }, (error) => {
      const detail = error.code === error.PERMISSION_DENIED ? 'Location permission was denied.' : error.code === error.TIMEOUT ? 'GPS timed out; waiting for another fix.' : 'Location could not be determined.'
      setLocationStatus(detail)
    }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 })
    return () => navigator.geolocation.clearWatch(watchId)
  }, [questSession.active, questSession.startedAt, applySessionUpdate])

  useEffect(() => {
    if (!questSession.active || !stepTrackingEnabled) return
    const onMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.acceleration ?? event.accelerationIncludingGravity
      if (!acceleration || acceleration.x == null || acceleration.y == null || acceleration.z == null) return
      const magnitude = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2)
      const state = motionRef.current
      if (state.baseline == null) state.baseline = magnitude
      state.baseline = state.baseline * 0.9 + magnitude * 0.1
      const movement = Math.abs(magnitude - state.baseline)
      const aboveThreshold = movement > 1.15
      const now = Date.now()
      if (aboveThreshold && !state.wasAbove && now - state.lastStepAt >= 320) {
        state.lastStepAt = now
        applySessionUpdate((current) => current.active ? { ...current, steps: current.steps + 1 } : current)
      }
      state.wasAbove = aboveThreshold
    }
    window.addEventListener('devicemotion', onMotion, { passive: true })
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [questSession.active, stepTrackingEnabled, applySessionUpdate])
  function openModal(kind: string, item?: SpeciesItem) {
    setSelectedSpecies(item)
    setModal(kind)
  }

  function updateCompendium(item: SpeciesItem) {
    setCompendium((current) => {
      if (item.id) {
        const exists = current.some((entry) => entry.id === item.id)
        return exists
          ? current.map((entry) => entry.id === item.id
              ? { ...entry, ...item, image: item.image.startsWith('blob:') && !entry.image.startsWith('blob:') ? entry.image : item.image }
              : entry)
          : [...current, item]
      }
      const alreadyExists = current.some((entry) => entry.name.toLowerCase() === item.name.toLowerCase())
      if (alreadyExists) {
        return current.map((entry) => entry.name.toLowerCase() === item.name.toLowerCase() ? { ...entry, ...item } : entry)
      }
      return [...current, item]
    })
    setModal(null)
    setProfile(false)
    setSelectedSpecies(undefined)
    setTab('collection')
  }

  function patchCompendiumEntry(id: string, patch: Partial<SpeciesItem>) {
    setCompendium((current) => current.map((entry) => entry.id === id ? { ...entry, ...patch } : entry))
  }

  async function identifyInBackground(file: File) {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `capture-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const now = new Date()
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
    const temporaryImage = URL.createObjectURL(file)
    const pendingEntry: SpeciesItem = {
      id,
      identificationStatus: 'pending',
      name: 'Identifying…',
      latin: 'AI is processing this photo',
      category: 'Pending',
      points: 0,
      rarity: 'Unconfirmed',
      image: temporaryImage,
      status: 'Identification pending',
      dateFound: localDate,
    }

    setCompendium((current) => [pendingEntry, ...current])
    setModal(null)
    setProfile(false)
    setSelectedSpecies(undefined)
    setBackgroundNotice('Photo saved to your Compendium. Identifying in the background…')

    // Save a compact image data URL for local persistence. This runs independently
    // of the AI request so users aren't held up by either operation.
    const imagePromise = makeSmallImageDataUrl(file)
      .then((image) => {
        patchCompendiumEntry(id, { image })
        URL.revokeObjectURL(temporaryImage)
        return image
      })
      .catch((error) => {
        console.warn('Could not prepare a persistent thumbnail.', error)
        return undefined
      })

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('category', 'auto')
      const response = await fetch('http://127.0.0.1:5000/identify/image', { method: 'POST', body: formData })
      let data: {
        error?: string
        details?: string
        species?: string
        common_name?: string
        scientific_name?: string
        category?: string
        organism_group?: string
        predictions?: Array<{ species?: string; scientific_name?: string }>
      }
      try {
        data = await response.json()
      } catch {
        throw new Error(`The backend returned an unreadable response (HTTP ${response.status}).`)
      }
      if (!response.ok) {
        const message = data.error || `Identification failed (HTTP ${response.status}).`
        // Preserve technical details in DevTools without turning an expected API failure
        // into a fatal-looking Next.js console error overlay.
        console.warn('WildQuest identification API returned an error:', {
          status: response.status,
          message,
          details: data.details,
        })
        throw new Error(message)
      }

      const firstPrediction = Array.isArray(data.predictions) ? data.predictions[0] : undefined
      const rawName = String(data.species || firstPrediction?.species || data.common_name || 'Unidentified organism')
      const suggestedName = cleanSpeciesName(rawName)
      const categoryValue = String(data.category || data.organism_group || 'other')
      const scientificName = String(data.scientific_name || firstPrediction?.scientific_name || knownScientificName(suggestedName))
      const savedImage = await imagePromise
      const safeName = suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1)
      const rewardResult = awardDiscoveryIfNew(safeName, scientificName)
      const pointsAwarded = rewardResult.pointsAwarded

      setCompendium((current) => current.map((entry) => {
        if (entry.id !== id) return entry
        // Do not overwrite a correction the user made while the AI model was processing.
        if (entry.identificationStatus === 'corrected') {
          return { ...entry, ...(savedImage ? { image: savedImage } : {}), modelSuggestion: suggestedName }
        }
        return {
          ...entry,
          name: safeName,
          latin: scientificName,
          category: humanCategory(categoryValue),
          ...(savedImage ? { image: savedImage } : {}),
          status: 'AI suggestion — review when convenient',
          identificationStatus: 'complete',
          modelSuggestion: safeName,
          points: pointsAwarded,
        }
      }))
      setBackgroundNotice(pointsAwarded
        ? `Identified ${safeName}: +${pointsAwarded} points for this discovery.`
        : rewardResult.newForQuest && rewardResult.alreadyRewardedToday
          ? `Identified ${safeName}. Saved to Compendium, but this species has already earned points today.`
          : rewardResult.newForQuest
            ? `Identified ${safeName}. It has been logged, but no discovery points were awarded.`
            : `Identification ready: ${safeName}. This taxon has already been counted in this quest, or no quest is active.`)
    } catch (error) {
      const savedImage = await imagePromise
      setCompendium((current) => current.map((entry) => {
        if (entry.id !== id) return entry
        if (entry.identificationStatus === 'corrected') return { ...entry, ...(savedImage ? { image: savedImage } : {}) }
        return {
          ...entry,
          name: 'Unidentified organism',
          latin: 'Identification unavailable',
          category: 'Unknown',
          ...(savedImage ? { image: savedImage } : {}),
          status: 'Identification failed — correct it when convenient',
          identificationStatus: 'failed',
        }
      }))
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn('Background identification failed:', message)
      const shortMessage = message.length > 150 ? `${message.slice(0, 147)}…` : message
      setBackgroundNotice(`Photo saved, but identification failed: ${shortMessage}`)
    }
  }



  return (



    <main className="app-shell">

      <div className="phone-frame">

        <Header onProfile={() => setProfile(true)} />

        {backgroundNotice && <div className="background-toast" role="status"><span>{backgroundNotice}</span><button type="button" onClick={() => setBackgroundNotice('')} aria-label="Dismiss message"><X size={16} /></button></div>}

        {tab !== 'explore' && exploreTaskStatus !== 'idle' && <div key={exploreTaskStatus} className="background-toast explore-background-toast" role="status" style={{ bottom: backgroundNotice ? 148 : 88 }}>
          <span>{exploreTaskStatus === 'running' ? 'Wildlife search is running in the background. You can keep using WildQuest.' : 'Nearby wildlife search is complete. Your results are ready in Explore.'}</span>
          <button type="button" onClick={() => setTab('explore')} aria-label="View wildlife search results" title="View Explore"><ArrowRight size={16} /></button>
        </div>}

        {tab === 'home' && <Home onTab={setTab} onOpen={openModal} items={compendium} session={questSession} />}

        {tab === 'quests' && <Quests session={questSession} history={questHistory} stepStatus={stepStatus} locationStatus={locationStatus} items={compendium} summaryEntry={questCompletion} onStart={startQuest} onEnd={endQuest} onEnableSteps={enableStepTracking} onDismissSummary={() => setQuestCompletion(null)}/>}

        {/* Keep Explore mounted while hidden so GPS, WorldCover, and GBIF requests finish and retain results across tab changes. */}
        <div style={{ display: tab === 'explore' ? 'block' : 'none' }} aria-hidden={tab !== 'explore'}>
          <Explore items={compendium} onSearchStatusChange={setExploreTaskStatus} />
        </div>

        {tab === 'collection' && <Compendium onOpen={openModal} items={compendium} />}

        {tab === 'community' && <Community />}



        <nav className="bottom-nav flex w-full items-center justify-around px-1 py-2">

          {(

            [

              { id: 'home', label: 'Home', icon: Leaf },

              { id: 'quests', label: 'Quests', icon: Target },

              { id: 'explore', label: 'Explore', icon: Compass },

              { id: 'collection', label: 'Compendium', icon: BookOpen },

              { id: 'community', label: 'Community', icon: UserRound },

            ] as const

          ).map(({ id, label, icon: Icon }) => (

            <button

              className={`nav-item flex min-w-0 flex-1 flex-col items-center justify-center gap-1 ${

                tab === id ? 'active' : ''

              }`}

              key={id}

              onClick={() => setTab(id)}

            >

              <Icon size={19} />

              <span>{label}</span>

            </button>

          ))}

        </nav>

      </div>



      {(modal || profile) && (

        <Modal

          kind={profile ? 'profile' : modal || 'photo'}

          selectedSpecies={selectedSpecies}

          onUpdateCompendium={updateCompendium}

          onIdentifyInBackground={identifyInBackground}

          close={() => {

            setModal(null);

            setProfile(false);

            setSelectedSpecies(undefined);

          }}

        />

      )}



      <style jsx global>{`
        .quest-completion-screen { padding-bottom: 28px; }
        .quest-completion-hero { border-radius: 20px; padding: 24px 18px; background: #343e2a; color: #fffdf8; text-align: center; }
        .quest-completion-emblem { display: grid; place-items: center; width: 48px; height: 48px; margin: 0 auto 12px; border-radius: 50%; background: #a4ac86; color: #293321; font-size: 26px; font-weight: 800; }
        .quest-completion-hero .eyebrow { color: #d7c7a5; }
        .quest-completion-hero h1 { margin: 7px 0 8px; font-size: 29px; line-height: 1.1; }
        .quest-completion-hero > p:not(.eyebrow) { max-width: 320px; margin: 0 auto; color: #e5e4da; font-size: 13px; line-height: 1.5; }
        .quest-completion-total { display: flex; align-items: baseline; justify-content: center; gap: 8px; margin-top: 18px; }
        .quest-completion-total strong { font-size: 44px; line-height: 1; }
        .quest-completion-total span { font-size: 13px; color: #e5e4da; }
        .quest-completion-rank { margin-top: 10px; font-size: 11px; font-weight: 800; letter-spacing: .12em; color: #d7c7a5; }
        .quest-completion-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin: 14px 0; }
        .quest-completion-stat { position: relative; display: flex; align-items: center; flex-direction: column; gap: 5px; min-width: 0; padding: 14px 8px 12px; border: 1px solid #e6dfd1; border-radius: 14px; background: #fffdf8; text-align: center; }
        .quest-completion-stat > svg { color: #687454; }
        .quest-completion-stat strong { max-width: 100%; overflow-wrap: anywhere; color: #303a27; font-size: 17px; }
        .quest-completion-stat > span:last-child { color: #817b6e; font-size: 11px; }
        .quest-summary-check { position: absolute; top: 8px; right: 9px; color: #74845d; font-size: 11px; font-weight: 800; }
        .quest-completion-count { display: grid; place-items: center; min-width: 28px; height: 28px; padding: 0 6px; border-radius: 50%; background: #e8eadf; color: #3f4a32; font-weight: 800; font-size: 12px; }
        .quest-completion-species-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .quest-completion-species-card { overflow: hidden; border: 1px solid #e6dfd1; border-radius: 13px; background: #fffdf8; }
        .quest-completion-species-card img, .quest-completion-species-placeholder { display: grid; width: 100%; height: 100px; object-fit: cover; background: #e9eadf; color: #687454; place-items: center; }
        .quest-completion-species-card > div:last-child { display: grid; gap: 4px; padding: 10px; }
        .quest-completion-species-card strong { font-size: 13px; line-height: 1.3; }
        .quest-completion-species-card span { overflow-wrap: anywhere; color: #817b6e; font-size: 10px; font-style: italic; }
        .quest-completion-species-card small { color: #687454; font-size: 11px; font-weight: 700; }
        .quest-completion-footnote { margin: 14px 0; color: #817b6e; font-size: 11px; line-height: 1.5; }
        .quest-completion-actions { display: grid; gap: 9px; margin-top: 18px; }
        .quest-session-card { margin-top: 18px; }
        .worldcover-panel { margin-top: 16px; padding: 15px; border: 1px solid #e6dfd1; border-radius: 16px; background: #fffdf8; }
        .worldcover-panel .section-heading { margin-top: 0; }
        .worldcover-radius { flex: 0 0 auto; padding: 6px 9px; border-radius: 99px; background: #e8eadf; color: #536143; font-size: 10px; font-weight: 800; }
        .worldcover-intro { margin: 0 0 12px; color: #817b6e; font-size: 12px; line-height: 1.45; }
        .worldcover-class { margin-top: 12px; }
        .worldcover-class-heading { display: flex; align-items: center; gap: 9px; }
        .worldcover-dot { flex: 0 0 auto; width: 10px; height: 10px; border-radius: 50%; }
        .worldcover-class-label { display: grid; flex: 1; gap: 2px; min-width: 0; }
        .worldcover-class-label strong { color: #303a27; font-size: 13px; }
        .worldcover-class-label small { color: #817b6e; font-size: 10px; }
        .worldcover-class-heading > b { color: #303a27; font-size: 12px; }
        .worldcover-bar { overflow: hidden; height: 5px; margin: 7px 0 0 19px; border-radius: 99px; background: #ede9df; }
        .worldcover-bar > span { display: block; height: 100%; border-radius: inherit; }
        .worldcover-attribution { margin: 14px 0 0; color: #817b6e; font-size: 10px; line-height: 1.5; }
        .quest-view-switch { margin-top: 14px; }
        .quest-history-list { display: grid; gap: 14px; }
        .quest-history-empty, .quest-history-card { border: 1px solid #e6dfd1; border-radius: 16px; padding: 16px; background: #fffdf8; }
        .quest-history-empty h2 { margin: 12px 0 6px; font-size: 18px; }
        .quest-history-empty p, .quest-history-discoveries p { margin: 0; color: #817b6e; font-size: 13px; line-height: 1.5; }
        .quest-history-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .quest-history-head h2 { margin: 4px 0 0; font-size: 17px; }
        .quest-history-head > strong { color: #596548; white-space: nowrap; }
        .quest-history-stats { display: flex; flex-wrap: wrap; gap: 10px 14px; margin: 14px 0; color: #716e62; font-size: 12px; }
        .quest-history-stats span { display: inline-flex; align-items: center; gap: 5px; }
        .quest-history-location { margin: 0 0 10px; color: #817b6e; font-size: 12px; }
        .quest-history-discoveries { border-top: 1px solid #ebe5d9; padding-top: 11px; display: grid; gap: 6px; }
        .quest-history-discoveries > strong { font-size: 13px; }
        .quest-history-tag { display: inline-block; margin-top: 10px; color: #936639; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
        .quest-activity-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 18px 0 12px; }
        .quest-activity-stats > div { display: flex; min-width: 0; align-items: center; flex-direction: column; gap: 4px; padding: 10px 4px; border: 1px solid #e6dfd1; border-radius: 12px; background: #fffdf8; text-align: center; }
        .quest-activity-stats svg { color: #687454; }
        .quest-activity-stats strong { font-size: 16px; color: #303a27; }
        .quest-activity-stats span { font-size: 10px; color: #817b6e; }
        .quest-permission-block { display: grid; gap: 10px; border-top: 1px solid rgba(255,255,255,.18); padding-top: 14px; margin-top: 10px; }
        .quest-permission-row { display: flex; align-items: flex-start; gap: 9px; }
        .quest-permission-row > svg { flex: 0 0 auto; margin-top: 2px; }
        .quest-permission-row > div { flex: 1; display: grid; gap: 3px; min-width: 0; }
        .quest-permission-row strong { font-size: 13px; }
        .quest-permission-row span, .quest-permission-row small { font-size: 11px; line-height: 1.4; opacity: .82; overflow-wrap: anywhere; }
        .quest-permission-row .outline-button { flex: 0 0 auto; padding: 7px 10px; }
        .quest-session-note { margin: 14px 0 0; font-size: 11px; line-height: 1.5; opacity: .82; }
        .quest-discovery-list { display: grid; gap: 8px; }
        .quest-discovery-list > div { display: flex; align-items: center; gap: 9px; padding: 11px 12px; border: 1px solid #e6dfd1; border-radius: 12px; background: #fffdf8; }
        .quest-discovery-list > div > svg { color: #687454; }
        .quest-discovery-list > div > span { flex: 1; font-size: 13px; }
        .quest-discovery-list > div > strong { font-size: 12px; color: #687454; white-space: nowrap; }
        @media (max-width: 370px) { .quest-activity-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .quest-milestone-label { font-size: 9px; } }
        .quest-milestone-track { position: relative; height: 72px; margin: 28px 12px 4px; }
        .quest-track-base { position: absolute; top: 8px; left: 0; right: 0; height: 7px; border-radius: 99px; background: #e8e3d8; overflow: hidden; }
        .quest-track-base > span { display: block; height: 100%; border-radius: inherit; background: #a4ac86; transition: width .25s ease; }
        .quest-milestone { position: absolute; top: 0; display: flex; flex-direction: column; align-items: center; width: max-content; transform: translateX(-50%); z-index: 1; }
        .quest-milestone:last-child { transform: translateX(-100%); align-items: flex-end; }
        .quest-milestone-check { display: grid; place-items: center; width: 23px; height: 23px; border: 2px solid #c9c2b5; border-radius: 50%; background: #fffdf8; color: #fffdf8; font-size: 13px; font-weight: 700; }
        .quest-milestone.reached .quest-milestone-check { background: #596548; border-color: #596548; color: #fffdf8; }
        .quest-milestone-label { margin-top: 7px; font-size: 10px; font-weight: 700; color: #4b503d; white-space: nowrap; }
        .quest-milestone-points { font-size: 10px; color: #817b6e; }
        .quest-end-button { width: 100%; margin-top: 16px; }
        .quest-rank-list { display: grid; gap: 10px; }
        .quest-rank-list > div { display: flex; justify-content: space-between; gap: 12px; padding: 12px 14px; border: 1px solid #e6dfd1; border-radius: 12px; background: #fffdf8; }
        .quest-rank-list span { color: #817b6e; font-size: 12px; }
        .explore-map-card { overflow: hidden; }
        .explore-loading-panel { position: relative; display: grid; grid-template-columns: 58px minmax(0, 1fr); align-items: center; gap: 12px; margin-top: 14px; padding: 15px; overflow: hidden; border: 1px solid #dfe3d1; border-radius: 16px; background: linear-gradient(135deg, #fffdf8, #f0f1e6); }
        .explore-loading-visual { position: relative; display: grid; place-items: center; width: 54px; height: 54px; }
        .explore-loading-ring { position: absolute; inset: 0; border: 3px solid #e2e5d7; border-top-color: #65764e; border-right-color: #a4ac86; border-radius: 50%; animation: explore-spin .9s linear infinite; }
        .explore-loading-leaf { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; color: #586548; background: #e9ecdf; animation: explore-breathe 1.8s ease-in-out infinite; }
        .explore-loading-copy { display: grid; min-width: 0; gap: 4px; }
        .explore-loading-copy .eyebrow { margin: 0; font-size: 9px; }
        .explore-loading-copy h3 { margin: 0; color: #303a27; font-size: 14px; line-height: 1.35; }
        .explore-loading-copy p:last-child { margin: 0; color: #777668; font-size: 11px; line-height: 1.5; }
        .explore-loading-progress { display: flex; grid-column: 1 / -1; gap: 5px; height: 4px; overflow: hidden; border-radius: 99px; background: #e7e5db; }
        .explore-loading-progress span { flex: 1; border-radius: inherit; background: #a4ac86; transform-origin: left; animation: explore-progress 1.3s ease-in-out infinite; }
        .explore-loading-progress span:nth-child(2) { animation-delay: .18s; }
        .explore-loading-progress span:nth-child(3) { animation-delay: .36s; }
        @keyframes explore-spin { to { transform: rotate(360deg); } }
        @keyframes explore-breathe { 0%, 100% { transform: scale(.92); opacity: .75; } 50% { transform: scale(1.04); opacity: 1; } }
        @keyframes explore-progress { 0%, 100% { opacity: .35; transform: scaleX(.55); } 50% { opacity: 1; transform: scaleX(1); } }
        @media (prefers-reduced-motion: reduce) { .explore-loading-ring, .explore-loading-leaf, .explore-loading-progress span { animation: none; } }
        .explore-map-wrap { position: relative; width: 100%; height: clamp(210px, 58vw, 310px); overflow: hidden; background: #e6e8d8; }
        .explore-map-iframe { display: block; width: 100%; height: 100%; border: 0; background: #e6e8d8; }
        .explore-map-empty { display: flex; width: 100%; height: 100%; min-height: 210px; align-items: center; justify-content: center; flex-direction: column; gap: 8px; padding: 24px; color: #526044; text-align: center; background: radial-gradient(circle at 22% 22%, #d3d9bd 0 12%, transparent 13%), radial-gradient(circle at 78% 70%, #c6d0b3 0 18%, transparent 19%), #e7e9d9; }
        .explore-map-empty-icon { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; background: #34402b; color: #fffdf8; }
        .explore-map-empty strong { color: #303a27; font-size: 14px; }
        .explore-map-empty > span:last-child { max-width: 260px; color: #6e7460; font-size: 12px; line-height: 1.5; }
        .explore-open-map { display: inline-flex; align-items: center; gap: 5px; margin: 0 15px 13px; color: #586548; font-size: 11px; font-weight: 700; text-decoration: none; }
        .combined-context-panel { display: grid; gap: 12px; margin: 16px 0; padding: 15px; border: 1px solid #dfe2d0; border-radius: 15px; background: linear-gradient(145deg, #f0f1e7, #fffdf8 72%); }
        .combined-context-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .combined-context-heading h2 { margin: 2px 0 0; color: #303a27; font-size: 16px; font-weight: 700; }
        .combined-context-badge { flex: 0 0 auto; padding: 5px 8px; border-radius: 99px; background: #e2e7d5; color: #586548; font-size: 9px; font-weight: 750; }
        .combined-context-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
        .combined-context-stats > div { display: grid; align-content: start; gap: 5px; padding: 10px; border: 1px solid #e7e5d9; border-radius: 10px; background: rgba(255,253,248,.8); }
        .combined-context-stats span, .combined-context-label { color: #817b6e; font-size: 10px; line-height: 1.4; }
        .combined-context-stats strong { color: #303a27; font-size: 13px; line-height: 1.35; }
        .combined-context-habitats { display: grid; gap: 7px; }
        .combined-context-habitats > div { display: flex; flex-wrap: wrap; gap: 6px; }
        .combined-context-habitats > div > span { padding: 5px 8px; border-radius: 99px; background: #e9eadf; color: #596548; font-size: 10px; }
        .combined-context-note { margin: 0; color: #817b6e; font-size: 10px; line-height: 1.5; }
        @media (max-width: 380px) { .combined-context-heading { align-items: flex-start; flex-direction: column; } }
        .nearby-species-list { display: grid; gap: 0; margin-top: 4px; }
        .nearby-species-card { border-bottom: 1px solid #e6dfd1; }
        .nearby-species-row { display: flex; width: 100%; min-width: 0; align-items: center; gap: 12px; padding: 12px 0; }
        .nearby-species-photo-button { position: relative; display: block; flex: 0 0 64px; width: 64px; height: 64px; padding: 0; border: 0; overflow: hidden; border-radius: 10px; background: #e8eadf; cursor: zoom-in; }
        .nearby-species-photo-button > img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .nearby-photo-expand-hint { position: absolute; right: 4px; bottom: 4px; display: grid; place-items: center; width: 23px; height: 23px; border-radius: 7px; background: rgba(38, 47, 31, .82); color: #fffdf8; opacity: .92; }
        .nearby-species-thumb { display: grid; flex: 0 0 64px; place-items: center; width: 64px; height: 64px; border-radius: 10px; color: #687454; background: #e8eadf; }
        .nearby-species-trigger { display: flex; flex: 1; min-width: 0; align-items: center; gap: 12px; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
        .nearby-species-trigger:focus-visible, .nearby-species-photo-button:focus-visible { outline: 2px solid #78865b; outline-offset: 3px; border-radius: 8px; }
        .nearby-species-main { display: flex; flex: 1; min-width: 0; flex-direction: column; align-items: flex-start; gap: 3px; }
        .nearby-species-main .rarity { font-size: 9px; line-height: 1.4; }
        .nearby-species-main > strong { max-width: 100%; overflow-wrap: anywhere; color: #303a27; font-size: 14px; line-height: 1.3; }
        .nearby-species-main > em { max-width: 100%; overflow-wrap: anywhere; color: #817b6e; font-size: 11px; font-style: normal; line-height: 1.35; }
        .nearby-species-main > small { color: #817b6e; font-size: 10px; }
        .nearby-priority-label { display: inline-flex; margin-top: 2px; padding: 3px 7px; border-radius: 99px; background: #e9eadf; color: #596548; font-size: 9px; font-weight: 700; }
        .nearby-species-chevron { flex: 0 0 auto; color: #596548; transition: transform .18s ease; }
        .nearby-species-trigger[aria-expanded="true"] .nearby-species-chevron { transform: rotate(90deg); }
        .nearby-species-details { display: grid; gap: 10px; margin: 0 0 12px 76px; padding: 12px; border: 1px solid #e6dfd1; border-radius: 12px; background: #fffdf8; }
        .nearby-species-details > div { display: grid; gap: 3px; min-width: 0; }
        .nearby-species-details > div > span { color: #817b6e; font-size: 10px; }
        .nearby-species-details > div > strong { overflow-wrap: anywhere; color: #303a27; font-size: 12px; font-weight: 650; }
        .nearby-species-details > p { margin: 0; color: #817b6e; font-size: 11px; line-height: 1.45; }
        .nearby-species-details > a, .nearby-detail-photo-link { display: inline-flex; align-items: center; gap: 5px; justify-self: start; color: #586548; font-size: 11px; font-weight: 750; text-decoration: none; }
        .nearby-detail-photo-link { width: fit-content; padding: 0; border: 0; background: transparent; cursor: zoom-in; }
        .nearby-photo-lightbox { position: fixed; z-index: 2200; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(20, 25, 18, .82); backdrop-filter: blur(5px); }
        .nearby-photo-lightbox-panel { position: relative; display: flex; flex-direction: column; width: min(100%, 760px); max-height: min(92vh, 900px); overflow: hidden; border-radius: 16px; background: #fffdf8; box-shadow: 0 22px 80px rgba(0,0,0,.3); }
        .nearby-photo-lightbox-panel > img { display: block; width: 100%; max-height: 70vh; object-fit: contain; background: #171a15; }
        .nearby-photo-lightbox-close { position: absolute; z-index: 1; top: 10px; right: 10px; display: grid; place-items: center; width: 38px; height: 38px; padding: 0; border: 1px solid rgba(255,255,255,.5); border-radius: 50%; background: rgba(33,40,28,.85); color: #fffdf8; cursor: pointer; }
        .nearby-photo-lightbox-caption { display: grid; gap: 4px; padding: 14px 16px 16px; }
        .nearby-photo-lightbox-caption > strong { color: #303a27; font-size: 15px; font-style: italic; }
        .nearby-photo-lightbox-caption > span { color: #687454; font-size: 12px; }
        .nearby-photo-lightbox-caption > small { color: #817b6e; font-size: 10px; line-height: 1.5; }
        @media (max-width: 380px) { .nearby-species-details { margin-left: 0; } .nearby-species-photo-button, .nearby-species-thumb { flex-basis: 56px; width: 56px; height: 56px; } .nearby-photo-lightbox { padding: 10px; } }
        .background-toast { position: fixed; z-index: 1000; left: 50%; bottom: 88px; transform: translateX(-50%); width: min(92vw, 390px); display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 14px; background: #343e2a; color: #fffdf8; box-shadow: 0 8px 26px rgba(0,0,0,.22); font-size: 13px; line-height: 1.4; }
        .explore-background-toast { animation: explore-toast-dismiss 4s ease forwards; }
        @keyframes explore-toast-dismiss { 0%, 78% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; visibility: hidden; pointer-events: none; transform: translate(-50%, 8px); } }
        .background-toast button { flex: 0 0 auto; display: grid; place-items: center; border: 0; background: transparent; color: inherit; padding: 4px; }
        /* Remove the translucent circular decoration covering compendium photos. */
        .species-photo::before,
        .species-photo::after {
          content: none !important;
          display: none !important;
        }
        .species-photo img {
          opacity: 1 !important;
          filter: none !important;
        }
        /* Compendium: horizontal, swipeable card shelf instead of a long vertical grid. */
        .compendium-species-scroll { display: flex !important; flex-wrap: nowrap; gap: 12px; overflow-x: auto; overflow-y: hidden; padding: 2px 2px 14px; margin: 0 -2px; scroll-snap-type: x proximity; overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: #a4ac86 transparent; }
        .compendium-species-scroll .species-card { flex: 0 0 min(72%, 260px); width: min(72%, 260px); min-width: 0; scroll-snap-align: start; }
        .compendium-species-scroll .species-photo { height: 174px; }
        @media (min-width: 700px) { .compendium-species-scroll .species-card { flex-basis: 250px; width: 250px; } }
      `}</style>

    </main>

  );

}
