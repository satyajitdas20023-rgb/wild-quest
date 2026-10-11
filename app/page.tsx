



'use client'



import { useCallback, useEffect, useRef, useState } from 'react'

import {

  ArrowRight,

  Award,

  Bell,


  BookOpen,

  Camera,

  ChevronRight,

  CircleHelp,

  Compass,

  Fish,

  Flower2,

  Footprints,


  Leaf,

  MapPin,

  Menu,


  MoreHorizontal,

  Search,

  Sparkles,

  Star,

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

    <section className="section-block collection-strip"><div className="section-heading"><div><p className="eyebrow">YOUR COMPENDIUM</p><h2>Recently added</h2></div><button className="text-link" onClick={() => onTab('collection')}>Open compendium <ArrowRight size={15} /></button></div><div className="mini-row">{recentItems.map((item) => <button className="mini-card" key={item.name} onClick={() => onTab('collection')}><img src={item.image} alt={item.name} /><span>{item.name}</span></button>)}</div></section>

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
    const isPreview = summaryEntry.id.startsWith('preview-')
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
      {isPreview && <div className="quest-preview-banner">DEVELOPMENT PREVIEW · This sample is not saved to Quest History.</div>}
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
        <button className="cream-button" onClick={() => { onDismissSummary(); setView('current'); if (!(isPreview && session.active)) onStart() }}>{isPreview && session.active ? 'Return to active quest' : 'Start another quest'} <ArrowRight size={15} /></button>
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
    {/* TEMPORARY QA SHORTCUT: remove this block after testing the completion screen. */}
    
  </div>
}

function Explore({ onOpen }: { onOpen: (kind: string) => void }) { return <div className="screen"><div className="page-title"><p className="eyebrow">DEMONSTRATION EXPLORATION</p><h1>Look a little closer.</h1><p>Recommendations are examples, not verified live sightings.</p></div><div className="searchbox"><Search size={18} /><span>Search a species or habitat</span></div><div className="filter-row"><button className="filter active">All habitats</button><button className="filter">Woodland</button><button className="filter">Coastal</button></div><div className="map-card"><div className="map-art"><span className="map-label one">Woodland edge</span><span className="map-label two">Harbourside</span><div className="map-pin"><MapPin size={18} /></div></div><div className="map-footer"><div><strong>Places to explore</strong><span><MapPin size={13} /> Bristol, UK · demonstration</span></div><button className="outline-button" onClick={() => onOpen('location')}>Change</button></div></div><div className="section-heading compact"><div><p className="eyebrow">SUITABLE HABITATS</p><h2>Where should I look?</h2></div><button className="icon-button"><MoreHorizontal size={19} /></button></div>{species.slice(0, 3).map((item) => <div className="habitat-row" key={item.name}><img src={item.image} alt="" /><div><span className="rarity">{item.rarity.toUpperCase()} · {item.points} PTS</span><h3>{item.name}</h3><p>{item.category} · Suitable habitat nearby</p></div><ChevronRight size={17} /></div>)}</div> }



function formatFoundDate(value: string) {
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function Compendium({ onOpen, items }: { onOpen: (kind: string, item?: SpeciesItem) => void; items: SpeciesItem[] }) { const [query, setQuery] = useState(''); const shown = items.filter((s) => `${s.name} ${s.latin} ${s.category}`.toLowerCase().includes(query.toLowerCase())); const acceptedPoints = items.filter((item) => item.status !== 'Demonstration entry' && item.identificationStatus !== 'pending' && item.identificationStatus !== 'failed').reduce((total, item) => total + item.points, 0); const discoveriesThisMonth = items.filter((item) => item.dateFound && new Date(item.dateFound).getMonth() === new Date().getMonth() && new Date(item.dateFound).getFullYear() === new Date().getFullYear()).length; return <div className="screen"><div className="page-title collection-title"><div><p className="eyebrow">YOUR FIELD GUIDE</p><h1>Compendium</h1></div><div className="collection-count"><strong>{items.length}</strong><span>species entries</span></div></div><div className="collection-stats"><div><strong>{acceptedPoints}</strong><span>recorded points</span></div><div><strong>{items.length}</strong><span>field notes</span></div><div><strong>{discoveriesThisMonth}</strong><span>added this month</span></div></div><div className="searchbox"><Search size={18} /><input aria-label="Search compendium" placeholder="Search species" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="filter-row"><button className="filter active">All</button><button className="filter">Birds</button><button className="filter">Plants</button><button className="filter">Insects</button></div><div className="species-grid">{shown.map((item) => <button className={`species-card rarity-${item.rarity.toLowerCase().replace(' ', '-')}`} key={item.name} onClick={() => onOpen('species', item)}><div className="species-photo"><img src={item.image} alt={item.name} /><span className="species-points">{item.identificationStatus === 'pending' ? 'Identifying…' : item.identificationStatus === 'failed' ? 'Retry needed' : item.identificationStatus === 'corrected' ? 'Corrected' : item.status?.startsWith('AI suggestion') ? (item.points > 0 ? `Review · +${item.points} pts` : 'Needs review') : item.status && item.status !== 'Demonstration entry' ? 'Needs review' : `+${item.points} pts`}</span></div><div className="species-copy"><strong>{item.name}</strong><em>{item.latin}</em></div><div className="species-meta"><span className="species-category">{item.identificationStatus === 'pending' ? 'Processing' : item.identificationStatus === 'failed' ? 'Identification failed' : item.identificationStatus === 'corrected' ? 'User corrected' : item.status && item.status !== 'Demonstration entry' ? 'Needs review' : item.status === 'Demonstration entry' ? 'Demo' : item.category}</span><span className="species-rarity">{item.rarity}</span></div>{item.dateFound ? <p style={{ padding: '0 12px 12px', margin: 0, fontSize: 12, color: '#656d4a' }}>Found: {formatFoundDate(item.dateFound)}</p> : item.status === 'Demonstration entry' ? <p style={{ padding: '0 12px 12px', margin: 0, fontSize: 12, color: '#936639' }}>Demonstration entry</p> : null}</button>)}</div></div> }



function Community() { return <div className="screen"><div className="page-title"><p className="eyebrow">THE WILD AROUND US</p><h1>Community</h1><p>Shared discoveries from a demonstration community.</p></div><div className="leaderboard-card"><div className="leader-head"><div><span className="eyebrow light">THIS WEEK</span><h2>Field notes leaderboard</h2></div><Trophy size={25} /></div><div className="leader-row you"><span className="rank">01</span><span className="community-avatar">AM</span><div><strong>Alex Morgan <small>YOU</small></strong><span>12 species discovered</span></div><b>65 pts</b></div>{['Maya Chen', 'Theo Williams', 'Samira Patel'].map((name, i) => <div className="leader-row" key={name}><span className="rank">0{i + 2}</span><span className="community-avatar muted">{name.split(' ').map(n => n[0]).join('')}</span><div><strong>{name} <small>DEMO</small></strong><span>{10 - i * 2} species discovered</span></div><b>{58 - i * 11} pts</b></div>)}</div><div className="section-heading compact"><div><p className="eyebrow">FROM THE COMMUNITY</p><h2>Recent discoveries</h2></div><button className="icon-button"><MoreHorizontal size={19} /></button></div><div className="community-grid">{species.slice(0, 3).map((item) => <div className="community-photo" key={item.name}><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><span>Shared by demo explorer</span></div></div>)}</div></div> }




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
    {isPending && <p className="modal-text" role="status">Gemini is still identifying this photo. You can close this entry and keep exploring; the result will update here when ready.</p>}
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

  function previewQuestSummary() {
    const endedAt = Date.now()
    const startedAt = endedAt - 42 * 60 * 1000
    const previewItems = compendium.filter((item) => item.identificationStatus !== 'pending' && item.identificationStatus !== 'failed').slice(0, 3)
    const chosenItems = previewItems.length ? previewItems : species.slice(0, 3)
    const discoveries = chosenItems.map((item) => item.name)
    const discoveryKeys = chosenItems.map((item) => speciesTaxonKey(item.name, item.latin))
    const discoveryPointAwards = Object.fromEntries(discoveryKeys.map((key) => [key, pointsForSpeciesKey(key)]))
    const steps = 3260
    const entry: QuestHistoryEntry = {
      id: `preview-${endedAt}`,
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      steps,
      points: Math.min(MAX_QUEST_POINTS, walkingPoints(steps) + Object.values(discoveryPointAwards).reduce((total, value) => total + value, 0)),
      discoveries,
      discoveryKeys,
      discoveryPointAwards,
      location: questSession.location,
      routePoints: 18,
      distanceMeters: 2400,
      endReason: 'manual',
    }
    // Preview-only data: deliberately not inserted into questHistory/localStorage.
    setQuestCompletion(entry)
    setTab('quests')
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
      latin: 'Gemini is processing this photo',
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
    // of the Gemini request so users aren't held up by either operation.
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
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Gemini could not identify this photo.')

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
        // Do not overwrite a correction the user made while Gemini was processing.
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
      console.error('Background identification failed:', message)
      setBackgroundNotice('Photo saved, but identification failed. You can correct it in Compendium.')
    }
  }



  return (



    <main className="app-shell">

      <div className="phone-frame">

        <Header onProfile={() => setProfile(true)} />

        {backgroundNotice && <div className="background-toast" role="status"><span>{backgroundNotice}</span><button type="button" onClick={() => setBackgroundNotice('')} aria-label="Dismiss message"><X size={16} /></button></div>}



        {tab === 'home' && <Home onTab={setTab} onOpen={openModal} items={compendium} session={questSession} />}

        {tab === 'quests' && <Quests session={questSession} history={questHistory} stepStatus={stepStatus} locationStatus={locationStatus} items={compendium} summaryEntry={questCompletion} onStart={startQuest} onEnd={endQuest} onEnableSteps={enableStepTracking} onDismissSummary={() => setQuestCompletion(null)}/>}

        {tab === 'explore' && <Explore onOpen={openModal} />}

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
        .quest-preview-banner { margin-bottom: 12px; border: 1px dashed #a47c4d; border-radius: 10px; padding: 9px 11px; background: #f5eddd; color: #815b32; font-size: 11px; font-weight: 700; letter-spacing: .04em; }
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
        .quest-preview-shortcut .outline-button { width: 100%; border-style: dashed; font-size: 11px; }
        .quest-session-card { margin-top: 18px; }
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
        .background-toast { position: fixed; z-index: 1000; left: 50%; bottom: 88px; transform: translateX(-50%); width: min(92vw, 390px); display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 14px; background: #343e2a; color: #fffdf8; box-shadow: 0 8px 26px rgba(0,0,0,.22); font-size: 13px; line-height: 1.4; }
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
      `}</style>

    </main>

  );

}
