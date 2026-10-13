



'use client'




import { useCallback, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Camera as CapacitorCamera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera'

import {

  ArrowRight,

  Award,

  Bird,
  Binoculars,
  CalendarDays,
  ChevronLeft,


  BookOpen,

  Camera,

  ChevronRight,


  Compass,

  Fish,
  Expand,


  Footprints,


  Leaf,

  MapPin,




  RefreshCw,

  Search,

  Sparkles,


  Target,

  Trophy,

  UserRound,

  Waves,

  X,

} from 'lucide-react'



const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000').replace(/\/+$/, '')

type Tab = 'home' | 'quests' | 'explore' | 'collection' | 'community'

type SpeciesObservation = {
  id?: string
  dateFound?: string
  locationFound?: string
  notes?: string
  image?: string
  status?: string
}

type SpeciesItem = {
  observations?: SpeciesObservation[]
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

const quests = [

  { title: 'Wildlife Explorer', desc: 'Slow down, look closer, and discover the living world around you.', icon: Leaf, color: '#a4ac86', image: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=85', progress: '65 / 150 pts', habitats: 'Woodland · Meadows · Wetlands' },

  { title: 'Fishing Mode', desc: 'Explore freshwater edges and coastal waters with care.', icon: Fish, color: '#8fa59a', image: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?auto=format&fit=crop&w=900&q=85', progress: '20 / 50 pts', habitats: 'Rivers · Lakes · Coast' },

  { title: 'Beach Mode', desc: 'Find small wonders where the land meets the tide.', icon: Waves, color: '#d5b78b', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85', progress: '0 / 50 pts', habitats: 'Tidal pools · Rocky shores' },

  { title: 'Zoo Mode', desc: 'A considered way to discover animals in a selected zoo.', icon: Compass, color: '#b19a7e', image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=900&q=85', progress: '40 / 150 pts', habitats: 'Rainforest House · Savannah' },

]



function Header({ onProfile }: { onProfile: () => void }) {
  return <header className="topbar">
    <div className="brand"><span className="brand-mark"><Leaf size={17} strokeWidth={2.5} /></span><span>WildQuest</span></div>
    <div className="header-actions"><button className="avatar" onClick={onProfile} aria-label="Open dev_sj profile" title="Open dev_sj profile">DS</button></div>
  </header>
}



function Home({ onTab, onOpen, items, session }: { onTab: (tab: Tab) => void; onOpen: (kind: string) => void; items: SpeciesItem[]; session: QuestSession }) {
  const recentItems = items.filter((item) => item.status !== 'Demonstration entry' && item.identificationStatus !== 'failed')
    .slice(0, 3)
  const [greeting, setGreeting] = useState('Welcome back')
  const [dateLabel, setDateLabel] = useState('YOUR FIELD ADVENTURE')

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')
    setDateLabel(now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase())
  }, [])

  const activePoints = session.active ? sessionPoints(session) : 0
  const activeRank = activePoints >= 300 ? 'NATURE GUARDIAN' : activePoints >= 150 ? 'WILD EXPLORER' : activePoints >= 50 ? 'TRAIL SCOUT' : 'FIELD SESSION'
  const activePercent = Math.min(100, (activePoints / MAX_QUEST_POINTS) * 100)

  return <div className="screen">
    <section className="intro"><p className="eyebrow">{dateLabel}</p><h1>{greeting}, explorer.</h1><div className="location"><MapPin size={14} />{session.location ? ` ${session.location.latitude.toFixed(4)}, ${session.location.longitude.toFixed(4)} · GPS` : session.active ? ' Waiting for GPS location' : ' Location tracked during a quest'}</div></section>

    <section className="progress-card"><div className="progress-top"><div><span className="eyebrow light">{session.active ? 'ACTIVE FIELD QUEST' : 'YOUR NEXT ADVENTURE'}</span><h2>{activePoints} <small>/ {MAX_QUEST_POINTS} pts</small></h2></div><div className="difficulty">{session.active ? activeRank : 'NOT STARTED'} <ChevronRight size={14} /></div></div><div className="progress-track"><span style={{ width: `${activePercent}%` }} /></div><div className="progress-bottom"><span>{Math.max(0, MAX_QUEST_POINTS - activePoints)} points to Nature Guardian</span><span>{session.active ? `${session.steps.toLocaleString()} steps` : 'Start to begin tracking'}</span></div></section>

    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">KEEP EXPLORING</p><h2>Continue your quest</h2></div><button className="text-link" onClick={() => onTab('quests')}>View all <ArrowRight size={15} /></button></div><div className="active-quest"><img src={quests[0].image} alt="Sunlight through a green woodland" /><div className="quest-overlay"><span className="pill">{session.active ? 'ACTIVE QUEST' : 'FIELD ADVENTURE'}</span><h3>{session.active ? 'Your field session' : 'Ready to explore?'}</h3><p>{session.active ? `${session.discoveries.length} unique species · ${session.steps.toLocaleString()} steps` : 'Start one quest and let your progress build as you walk and discover species.'}</p><button className="cream-button" onClick={() => onTab('quests')}>{session.active ? 'Continue quest' : 'Start a quest'} <ArrowRight size={15} /></button></div></div></section>

    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">CAPTURE A MOMENT</p><h2>Make a discovery</h2></div></div><div className="action-grid"><button className="action-card" onClick={() => onOpen('photo')}><span className="action-icon sage"><Camera size={21} /></span><span><strong>Photograph</strong><small>Identify a species</small></span><ArrowRight size={16} /></button></div></section>

    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">LOCAL BIODIVERSITY</p><h2>Explore nearby species</h2></div><button className="text-link" onClick={() => onTab('explore')}>Open Explore <ArrowRight size={15} /></button></div><div className="active-quest home-explore-banner"><img src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1100&q=85" alt="Wild deer in a green woodland" onError={(event) => { event.currentTarget.style.opacity = '0.25' }} /><div className="quest-overlay"><span className="pill">EXPLORE LOCAL WILDLIFE</span><h3>Find what lives around you.</h3><p>Use your location to explore nearby birds, wild mammals, butterflies, reptiles and other wildlife supported by local records.</p><button className="cream-button" onClick={() => onTab('explore')}>Find nearby wildlife <ArrowRight size={15} /></button></div></div></section>

    <section className="section-block collection-strip"><div className="section-heading"><div><p className="eyebrow">YOUR COMPENDIUM</p><h2>Recently added</h2></div><button className="text-link" onClick={() => onTab('collection')}>Open compendium <ArrowRight size={15} /></button></div>{recentItems.length ? <div className="mini-row">{recentItems.map((item, index) => <button className="mini-card" key={item.id ?? `${normalizeTaxonText(item.name)}-${index}`} onClick={() => onTab('collection')}><img src={item.image} alt={item.name} /><span>{item.name}</span></button>)}</div> : <div className="home-compendium-empty"><BookOpen size={18} /><span>Your discovered animals will appear here.</span><button className="text-link" onClick={() => onTab('collection')}>Open Compendium <ArrowRight size={14} /></button></div>}</section>
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
  taxonClass?: string
  taxonOrder?: string
  taxonFamily?: string
  distanceKm?: number
  isInsect?: boolean
  isCoastalWildlife?: boolean
  recommendationReason?: string
  whereToLook?: string
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

type ExploreServiceStatus = 'waiting' | 'running' | 'success' | 'failed' | 'fallback' | 'skipped' | 'partial'
type ExploreSourceChecks = {
  hasRun: boolean
  esaStatus: ExploreServiceStatus
  gbifStatus: ExploreServiceStatus
  gemmaStatus: ExploreServiceStatus
  candidatePoolCount: number
  recordsFetched: number
  gemmaCandidateCount: number
  gemmaReturnedCount: number
  gemmaDisplayedCount: number
  modelName: string
  coastalLocation: boolean | null
  rankingMode: string
  partialGbif: boolean
}

function friendlyPriorityLabel(label?: string) {
  if (!label) return ''
  const value = label.toLocaleLowerCase()
  if (value.includes('few records')) return 'Less often recorded nearby'
  if (value.includes('coastal') || value.includes('marine-linked')) return 'Coastal wildlife'
  return label
}

const worldCoverColors: Record<number, string> = {
  10: '#587b4e', 20: '#a7a86f', 30: '#c6ce8b', 40: '#d7b85c', 50: '#9b7770',
  60: '#c8b9a1', 70: '#d8e5e7', 80: '#83b7c7', 90: '#6d9c8b', 95: '#4d8377', 100: '#a8b58c',
}

type EventSpeciesTarget = {
  id: string
  name: string
  scientificName: string
  wikiTitle: string
  group: 'Bird' | 'Mammal'
}

type ExploreEventReadMore = {
  heading: string
  intro: string
  birdEstimate: string
  speciesEstimate: string
  whyTheyCome: string
  wetlandImportance: string
  threats: { title: string; description: string }[]
  visitorActions: string[]
  sources: { label: string; url: string }[]
}

type ExploreEvent = {
  id: string
  title: string
  quote: string
  eyebrow: string
  destination: string
  season: string
  summary: string
  heroWikiTitle: string
  heroImage: string
  heroFallback: string
  accent: string
  species: EventSpeciesTarget[]
  sourceUrl: string
  sourceLabel: string
  readMore?: ExploreEventReadMore
}

// Keep events data-driven: future event pages can be added by appending another
// object here, with its own target list and hero details. Chilika target species
// are examples documented by Odisha Tourism, not guarantees of current sightings.
const EXPLORE_EVENTS: ExploreEvent[] = [
  {
    id: 'chilika-migration',
    title: 'The Great Winged Passage',
    quote: 'Some journeys are measured in miles. Others are written across the sky.',
    eyebrow: 'SEASONAL FIELD EVENT',
    destination: 'Chilika Lake · Odisha, India',
    season: 'Winter · November to February',
    summary: 'Follow the winter arrival of waterbirds across shimmering lagoon, reed beds and open mudflats. Look closely, move gently, and see how many travellers you can recognise.',
    heroWikiTitle: 'Chilika Lake',
    heroImage: 'https://odishatourism.gov.in/content/dam/tourism/home/chilka-bird-festival/gallery/Chilika%20Birds%20%286%29.jpg',
    heroFallback: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85',
    accent: '#b7d4a0',
    sourceUrl: 'https://odishatourism.gov.in/en/national-chilika-bird-festival',
    sourceLabel: 'Odisha Tourism · National Chilika Bird Festival',
    readMore: {
      heading: 'A winter refuge written across the sky',
      intro: 'Every winter, Chilika becomes a stopping place for birds travelling long distances from Arctic regions, Central Asia and other parts of the northern hemisphere. The lagoon is not just a beautiful view: it is a place to rest, feed and build up energy before the next leg of a seasonal journey.',
      birdEstimate: 'Nearly 1 million',
      speciesEstimate: '200+ bird species',
      whyTheyCome: 'As temperatures drop farther north, migratory birds move towards milder wintering grounds. Chilika offers a rich mixture of shallow water, mudflats, marshes, reed beds and open lagoon where different birds can forage on fish, small aquatic animals, invertebrates and plant material. Different species use different parts of this changing wetland.',
      wetlandImportance: 'Chilika is a brackish-water lagoon and a wetland of international importance. Its connected habitats support migratory and resident birds, fisheries and local livelihoods. Protecting the lagoon means protecting the feeding and resting places that make the migration possible.',
      threats: [
        { title: 'Hunting and disturbance', description: 'Illegal hunting and people getting too close can injure birds or interrupt feeding and resting, especially when they are gathered in large flocks.' },
        { title: 'Pollution and declining water quality', description: 'Waste and polluted water can harm the wetland food web that birds depend on.' },
        { title: 'Siltation and habitat change', description: 'Sediment build-up and changes to the lagoon can alter the shallow-water and mudflat habitats used by feeding birds.' },
        { title: 'Invasive weed growth', description: 'Excessive weed growth can change open-water and wetland habitat, affecting how wildlife uses the lagoon.' },
      ],
      visitorActions: [
        'Watch quietly from a respectful distance; never chase, surround or flush a flock into flight.',
        'Do not feed birds or use flash close to wildlife. Keep noise low and follow the guide’s directions.',
        'Stay in permitted routes and boats, keep litter with you, and avoid nesting or roosting areas.',
        'Report suspected hunting or wildlife harm to local authorities rather than confronting anyone yourself.',
      ],
      sources: [
        { label: 'Odisha Tourism · National Chilika Bird Festival', url: 'https://odishatourism.gov.in/en/national-chilika-bird-festival' },
        { label: 'Ramsar Advisory Mission · Chilika Lake', url: 'https://rsis.ramsar.org/RISapp/files/RAM/RAM_050_IN_en.pdf' },
        { label: 'Chilika Development Authority · Environment', url: 'https://www.chilika.com/environments.php' },
      ],
    },
    species: [
      { id: 'greater-flamingo', name: 'Greater Flamingo', scientificName: 'Phoenicopterus roseus', wikiTitle: 'Greater flamingo', group: 'Bird' },
      { id: 'black-tailed-godwit', name: 'Black-tailed Godwit', scientificName: 'Limosa limosa', wikiTitle: 'Black-tailed godwit', group: 'Bird' },
      { id: 'grey-headed-lapwing', name: 'Grey-headed Lapwing', scientificName: 'Vanellus cinereus', wikiTitle: 'Grey-headed lapwing', group: 'Bird' },
      { id: 'greater-painted-snipe', name: 'Greater Painted-snipe', scientificName: 'Rostratula benghalensis', wikiTitle: 'Greater painted-snipe', group: 'Bird' },
      { id: 'eurasian-wigeon', name: 'Eurasian Wigeon', scientificName: 'Mareca penelope', wikiTitle: 'Eurasian wigeon', group: 'Bird' },
      { id: 'northern-shoveler', name: 'Northern Shoveler', scientificName: 'Spatula clypeata', wikiTitle: 'Northern shoveler', group: 'Bird' },
      { id: 'gadwall', name: 'Gadwall', scientificName: 'Mareca strepera', wikiTitle: 'Gadwall', group: 'Bird' },
      { id: 'ruff', name: 'Ruff', scientificName: 'Calidris pugnax', wikiTitle: 'Ruff (bird)', group: 'Bird' },
      { id: 'ruddy-shelduck', name: 'Ruddy Shelduck', scientificName: 'Tadorna ferruginea', wikiTitle: 'Ruddy shelduck', group: 'Bird' },
      { id: 'common-teal', name: 'Common Teal', scientificName: 'Anas crecca', wikiTitle: 'Eurasian teal', group: 'Bird' },
      { id: 'eurasian-curlew', name: 'Eurasian Curlew', scientificName: 'Numenius arquata', wikiTitle: 'Eurasian curlew', group: 'Bird' },
      { id: 'curlew-sandpiper', name: 'Curlew Sandpiper', scientificName: 'Calidris ferruginea', wikiTitle: 'Curlew sandpiper', group: 'Bird' },
      { id: 'asian-dowitcher', name: 'Asian Dowitcher', scientificName: 'Limnodromus semipalmatus', wikiTitle: 'Asian dowitcher', group: 'Bird' },
      { id: 'pacific-golden-plover', name: 'Pacific Golden Plover', scientificName: 'Pluvialis fulva', wikiTitle: 'Pacific golden plover', group: 'Bird' },
      { id: 'brown-headed-gull', name: 'Brown-headed Gull', scientificName: 'Chroicocephalus brunnicephalus', wikiTitle: 'Brown-headed gull', group: 'Bird' },
      { id: 'oriental-darter', name: 'Oriental Darter', scientificName: 'Anhinga melanogaster', wikiTitle: 'Oriental darter', group: 'Bird' },
      { id: 'painted-stork', name: 'Painted Stork', scientificName: 'Mycteria leucocephala', wikiTitle: 'Painted stork', group: 'Bird' },
      { id: 'black-headed-ibis', name: 'Black-headed Ibis', scientificName: 'Threskiornis melanocephalus', wikiTitle: 'Black-headed ibis', group: 'Bird' },
      { id: 'spot-billed-pelican', name: 'Spot-billed Pelican', scientificName: 'Pelecanus philippensis', wikiTitle: 'Spot-billed pelican', group: 'Bird' },
      { id: 'oriental-pratincole', name: 'Oriental Pratincole', scientificName: 'Glareola maldivarum', wikiTitle: 'Oriental pratincole', group: 'Bird' },
      { id: 'great-knot', name: 'Great Knot', scientificName: 'Calidris tenuirostris', wikiTitle: 'Great knot', group: 'Bird' },
    ],
  },
]

function normalizeWikiTitle(value: string) {
  return value.replace(/_/g, ' ').trim().toLocaleLowerCase()
}

function ExploreEventCard({ event, onOpen }: { event: ExploreEvent; onOpen: (id: string) => void }) {
  const [heroImage, setHeroImage] = useState(event.heroImage)
  return <button className="event-featured-card" type="button" onClick={() => onOpen(event.id)} aria-label={`Open ${event.title} event`}>
    <img className="event-featured-image" src={heroImage} alt="Migratory birds flying over Chilika's wetlands" onError={() => setHeroImage(event.heroFallback)} />
    <span className="event-featured-shade" />
    <span className="event-featured-top"><span><CalendarDays size={13} /> {event.eyebrow}</span><span className="event-featured-live">FIELD CHECKLIST</span></span>
    <span className="event-featured-copy"><span className="event-featured-location"><MapPin size={13} /> {event.destination}</span><strong>{event.title}</strong><em>“{event.quote}”</em><span className="event-featured-bottom"><span>{event.season}</span><span className="event-featured-cta">Explore species <ArrowRight size={15} /></span></span></span>
  </button>
}

function ChilikaEventDetail({ event, onBack }: { event: ExploreEvent; onBack: () => void }) {
  const [photos, setPhotos] = useState<Record<string, string>>({})
  const [heroImage, setHeroImage] = useState(event.heroImage)
  const [photosLoading, setPhotosLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadPhotos() {
      setPhotosLoading(true)
      const titles = [event.heroWikiTitle, ...event.species.map((item) => item.wikiTitle)]
      try {
        const params = new URLSearchParams({
          action: 'query', format: 'json', prop: 'pageimages', piprop: 'thumbnail',
          pithumbsize: '700', redirects: '1', origin: '*', titles: titles.join('|'),
        })
        const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`)
        if (!response.ok) throw new Error('Could not load reference wildlife photos')
        const payload = await response.json() as {
          query?: {
            pages?: Record<string, { title?: string; thumbnail?: { source?: string } }>
            redirects?: Array<{ from: string; to: string }>
            normalized?: Array<{ from: string; to: string }>
          }
        }
        if (cancelled) return
        const pagePhotos = new Map<string, string>()
        for (const page of Object.values(payload.query?.pages ?? {})) {
          if (page.title && page.thumbnail?.source) pagePhotos.set(normalizeWikiTitle(page.title), page.thumbnail.source)
        }
        const canonical = new Map<string, string>()
        for (const item of [...(payload.query?.normalized ?? []), ...(payload.query?.redirects ?? [])]) {
          canonical.set(normalizeWikiTitle(item.from), item.to)
        }
        const resolvedPhoto = (title: string) => {
          const finalTitle = canonical.get(normalizeWikiTitle(title)) ?? title
          return pagePhotos.get(normalizeWikiTitle(finalTitle)) ?? pagePhotos.get(normalizeWikiTitle(title))
        }
        const nextPhotos: Record<string, string> = {}
        event.species.forEach((item) => {
          const photo = resolvedPhoto(item.wikiTitle)
          if (photo) nextPhotos[item.id] = photo
        })
        setPhotos(nextPhotos)
        const eventHero = resolvedPhoto(event.heroWikiTitle)
        if (eventHero) setHeroImage(eventHero)
      } catch {
        // Event cards remain usable if Wikipedia image lookup is offline.
      } finally {
        if (!cancelled) setPhotosLoading(false)
      }
    }
    void loadPhotos()
    return () => { cancelled = true }
  }, [event])

  return <div className="screen event-detail-screen">
    <button type="button" className="event-back-button" onClick={onBack}><ChevronLeft size={17} /> All Explore</button>
    <section className="event-detail-hero">
      <img src={heroImage} alt="Birds over a Chilika wetland" onError={() => setHeroImage(event.heroFallback)} />
      <span className="event-detail-hero-shade" />
      <div className="event-detail-hero-content">
        <span className="event-detail-kicker"><Bird size={14} /> {event.eyebrow} · ODISHA</span>
        <h1>{event.title}</h1>
        <p className="event-detail-quote">“{event.quote}”</p>
        <div className="event-detail-pills"><span><MapPin size={13} /> {event.destination}</span><span><CalendarDays size={13} /> {event.season}</span></div>
      </div>
    </section>
    <section className="event-intro-row">
      <div><p className="eyebrow">FOLLOW THE FLIGHT PATH</p><h2>A whole sky to discover.</h2></div>
      <p>{event.summary}</p>
    </section>
    <section className="event-checklist-section">
      <div className="event-checklist-heading"><div><p className="eyebrow">YOUR FIELD CHECKLIST</p><h2>Look for these travellers</h2><p>Compact cards. Keep your eyes on the lagoon, not your screen.</p></div><span className="event-count"><Bird size={15} /> {event.species.length} species</span></div>
      <div className="event-species-grid">
        {event.species.map((item) => <article className="event-species-card" key={item.id} title={`${item.name} · ${item.scientificName}`}>
          <div className="event-species-photo">
            {photos[item.id]
              ? <img src={photos[item.id]} alt={item.name} loading="lazy" />
              : <span className="event-species-photo-fallback"><Bird size={27} /></span>}
            <span className="event-species-group-icon"><Bird size={13} /></span>
          </div>
          <div className="event-species-name"><strong>{item.name}</strong><span>{item.group}</span></div>
        </article>)}
      </div>
      {photosLoading && <p className="event-photo-loading"><span /> Loading species reference photos…</p>}
      <p className="event-more-species">And many more to be discovered. This is a starter checklist, not a complete list of Chilika’s birdlife; which species you see depends on timing, habitat and conditions.</p>
      <p className="event-species-note">Photo references are illustrative. Species are documented around Chilika, but seasonal presence and sightings are never guaranteed. Observe from permitted areas and do not disturb wildlife.</p>
    </section>
    {event.readMore && <section className="event-readme-section" aria-label={`Read about ${event.destination} migration`}>
      <div className="event-readme-heading"><div><p className="eyebrow">READ THE STORY</p><h2>{event.readMore.heading}</h2></div><span className="event-readme-icon"><Waves size={20} /></span></div>
      <p className="event-readme-intro">{event.readMore.intro}</p>
      <div className="event-readme-stats">
        <div><span className="event-readme-stat-icon"><Bird size={17} /></span><strong>{event.readMore.birdEstimate}</strong><small>migratory birds in a winter season</small></div>
        <div><span className="event-readme-stat-icon"><Leaf size={17} /></span><strong>{event.readMore.speciesEstimate}</strong><small>species reported by Odisha Tourism</small></div>
      </div>
      <div className="event-readme-explainer-grid">
        <article className="event-readme-card"><span className="event-readme-card-icon"><Waves size={17} /></span><h3>Why do they come?</h3><p>{event.readMore.whyTheyCome}</p></article>
        <article className="event-readme-card"><span className="event-readme-card-icon"><Leaf size={17} /></span><h3>Why Chilika matters</h3><p>{event.readMore.wetlandImportance}</p></article>
      </div>
      <div className="event-readme-threats">
        <div className="event-readme-subheading"><span className="event-readme-card-icon"><Binoculars size={17} /></span><div><p className="eyebrow">THE RISKS</p><h3>What puts the birds at risk?</h3></div></div>
        <div className="event-readme-threat-grid">{event.readMore.threats.map((threat) => <article key={threat.title}><strong>{threat.title}</strong><p>{threat.description}</p></article>)}</div>
        <p className="event-readme-caveat">These are documented conservation pressures, not a live incident report. Their severity varies by location and season.</p>
      </div>
      <div className="event-readme-help">
        <div className="event-readme-subheading"><span className="event-readme-card-icon"><Binoculars size={17} /></span><div><p className="eyebrow">WATCH WITH CARE</p><h3>How visitors can help</h3></div></div>
        <ul>{event.readMore.visitorActions.map((action) => <li key={action}>{action}</li>)}</ul>
      </div>
      <div className="event-readme-sources"><span>Read from the source</span>{event.readMore.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ArrowRight size={12} /></a>)}</div>
    </section>}
    <section className="event-field-note"><span><Binoculars size={20} /></span><div><strong>Take only photographs. Leave only ripples.</strong><p>Early mornings are a good time to watch the wetlands wake up. Follow local guidance, keep a respectful distance, and avoid restricted sanctuary areas.</p></div></section>
    <div className="event-sources"><span>Field guide context</span><a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.sourceLabel} <ArrowRight size={13} /></a></div>
  </div>
}

function Explore({ items, onSearchStatusChange }: { items: SpeciesItem[]; onSearchStatusChange: (status: 'running' | 'finished') => void }) {
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('Finding your location…')
  const [unavailablePhotoKeys, setUnavailablePhotoKeys] = useState<string[]>([])
  const [fallbackPhotoUrls, setFallbackPhotoUrls] = useState<Record<string, { url: string; source: string; attribution: string }>>({})
  const photoLookupAttemptsRef = useRef<Set<string>>(new Set())
  const [seenNearbyTaxa, setSeenNearbyTaxa] = useState<Array<{ key: string; name: string; scientificName: string }>>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [nearbySpecies, setNearbySpecies] = useState<NearbySpecies[]>([])
  const [habitat, setHabitat] = useState<NearbyHabitat | null>(null)
  const [habitatError, setHabitatError] = useState('')
  const [locationLabel, setLocationLabel] = useState('Location not shared')
  const [gpsCoordinates, setGpsCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)
  const [expandedSpeciesKey, setExpandedSpeciesKey] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<{ url: string; scientificName: string; commonName: string; source?: string; attribution?: string } | null>(null)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [sourceChecks, setSourceChecks] = useState<ExploreSourceChecks>({
    hasRun: false, esaStatus: 'waiting', gbifStatus: 'waiting', gemmaStatus: 'waiting',
    candidatePoolCount: 0, recordsFetched: 0, gemmaCandidateCount: 0, gemmaReturnedCount: 0, gemmaDisplayedCount: 0,
    modelName: '', coastalLocation: null, rankingMode: '', partialGbif: false,
  })

  useEffect(() => {
    if (!photoPreview) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPhotoPreview(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [photoPreview])

  const requestPhotoFallback = useCallback(async (item: NearbySpecies, cardKey: string) => {
    if (photoLookupAttemptsRef.current.has(cardKey)) return
    photoLookupAttemptsRef.current.add(cardKey)
    try {
      const response = await fetch(`${API_BASE_URL}/explore/photo?scientificName=${encodeURIComponent(item.scientificName || item.name)}`)
      const payload = await response.json()
      if (response.ok && typeof payload.photo === 'string' && payload.photo.startsWith('https://')) {
        setFallbackPhotoUrls((current) => ({ ...current, [cardKey]: { url: payload.photo, source: String(payload.photoSource || 'Taxon reference photo'), attribution: String(payload.photoAttribution || '') } }))
      } else {
        setUnavailablePhotoKeys((current) => current.includes(cardKey) ? current : [...current, cardKey])
      }
    } catch (photoError) {
      console.info('Reference photo fallback unavailable for', item.scientificName, photoError)
      setUnavailablePhotoKeys((current) => current.includes(cardKey) ? current : [...current, cardKey])
    }
  }, [])

  // Look up a taxon reference photo only for currently displayed species that have
  // no GBIF image. This avoids making image requests for every unused candidate.
  useEffect(() => {
    nearbySpecies.forEach((item, index) => {
      const cardKey = item.key || `${item.scientificName}-${index}`
      if (!item.photo && !fallbackPhotoUrls[cardKey] && !unavailablePhotoKeys.includes(cardKey)) {
        void requestPhotoFallback(item, cardKey)
      }
    })
  }, [nearbySpecies, fallbackPhotoUrls, unavailablePhotoKeys, requestPhotoFallback])

  async function findWildlife(advanceToNext = false) {
    const previouslyShown = advanceToNext ? seenNearbyTaxa : []
    setError('')
    setMessage('')
    setHabitatError('')
    setHabitat(null)
    setNearbySpecies([])
    setUnavailablePhotoKeys([])
    setLoadingStage('Finding your location…')
    setSourceChecks({
      hasRun: true, esaStatus: 'running', gbifStatus: 'running', gemmaStatus: 'waiting',
      candidatePoolCount: 0, recordsFetched: 0, gemmaCandidateCount: 0, gemmaReturnedCount: 0, gemmaDisplayedCount: 0,
      modelName: '', coastalLocation: null, rankingMode: '', partialGbif: false,
    })
    if (!('geolocation' in navigator)) {
      setError('This browser does not support location. Try a modern browser or use manual location later.')
      setSourceChecks(current => ({ ...current, esaStatus: 'skipped', gbifStatus: 'skipped', gemmaStatus: 'skipped' }))
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
      setLoadingStage('Looking for wildlife and nearby habitats…')
      const habitatRequest = fetch(`${API_BASE_URL}/explore/habitat?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`)
        .then(async (response) => {
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.error || 'Could not retrieve ESA WorldCover habitat data.')
          return payload as NearbyHabitat
        })
      const speciesRequest = fetch(`${API_BASE_URL}/explore/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          existingSpecies: items.map((item) => ({ name: item.name, scientificName: item.latin })),
          previouslyShownSpecies: previouslyShown,
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
          setSourceChecks(current => ({ ...current, esaStatus: 'success' }))
        } else {
          const habitatMessage = habitatResult.reason instanceof Error ? habitatResult.reason.message : 'Could not retrieve ESA WorldCover habitat data. Check that Flask is running and rasterio is installed.'
          setHabitatError(habitatMessage)
          setSourceChecks(current => ({ ...current, esaStatus: 'failed' }))
        }

        if (speciesResult.status === 'fulfilled') {
          const payload = speciesResult.value
          // GBIF returns a diverse candidate pool (up to 30); the visible UI is always capped at five.
          const candidateResponse = (Array.isArray(payload.candidates) ? payload.candidates as NearbySpecies[] : Array.isArray(payload.species) ? payload.species as NearbySpecies[] : [])
          const seenIdentities = new Set(previouslyShown.flatMap((item) => [item.key, item.scientificName.trim().toLowerCase()]).filter(Boolean))
          const candidates = candidateResponse.filter((item) => {
            if (!advanceToNext) return true
            const key = String(item.key || '')
            const scientificName = String(item.scientificName || '').trim().toLowerCase()
            return !seenIdentities.has(key) && !seenIdentities.has(scientificName)
          }).slice(0, 30)
          let displayedRecords = candidates.slice(0, 5)
          setSourceChecks(current => ({
            ...current,
            gbifStatus: candidates.length ? (payload.partialResults ? 'partial' : 'success') : 'success',
            candidatePoolCount: candidates.length,
            recordsFetched: Number(payload.recordsFetched) || 0,
            coastalLocation: typeof payload.coastalLocation === 'boolean' ? payload.coastalLocation : null,
            rankingMode: typeof payload.rankingMode === 'string' ? payload.rankingMode : '',
            partialGbif: Boolean(payload.partialResults),
            gemmaStatus: candidates.length && habitatResult.status === 'fulfilled' ? 'running' : 'skipped',
          }))

          if (candidates.length > 0 && habitatResult.status === 'fulfilled') {
            setLoadingStage('Choosing wildlife for you…')
            try {
              const recommendationResponse = await fetch(`${API_BASE_URL}/explore/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  coastalLocation: Boolean(payload.coastalLocation),
                  habitat: habitatResult.value,
                  species: candidates.map((item) => ({
                    key: item.key,
                    name: item.name,
                    scientificName: item.scientificName,
                    observedAt: item.observedAt,
                    nearbyRecordCount: item.nearbyRecordCount,
                    priorityLabel: item.priorityLabel,
                    taxonGroup: item.taxonGroup,
                    taxonClass: item.taxonClass,
                    taxonOrder: item.taxonOrder,
                    taxonFamily: item.taxonFamily,
                    distanceKm: item.distanceKm,
                    isInsect: item.isInsect,
                    isCoastalWildlife: item.isCoastalWildlife,
                  })),
                }),
              })
              const recommendationPayload = await recommendationResponse.json()
              if (!recommendationResponse.ok) throw new Error(recommendationPayload.error || 'Gemma recommendation request failed.')
              const byScientificName = new Map(candidates.map((item) => [item.scientificName.trim().toLowerCase(), item]))
              const ranked: NearbySpecies[] = []
              if (Array.isArray(recommendationPayload.recommendations)) {
                for (const recommendation of recommendationPayload.recommendations) {
                  if (!recommendation || typeof recommendation.scientificName !== 'string') continue
                  const candidate = byScientificName.get(recommendation.scientificName.trim().toLowerCase())
                  if (candidate && !ranked.some((item) => item.scientificName.trim().toLowerCase() === candidate.scientificName.trim().toLowerCase())) {
                    ranked.push({
                      ...candidate,
                      recommendationReason: typeof recommendation.reason === 'string' ? recommendation.reason : undefined,
                      whereToLook: typeof recommendation.whereToLook === 'string' ? recommendation.whereToLook.trim() : undefined,
                    })
                  }
                }
              }
              if (ranked.length > 0) {
                const rankedNames = new Set(ranked.map((item) => item.scientificName.trim().toLowerCase()))
                const rankedThenFallback = [
                  ...ranked,
                  ...candidates
                    .filter((item) => !rankedNames.has(item.scientificName.trim().toLowerCase()))
                    .map((item) => ({ ...item, recommendationReason: 'Included from nearby GBIF records to preserve taxonomic diversity; this species was not selected by Gemma in its returned ranking.' })),
                ]
                // Enforce diversity after the model call too: take one per taxonomic
                // group first, then fill any remaining slots if the pool is narrow.
                const diversified: NearbySpecies[] = []
                const seenGroups = new Set<string>()
                const seenScientificNames = new Set<string>()
                for (const candidate of rankedThenFallback) {
                  const scientificKey = candidate.scientificName.trim().toLowerCase()
                  const groupKey = (candidate.taxonGroup || 'Other animals').trim().toLowerCase()
                  if (seenScientificNames.has(scientificKey) || seenGroups.has(groupKey)) continue
                  diversified.push(candidate)
                  seenScientificNames.add(scientificKey)
                  seenGroups.add(groupKey)
                  if (diversified.length >= 5) break
                }
                if (diversified.length < 5) {
                  for (const candidate of rankedThenFallback) {
                    const scientificKey = candidate.scientificName.trim().toLowerCase()
                    if (seenScientificNames.has(scientificKey)) continue
                    diversified.push(candidate)
                    seenScientificNames.add(scientificKey)
                    if (diversified.length >= 5) break
                  }
                }
                displayedRecords = diversified.slice(0, 5)
                const modelRankedNames = new Set(ranked.map((item) => item.scientificName.trim().toLowerCase()))
                const displayedGemmaCount = displayedRecords.filter((item) => modelRankedNames.has(item.scientificName.trim().toLowerCase())).length
                const completeRanking = displayedGemmaCount >= Math.min(5, candidates.length)
                setSourceChecks(current => ({
                  ...current,
                  gemmaStatus: completeRanking ? 'success' : 'partial',
                  gemmaCandidateCount: Number(recommendationPayload.candidateCount) || candidates.length,
                  gemmaReturnedCount: ranked.length,
                  gemmaDisplayedCount: displayedGemmaCount,
                  modelName: typeof recommendationPayload.model === 'string' ? recommendationPayload.model : '',
                }))
                setMessage('A varied selection of nearby wildlife is ready to explore.')
              } else {
                displayedRecords = candidates.slice(0, 5)
                setSourceChecks(current => ({
                  ...current, gemmaStatus: 'fallback',
                  gemmaCandidateCount: Number(recommendationPayload.candidateCount) || candidates.length,
                  gemmaReturnedCount: 0,
                  gemmaDisplayedCount: 0,
                  modelName: typeof recommendationPayload.model === 'string' ? recommendationPayload.model : '',
                }))
                setMessage('Here are some nearby species to explore.')
              }
            } catch (recommendationError) {
              console.warn('Gemma wildlife recommendation failed; retaining GBIF ranking.', recommendationError)
              displayedRecords = candidates.slice(0, 5)
              setSourceChecks(current => ({ ...current, gemmaStatus: 'fallback', gemmaCandidateCount: candidates.length, gemmaReturnedCount: 0, gemmaDisplayedCount: 0 }))
              setMessage('Recommendations are limited right now, so we are showing other wildlife recorded nearby.')
            }
          } else if (candidates.length > 0) {
            setMessage('Habitat information is unavailable right now, but nearby wildlife is still shown.')
          } else {
            setSourceChecks(current => ({ ...current, gemmaStatus: 'skipped' }))
            setMessage('No new species found here yet. Try again later or explore another area.')
          }
          const finalDisplayedRecords = displayedRecords.slice(0, 5)
          setNearbySpecies(finalDisplayedRecords)
          setSeenNearbyTaxa((current) => {
            const next = [...current]
            const known = new Set(current.flatMap((item) => [item.key, item.scientificName.trim().toLowerCase()]))
            for (const item of finalDisplayedRecords) {
              const record = {
                key: String(item.key || item.scientificName).trim(),
                name: String(item.name || item.scientificName).trim(),
                scientificName: String(item.scientificName || item.name).trim(),
              }
              const identities = [record.key, record.scientificName.toLowerCase()]
              if (identities.some((identity) => identity && !known.has(identity))) {
                next.push(record)
                identities.forEach((identity) => { if (identity) known.add(identity) })
              }
            }
            return next
          })
        } else {
          const speciesMessage = speciesResult.reason instanceof Error ? speciesResult.reason.message : 'Nearby wildlife lookup failed.'
          console.warn('Nearby wildlife lookup failed:', speciesMessage)
          setError('Could not load nearby wildlife. Please try again.')
          setSourceChecks(current => ({ ...current, gbifStatus: 'failed', gemmaStatus: 'skipped' }))
        }
      } finally {
        setLoading(false)
        onSearchStatusChange('finished')
      }
    }, (geoError) => {
      setLoading(false)
      onSearchStatusChange('finished')
      setSourceChecks(current => ({ ...current, esaStatus: 'skipped', gbifStatus: 'skipped', gemmaStatus: 'skipped' }))
      if (geoError.code === geoError.PERMISSION_DENIED) setError('Location permission was denied. Allow location access in your browser settings and try again.')
      else if (geoError.code === geoError.TIMEOUT) setError('Location lookup timed out. Please try again.')
      else setError('Could not determine your location. Check your device location settings and try again.')
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 })
  }

  // Prepare a compact, plain-language summary of nearby habitats and wildlife.
  const combinedExploreContext = habitat && nearbySpecies.length > 0 ? {
    coordinates: gpsCoordinates,
    radiusKm: habitat.samplingRadiusKm,
    dominantHabitat: habitat.dominantHabitat,
    habitatClasses: habitat.classes.slice(0, 4).map(({ name, samplePercent, samples }) => ({ name, samplePercent, samples })),
    species: nearbySpecies.slice(0, 5).map(({ scientificName, name, observedAt, nearbyRecordCount }) => ({ scientificName, commonName: name, observedAt, nearbyRecordCount })),
    evidenceNote: 'These are previous sightings, not guaranteed sightings today.',
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

  const activeEvent = EXPLORE_EVENTS.find((event) => event.id === activeEventId)
  if (activeEvent) return <ChilikaEventDetail event={activeEvent} onBack={() => setActiveEventId(null)} />

  return <div className="screen">
    <div className="page-title explore-landing-title"><p className="eyebrow">LOCAL BIODIVERSITY</p><h1>Discover your surroundings.</h1><p>Find nearby wildlife, then follow seasonal events.</p></div>
    <section className="explore-feature-panel explore-local-panel" aria-label="Explore nearby wildlife">
      <div className="explore-module-heading"><div><p className="eyebrow">START HERE</p><h2>Find wildlife near you.</h2><p>Explore nearby wildlife and habitats.</p></div><span className="explore-module-icon"><MapPin size={19} /></span></div>
    <div className="map-card explore-map-card">
      <div className="explore-map-wrap">
        {gpsCoordinates ? <iframe className="explore-map-iframe" title="OpenStreetMap centered on your GPS location" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="explore-map-empty"><span className="explore-map-empty-icon"><MapPin size={23} /></span><strong>Your map will appear here</strong><span>Share your location to place the map here.</span></div>}
      </div>
      <div className="map-footer"><div><strong>Your exploration area</strong><span><MapPin size={13} /> {locationLabel}{gpsAccuracy !== null ? ` · ±${Math.round(gpsAccuracy)} m` : ''}</span></div><button className="outline-button" onClick={() => findWildlife(Boolean(gpsCoordinates && seenNearbyTaxa.length))} disabled={loading}>{loading ? 'Finding…' : gpsCoordinates ? 'Next nearby species' : 'Find wildlife near me'}</button></div>
      {gpsCoordinates && <a className="explore-open-map" href={`https://www.openstreetmap.org/?mlat=${gpsCoordinates.latitude}&mlon=${gpsCoordinates.longitude}#map=14/${gpsCoordinates.latitude}/${gpsCoordinates.longitude}`} target="_blank" rel="noreferrer">Open larger map <ArrowRight size={13} /></a>}
    </div>
    {sourceChecks.hasRun && !loading && Boolean(gpsCoordinates) && !error && <div className="explore-complete-hint" role="status" aria-live="polite">
      <span className="explore-complete-mark" aria-hidden="true">✓</span>
      <div><strong>Exploration complete</strong><span>Scroll down to see your nearby species and habitat results.</span></div>
    </div>}
    {loading && <section className="explore-loading-panel" role="status" aria-live="polite" aria-label="Wildlife search in progress">
      <div className="explore-loading-visual" aria-hidden="true"><span className="explore-loading-ring" /><span className="explore-loading-leaf"><Leaf size={23} /></span></div>
      <div className="explore-loading-copy"><p className="eyebrow">EXPLORING YOUR AREA</p><h3>{loadingStage}</h3><p>This may take a moment. You can keep using WildQuest while we search.</p></div>
      <div className="explore-loading-progress" aria-hidden="true"><span /><span /><span /></div>
    </section>}
    {error && <p className="modal-text" role="alert" style={{ marginTop: 12 }}>{error}</p>}
    {habitatError && <p className="modal-text" role="status" style={{ marginTop: 12 }}>Nearby habitat information could not load this time.</p>}
    </section>
        <section className="seasonal-events-section explore-feature-panel explore-events-panel" aria-label="Seasonal field events">
      <div className="section-heading event-section-heading"><div><p className="eyebrow">SEASONAL FIELD EVENTS</p><h2>Follow the wild seasons.</h2></div><span className="event-section-icon"><Sparkles size={17} /></span></div>
      <p className="event-section-intro">Special places. Short-lived wonders. New field checklists to explore.</p>
      <div className="event-featured-list">
        {EXPLORE_EVENTS.map((event) => <ExploreEventCard key={event.id} event={event} onOpen={setActiveEventId} />)}
      </div>
      <div className="event-future-note"><span className="event-future-icon"><CalendarDays size={17} /></span><div><strong>More seasonal events are on the horizon</strong><p>Future migrations, habitats, and conservation events can be added to this collection.</p></div></div>
    </section>
    {(habitat || sourceChecks.hasRun || nearbySpecies.length > 0 || Boolean(message)) && <section className="explore-results-panel" aria-label="Nearby habitat and species results">
    {habitat && <section className="worldcover-panel">
      <div className="section-heading compact"><div><p className="eyebrow">NEARBY HABITATS</p><h2>Habitats around you</h2></div><span className="worldcover-radius">Near you</span></div>
      <p className="worldcover-intro">A quick snapshot of the land and water habitats around your location.</p>
      {habitat.classes.slice(0, 4).map((landClass) => <div className="worldcover-class" key={landClass.code}>
        <div className="worldcover-class-heading"><span className="worldcover-dot" style={{ backgroundColor: worldCoverColors[landClass.code] || '#a4ac86' }} /><div className="worldcover-class-label"><strong>{landClass.name}</strong></div><b>{landClass.samplePercent}%</b></div>
        <div className="worldcover-bar"><span style={{ width: `${landClass.samplePercent}%`, backgroundColor: worldCoverColors[landClass.code] || '#a4ac86' }} /></div>
      </div>)}
      <details className="worldcover-attribution explore-data-details"><summary>About this habitat map</summary><p>Habitat types are estimated from satellite imagery. They suggest what may live nearby, but do not guarantee a species is present.</p><small>Source: ESA WorldCover 2021. {habitat.attribution}</small></details>
    </section>}
    {combinedExploreContext && <section className="combined-context-panel" aria-label="Combined habitat and wildlife context">
      <div className="combined-context-heading"><div><p className="eyebrow">YOUR LOCAL AREA</p><h2>Nearby habitats &amp; wildlife</h2></div></div>
      <div className="combined-context-stats"><div><span>Main habitat</span><strong>{combinedExploreContext.dominantHabitat || 'Unknown'}</strong></div><div><span>Species to explore</span><strong>{combinedExploreContext.species.length}</strong></div></div>
      <div className="combined-context-habitats"><span className="combined-context-label">Other nearby habitats</span><div>{combinedExploreContext.habitatClasses.map((landClass) => <span key={landClass.name}>{landClass.name} · {landClass.samplePercent}%</span>)}</div></div>
      <p className="combined-context-note">{combinedExploreContext.evidenceNote}</p>
    </section>}
    {(nearbySpecies.length > 0 || sourceChecks.hasRun) && <>
    {message && <p className="modal-text" role="status" style={{ marginTop: 12 }}>{message}</p>}
    <div className="section-heading compact"><div><p className="eyebrow">NEARBY WILDLIFE</p><h2>{nearbySpecies.length ? 'Wildlife to discover' : 'What might you find?'}</h2></div><button className="icon-button" onClick={() => findWildlife(Boolean(gpsCoordinates && seenNearbyTaxa.length))} aria-label="Show next nearby species" title="Show next nearby species" disabled={loading}><RefreshCw size={16} /></button></div>
    {nearbySpecies.length ? <div className="nearby-species-list">{nearbySpecies.map((item, index) => {
      const cardKey = item.key || `${item.scientificName}-${index}`
      const visiblePhotoUrl = fallbackPhotoUrls[cardKey]?.url || item.photo || ''
      const expanded = expandedSpeciesKey === cardKey
      const hasCoordinates = item.latitude !== null && item.longitude !== null && Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
      const observationMapUrl = hasCoordinates ? `https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=15/${item.latitude}/${item.longitude}` : ''
      const scientificName = item.scientificName || item.name
      const commonName = item.name && item.name.toLowerCase() !== scientificName.toLowerCase() ? item.name : ''
      return <article className={`nearby-species-card ${expanded ? 'is-expanded' : ''}`} key={cardKey}>
        <div className="nearby-species-row">
          {visiblePhotoUrl && !unavailablePhotoKeys.includes(cardKey) ? <button className="nearby-species-photo-button" type="button" aria-label={`Expand photo of ${scientificName}`} onClick={() => setPhotoPreview({ url: visiblePhotoUrl, scientificName, commonName, source: fallbackPhotoUrls[cardKey]?.source || item.photoSource || 'GBIF occurrence media', attribution: fallbackPhotoUrls[cardKey]?.attribution || item.photoAttribution || '' })}>
            <img src={visiblePhotoUrl} alt={`Photo of ${scientificName}`} loading="lazy" onError={() => {
              if (fallbackPhotoUrls[cardKey]) {
                setUnavailablePhotoKeys((current) => current.includes(cardKey) ? current : [...current, cardKey])
              } else {
                void requestPhotoFallback(item, cardKey)
              }
            }} />
            <span className="nearby-photo-expand-hint"><Expand size={14} /></span>
          </button> : <span className="nearby-species-thumb" aria-label="No image available"><Leaf size={24} /></span>}
          <button className="nearby-species-trigger" type="button" aria-expanded={expanded} aria-controls={`nearby-species-details-${index}`} onClick={() => setExpandedSpeciesKey(expanded ? null : cardKey)}>
            <span className="nearby-species-main"><span className="rarity">RECORDED NEARBY</span><strong>{scientificName}</strong>{commonName && <em>{commonName}</em>}<small>{item.observedAt ? item.observedAt.slice(0, 10) : 'Date not listed'}</small>{item.whereToLook && <span className="nearby-where-to-look"><MapPin size={11} aria-hidden="true" /> <span><b>Where to look:</b> {item.whereToLook}</span></span>}{friendlyPriorityLabel(item.priorityLabel) && <span className="nearby-priority-label">{friendlyPriorityLabel(item.priorityLabel)}</span>}</span>
            <ChevronRight className="nearby-species-chevron" size={18} aria-hidden="true" />
          </button>
        </div>
        {expanded && <div className="nearby-species-details" id={`nearby-species-details-${index}`}>
          <div><span>Scientific name</span><strong>{scientificName}</strong></div>
          {commonName && <div><span>Common name</span><strong>{commonName}</strong></div>}
          <div><span>Last recorded</span><strong>{item.observedAt ? item.observedAt.slice(0, 10) : 'Date not listed'}</strong></div>
          
          {item.whereToLook && <div><span>Where to look</span><strong>{item.whereToLook}</strong></div>}
          {item.recommendationReason && <div><span>Why look for it</span><strong>{item.recommendationReason}</strong></div>}
          
          <p>This species has been recorded nearby, but a sighting is never guaranteed. Fewer local records do not necessarily mean a species is rare.</p>
          {hasCoordinates && <a href={observationMapUrl} target="_blank" rel="noreferrer">View location on map <ArrowRight size={13} /></a>}
          {visiblePhotoUrl && !unavailablePhotoKeys.includes(cardKey) && <button className="nearby-detail-photo-link" type="button" onClick={() => setPhotoPreview({ url: visiblePhotoUrl, scientificName, commonName, source: fallbackPhotoUrls[cardKey]?.source || item.photoSource || 'GBIF occurrence media', attribution: fallbackPhotoUrls[cardKey]?.attribution || item.photoAttribution || '' })}>View larger photo <Expand size={13} /></button>}
        </div>}
      </article>
    })}</div> : loading ? null : <div className="quest-history-empty"><h2>{seenNearbyTaxa.length ? 'No more unseen species in this result pool' : 'No new species found'}</h2><p>{seenNearbyTaxa.length ? 'You have seen all the species in this batch. Try again later or explore another area.' : 'Try again later or explore another area. Species in your Compendium are skipped.'}</p></div>}
    {photoPreview && <div className="nearby-photo-lightbox" role="dialog" aria-modal="true" aria-label={`Photo of ${photoPreview.scientificName}`} onClick={() => setPhotoPreview(null)}>
      <div className="nearby-photo-lightbox-panel" onClick={(event) => event.stopPropagation()}>
        <button className="nearby-photo-lightbox-close" type="button" aria-label="Close enlarged photo" onClick={() => setPhotoPreview(null)}><X size={21} /></button>
        <img src={photoPreview.url} alt={`Expanded photo associated with ${photoPreview.scientificName}`} onError={() => {
          const failedIndex = nearbySpecies.findIndex((item) => item.scientificName === photoPreview.scientificName)
          const failedItem = failedIndex >= 0 ? nearbySpecies[failedIndex] : undefined
          if (failedItem) void requestPhotoFallback(failedItem, failedItem.key || `${failedItem.scientificName}-${failedIndex}`)
          setPhotoPreview(null)
        }} />
        <div className="nearby-photo-lightbox-caption"><strong>{photoPreview.scientificName}</strong>{photoPreview.commonName && <span>{photoPreview.commonName}</span>}<small>{photoPreview.source === 'GBIF occurrence media' ? 'Photo attached to a recorded sighting.' : 'Reference photo for this species; it may show a different individual.'}{photoPreview.attribution ? ` Photo credit: ${photoPreview.attribution}` : ''}</small></div>
      </div>
    </div>}
    <p className="modal-text nearby-results-note">These are previous sightings, not guaranteed sightings today. Some photos are reference images.</p>
    </>}
    </section>}
  </div>
}



function formatFoundDate(value: string) {
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

const COMPENDIUM_NAME_ALIASES: Record<string, string> = {
  // The photo-identification model sometimes gives a generic name first and a
  // more specific common name later. Keep these as one local-species entry.
  'monitor lizard': 'varanus bengalensis',
  'bengal monitor': 'varanus bengalensis',
  'indian monitor': 'varanus bengalensis',
}

function verifiedScientificName(value: string) {
  const normalized = normalizeTaxonText(value)
  return Boolean(
    normalized &&
    !normalized.includes('not verified') &&
    !normalized.includes('unknown') &&
    !normalized.includes('unidentified') &&
    !normalized.includes('unavailable') &&
    /^[a-z][a-z-]+(?:\s+[a-z][a-z-]+){1,2}$/.test(normalized),
  )
}

function compendiumSpeciesKey(item: SpeciesItem) {
  const name = normalizeTaxonText(item.name)
  // Pending or failed identifications are not species yet; do not accidentally
  // collapse unrelated uploads that have the same placeholder text.
  if (item.identificationStatus === 'pending' || name === 'unidentified organism' || name === 'identifying') {
    return `unresolved:${item.id || `${name}-${item.dateFound || ''}`}`
  }

  if (verifiedScientificName(item.latin)) return `sci:${normalizeTaxonText(item.latin)}`

  const knownLatin = knownScientificName(item.name)
  if (verifiedScientificName(knownLatin)) return `sci:${normalizeTaxonText(knownLatin)}`

  const commonNameAlias = COMPENDIUM_NAME_ALIASES[name]
  if (commonNameAlias) return `sci:${commonNameAlias}`

  const taxonAlias = TAXON_ALIASES[name]
  if (taxonAlias) return `sci:${taxonAlias}`

  return `name:${name}`
}

function observationFromEntry(item: SpeciesItem): SpeciesObservation {
  return {
    ...(item.id ? { id: item.id } : {}),
    ...(item.dateFound ? { dateFound: item.dateFound } : {}),
    ...(item.locationFound ? { locationFound: item.locationFound } : {}),
    ...(item.notes ? { notes: item.notes } : {}),
    ...(item.image ? { image: item.image } : {}),
    ...(item.status ? { status: item.status } : {}),
  }
}

function observationsForEntry(item: SpeciesItem): SpeciesObservation[] {
  return item.observations?.length ? item.observations : [observationFromEntry(item)]
}

function observationIdentity(observation: SpeciesObservation) {
  if (observation.id) return `id:${observation.id}`
  return [
    observation.dateFound || '',
    observation.locationFound || '',
    observation.notes || '',
    observation.image || '',
  ].join('|')
}

function dedupeObservations(observations: SpeciesObservation[]) {
  const seen = new Set<string>()
  return observations.filter((observation) => {
    const identity = observationIdentity(observation)
    if (seen.has(identity)) return false
    seen.add(identity)
    return true
  })
}

function compendiumEntryQuality(item: SpeciesItem) {
  return (verifiedScientificName(item.latin) ? 100 : 0)
    + (item.identificationStatus === 'corrected' ? 12 : 0)
    + (item.identificationStatus === 'complete' ? 8 : 0)
    + (item.identificationStatus === 'pending' || item.identificationStatus === 'failed' ? 0 : 4)
    + (item.image && !item.image.startsWith('blob:') ? 3 : 0)
    + (item.locationFound ? 1 : 0)
    + (item.notes ? 1 : 0)
}

function mergeCompendiumEntries(first: SpeciesItem, second: SpeciesItem): SpeciesItem {
  const firstIsPreferred = compendiumEntryQuality(first) >= compendiumEntryQuality(second)
  const preferred = firstIsPreferred ? first : second
  const other = firstIsPreferred ? second : first
  const observations = dedupeObservations([
    ...observationsForEntry(first),
    ...observationsForEntry(second),
  ])
  const foundDates = observations
    .map((observation) => observation.dateFound)
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => a.localeCompare(b))

  return {
    ...other,
    ...preferred,
    // Never add points from duplicate sightings: discovery points belong to the
    // species, while every sighting is retained separately below.
    points: Math.max(first.points || 0, second.points || 0),
    image: preferred.image && !preferred.image.startsWith('blob:')
      ? preferred.image
      : (other.image || preferred.image),
    locationFound: preferred.locationFound || other.locationFound,
    notes: preferred.notes || other.notes,
    observations,
    ...(foundDates.length ? { dateFound: foundDates[0] } : {}),
  }
}

function dedupeCompendium(items: SpeciesItem[]) {
  const groups = new Map<string, SpeciesItem>()
  for (const item of items) {
    const key = compendiumSpeciesKey(item)
    const existing = groups.get(key)
    groups.set(key, existing ? mergeCompendiumEntries(existing, item) : item)
  }
  return Array.from(groups.values())
}

function realCompendiumItems(items: SpeciesItem[]) {
  return dedupeCompendium(items.filter((item) => item.status !== 'Demonstration entry'))
}

function discoveredCompendiumItems(items: SpeciesItem[]) {
  return realCompendiumItems(items).filter((item) =>
    item.identificationStatus !== 'pending' &&
    item.identificationStatus !== 'failed' &&
    !['identifying…', 'identifying...', 'unidentified organism'].includes(normalizeTaxonText(item.name)) &&
    !normalizeTaxonText(item.name).includes('unidentified organism')
  ).sort((a, b) => a.name.localeCompare(b.name))
}

type CompendiumFilter = 'All' | 'Birds' | 'Plants' | 'Insects' | 'Reptiles'

function categoryMatchesFilter(item: SpeciesItem, filter: CompendiumFilter) {
  if (filter === 'All') return true
  const category = normalizeTaxonText(item.category)
  if (filter === 'Birds') return category.includes('bird') || category.includes('avian')
  if (filter === 'Plants') return category.includes('plant') || category.includes('flora')
  if (filter === 'Insects') return category.includes('insect') || category.includes('butterfly') || category.includes('moth')
  return category.includes('reptile') || category.includes('reptilia')
}

function Compendium({ onOpen, onTab, items }: { onOpen: (kind: string, item?: SpeciesItem) => void; onTab: (tab: Tab) => void; items: SpeciesItem[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CompendiumFilter>('All')
  const realItems = realCompendiumItems(items)
  const shown = realItems.filter((item) =>
    `${item.name} ${item.latin} ${item.category}`.toLowerCase().includes(query.toLowerCase()) &&
    categoryMatchesFilter(item, filter)
  )
  const acceptedPoints = realItems
    .filter((item) => item.identificationStatus !== 'pending' && item.identificationStatus !== 'failed')
    .reduce((total, item) => total + (Number(item.points) || 0), 0)
  const allObservations = realItems.flatMap(observationsForEntry)
  const discoveriesThisMonth = allObservations.filter((observation) => {
    if (!observation.dateFound) return false
    const date = new Date(observation.dateFound)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  const filters: CompendiumFilter[] = ['All', 'Birds', 'Plants', 'Insects', 'Reptiles']

  return <div className="screen">
    <div className="page-title collection-title">
      <div><p className="eyebrow">YOUR FIELD GUIDE</p><h1>Compendium</h1></div>
      <div className="collection-count"><strong>{realItems.length}</strong><span>unique species</span></div>
    </div>
    {realItems.length > 0 && <>
      <div className="collection-stats">
        <div><strong>{acceptedPoints}</strong><span>recorded points</span></div>
        <div><strong>{allObservations.length}</strong><span>sightings saved</span></div>
        <div><strong>{discoveriesThisMonth}</strong><span>sightings this month</span></div>
      </div>
      <div className="searchbox"><Search size={18} /><input aria-label="Search compendium" placeholder="Search species" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className="filter-row" aria-label="Filter compendium by category">{filters.map((category) => <button type="button" key={category} className={filter === category ? 'filter active' : 'filter'} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}</div>
      <div className="species-grid compendium-species-scroll">
        {shown.map((item, index) => {
          const count = observationsForEntry(item).length
          return <button type="button" className={`species-card rarity-${(item.rarity || 'unconfirmed').toLowerCase().replace(' ', '-')}`} key={item.id ?? `${compendiumSpeciesKey(item)}-${index}`} onClick={() => onOpen('species', item)}>
            <div className="species-photo">{item.image ? <img src={item.image} alt={item.name} /> : <span className="species-photo-placeholder"><Leaf size={26} /></span>}<span className="species-points">{item.identificationStatus === 'pending' ? 'Identifying…' : item.identificationStatus === 'failed' ? 'Retry needed' : item.identificationStatus === 'corrected' ? 'Corrected' : item.status?.startsWith('AI suggestion') ? (item.points > 0 ? `Review · +${item.points} pts` : 'Needs review') : item.status && item.status !== 'Demonstration entry' ? 'Needs review' : `+${item.points} pts`}</span></div>
            <div className="species-copy"><strong>{item.name}</strong><em>{item.latin}</em></div>
            <div className="species-meta"><span className="species-category">{item.identificationStatus === 'pending' ? 'Processing' : item.identificationStatus === 'failed' ? 'Identification failed' : item.identificationStatus === 'corrected' ? 'User corrected' : item.status && item.status !== 'Demonstration entry' ? 'Needs review' : item.category}</span><span className="species-rarity">{item.rarity}</span></div>
            <p style={{ padding: '0 12px 12px', margin: 0, fontSize: 12, color: '#656d4a' }}><strong>Found {count} time{count === 1 ? '' : 's'}</strong>{item.dateFound ? ` · First: ${formatFoundDate(item.dateFound)}` : ''}</p>
          </button>
        })}
      </div>
      {!shown.length && <div className="compendium-empty"><BookOpen size={23} /><h2>No matching species</h2><p>{query.trim() ? 'Try a different search term or clear your filters.' : `No ${filter.toLowerCase()} are recorded in your Compendium yet.`}</p><button className="outline-button" onClick={() => { setQuery(''); setFilter('All') }}>Clear filters</button></div>}
    </>}
    {realItems.length === 0 && <div className="compendium-empty"><span className="compendium-empty-mark"><Leaf size={26} /></span><h2>Your discovered animals will appear here.</h2><p>Identify a photo or explore nearby wildlife to begin your personal field guide.</p><div className="compendium-empty-actions"><button className="dark-button" onClick={() => onTab('explore')}>Explore nearby species <ArrowRight size={15} /></button><button className="outline-button" onClick={() => onOpen('photo')}>Identify a photo <Camera size={15} /></button></div></div>}
  </div>
}


function Community({ items, onOpenProfile }: { items: SpeciesItem[]; onOpenProfile: () => void }) {
  const discovered = discoveredCompendiumItems(items)
  return <div className="screen">
    <div className="page-title"><p className="eyebrow">THE WILD AROUND US</p><h1>Community</h1><p>Your field profile, alongside the discoveries you have recorded.</p></div>
    <div className="leaderboard-card">
      <div className="leader-head"><div><span className="eyebrow light">LEADERBOARD</span><h2>Field notes leaderboard</h2></div><Trophy size={25} /></div>
      <button type="button" className="leader-row you clickable-leader-row" onClick={onOpenProfile} aria-label="Open dev_sj profile">
        <span className="rank">01</span><span className="community-avatar">DS</span>
        <div><strong>dev_sj <small>YOU</small></strong><span>{discovered.length} species discovered · View profile</span></div><b>300 pts</b><ArrowRight size={15} />
      </button>
    </div>
    <div className="community-feed-empty"><span className="action-icon sage"><Bird size={20} /></span><h2>Community discoveries</h2><p>No shared field notes are available yet. Your personal discoveries stay in your Compendium.</p></div>
  </div>
}



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
  const [openingCamera, setOpeningCamera] = useState(false)

  function selectFile(selected?: File) {
    setError('')
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }
    onIdentifyInBackground(selected)
  }

  async function takePhoto() {
    setError('')
    if (!Capacitor.isNativePlatform()) {
      // On mobile browsers, capture=environment asks the browser to launch the rear camera.
      cameraInput.current?.click()
      return
    }

    setOpeningCamera(true)
    try {
      const photo = await Camera.getPhoto({
        quality: 88,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear,
        correctOrientation: true,
        saveToGallery: false,
      })
      if (!photo.webPath) throw new Error('The camera did not return a photo. Please try again.')
      const response = await fetch(photo.webPath)
      if (!response.ok) throw new Error('Could not read the captured photo. Please try again.')
      const blob = await response.blob()
      const mimeType = blob.type.startsWith('image/') ? blob.type : 'image/jpeg'
      const extension = photo.format || (mimeType.includes('png') ? 'png' : 'jpeg')
      const file = new File([blob], `wildquest-${Date.now()}.${extension}`, { type: mimeType, lastModified: Date.now() })
      onIdentifyInBackground(file)
    } catch (cameraError) {
      const message = cameraError instanceof Error ? cameraError.message : String(cameraError || '')
      if (/cancel|cancelled|canceled/i.test(message)) return
      console.error('Native camera failed:', cameraError)
      setError('Could not open the camera. Check camera permission and try again.')
    } finally {
      setOpeningCamera(false)
    }
  }

  return (
    <>
      <span className="modal-icon sage"><Camera size={24} /></span>
      <p className="eyebrow">QUICK FIELD CAPTURE</p>
      <h2>Capture and keep moving.</h2>
      <p className="modal-text">Photograph an animal, plant or fungus. Photos of people and everyday objects will not be added.</p>
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={(event) => { selectFile(event.target.files?.[0]); event.currentTarget.value = '' }} />
      <input ref={galleryInput} type="file" accept="image/*" hidden onChange={(event) => { selectFile(event.target.files?.[0]); event.currentTarget.value = '' }} />
      <div className="modal-options">
        <button type="button" onClick={() => void takePhoto()} disabled={openingCamera}><Camera size={19} /> {openingCamera ? 'Opening camera…' : 'Take a photo'}</button>
        <button type="button" onClick={() => galleryInput.current?.click()}><BookOpen size={19} /> Choose from gallery</button>
      </div>
      {error && <p className="modal-text" role="alert">{error}</p>}
      <p className="modal-text" style={{ fontSize: 12, marginTop: 10 }}>WildQuest checks the photo before adding a discovery.</p>
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
    <p className="modal-text">{item.category} · {item.points} points</p>{item.status && item.status.toLowerCase().includes('suggestion') && <p className="modal-text">AI identification—please check the name if it looks wrong.</p>}
    {isPending && <p className="modal-text" role="status">Your photo is still being identified. You can close this entry and keep exploring; the result will appear here.</p>}
    {isFailed && <p className="modal-text" role="alert">Identification didn't finish. You can still add the correct name below.</p>}
    {item.dateFound && <p className="modal-text">Date found: {formatFoundDate(item.dateFound)}</p>}
    {item.locationFound && <p className="modal-text">Location: {item.locationFound}</p>}
    {item.modelSuggestion && <p className="modal-text">First suggestion: {item.modelSuggestion}</p>}
    {item.correctionNotes && <p className="modal-text">Correction note: {item.correctionNotes}</p>}
    {item.notes && <p className="modal-text">Field notes: {item.notes}</p>}
    {(item.observations?.length || 0) > 1 && <section style={{ margin: '14px 0', textAlign: 'left' }}>
      <p className="eyebrow">SIGHTINGS · {item.observations!.length}</p>
      <div style={{ display: 'grid', gap: 10 }}>
        {item.observations!.map((observation, index) => <div key={observation.id || `${observation.dateFound || 'date'}-${index}`} style={{ display: 'grid', gridTemplateColumns: observation.image ? '64px 1fr' : '1fr', gap: 10, padding: 10, border: '1px solid #e2dccf', borderRadius: 10, background: '#fffdf8' }}>
          {observation.image && <img src={observation.image} alt={`Sighting ${index + 1} of ${item.name}`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 7 }} />}
          <div style={{ display: 'grid', gap: 4, fontSize: 12, color: '#656d4a' }}>
            <strong style={{ color: '#39412d' }}>{observation.dateFound ? formatFoundDate(observation.dateFound) : `Sighting ${index + 1}`}</strong>
            {observation.locationFound && <span>Location: {observation.locationFound}</span>}
            {observation.notes && <span>Notes: {observation.notes}</span>}
          </div>
        </div>)}
      </div>
    </section>}
    {!editing ? <>
      <button className="outline-button" style={{ width: '100%', margin: '8px 0' }} onClick={() => setEditing(true)}>Wrong identification? Correct it</button>
      <button className="dark-button full" onClick={onClose}>Done <ArrowRight size={15} /></button>
    </> : <div style={{ display: 'grid', gap: 10, textAlign: 'left', marginTop: 12 }}>
      <p className="modal-text">Your correction will be saved as your note, but it will not be independently verified.</p>
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

function ProfilePanel({ items }: { items: SpeciesItem[] }) {
  const discovered = discoveredCompendiumItems(items)
  return <div className="user-profile-panel">
    <div className="user-profile-heading"><span className="user-profile-avatar">DS</span><p className="eyebrow">FIELD EXPLORER</p><h2>dev_sj</h2><p>{discovered.length} species discovered</p></div>
    <section className="user-profile-species"><h3>Your discoveries</h3>
      {discovered.length ? <ul>{discovered.map((item) => <li key={compendiumSpeciesKey(item)}><span>{item.name}</span>{verifiedScientificName(item.latin) && <em>{item.latin}</em>}</li>)}</ul> : <p className="modal-text">Your discovered animals will appear here after your first successful identification.</p>}
    </section>
  </div>
}

function Modal({ kind, close, onUpdateCompendium, onIdentifyInBackground, selectedSpecies, items, onTab, onStartQuest }: {
  kind: string
  close: () => void
  onUpdateCompendium: (item: SpeciesItem) => void
  onIdentifyInBackground: (file: File) => void
  selectedSpecies?: SpeciesItem
  items: SpeciesItem[]
  onTab: (tab: Tab) => void
  onStartQuest: () => void
}) {
  return <div className="modal-backdrop" onClick={close} style={{ overflowY: 'auto', alignItems: 'flex-start', justifyContent: 'center', padding: '16px 12px', boxSizing: 'border-box' }}>
    <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', boxSizing: 'border-box', margin: '0 auto' }}>
      <button type="button" className="modal-close" onClick={close} aria-label="Close"><X size={18} /></button>
      {kind === 'photo' ? <PhotoIdentify onIdentifyInBackground={onIdentifyInBackground} />
        : kind === 'profile' ? <ProfilePanel items={items} />
        : kind === 'species' && selectedSpecies ? <SpeciesDetails item={selectedSpecies} onSave={onUpdateCompendium} onClose={close} />
        : <><span className="modal-icon sage"><Sparkles size={24} /></span><p className="eyebrow">QUEST READY</p><h2>Begin Wildlife Explorer?</h2><p className="modal-text">Your field session lasts up to 12 hours. Walking and new species observations can earn points.</p><button type="button" className="dark-button full" onClick={() => { close(); onStartQuest() }}>Start exploring <ArrowRight size={15} /></button></>}
    </div>
  </div>
}


export default function Page() {

  const [tab, setTab] = useState<Tab>('home');
  const [exploreTaskStatus, setExploreTaskStatus] = useState<'idle' | 'running' | 'finished'>('idle')

  const [modal, setModal] = useState<string | null>(null);

  const [profile, setProfile] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesItem | undefined>(undefined);

  const [compendium, setCompendium] = useState<SpeciesItem[]>([])
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
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const validEntries = parsed.filter((entry): entry is SpeciesItem =>
            Boolean(entry && typeof entry === 'object' && typeof (entry as SpeciesItem).name === 'string' && (entry as SpeciesItem).status !== 'Demonstration entry')
          )
          setCompendium(dedupeCompendium(validEntries))
        }
      }
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
      let next: SpeciesItem[]
      if (item.id && current.some((entry) => entry.id === item.id)) {
        next = current.map((entry) => entry.id === item.id
          ? {
              ...entry,
              ...item,
              image: item.image.startsWith('blob:') && !entry.image.startsWith('blob:') ? entry.image : item.image,
            }
          : entry)
      } else {
        next = [item, ...current]
      }
      return dedupeCompendium(next)
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

    setModal(null)
    setProfile(false)
    setSelectedSpecies(undefined)
    setBackgroundNotice('Checking the photo… It will be added only if it shows a valid biodiversity subject.')

    // Do not create a Compendium row while the model is still deciding what is in the image.
    const imagePromise = makeSmallImageDataUrl(file).catch((error) => {
      console.warn('Could not prepare a persistent thumbnail.', error)
      return undefined
    })

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('category', 'auto')
      const response = await fetch(`${API_BASE_URL}/identify/image`, { method: 'POST', body: formData })
      let data: {
        error?: string
        details?: string
        species?: string
        common_name?: string
        scientific_name?: string
        category?: string
        organism_group?: string
        valid_subject?: boolean
        subject_type?: string
        rejected?: boolean
        predictions?: Array<{ species?: string; scientific_name?: string }>
      }
      try {
        data = await response.json()
      } catch {
        throw new Error(`The backend returned an unreadable response (HTTP ${response.status}).`)
      }

      if (data.rejected === true || response.status === 422) {
        setBackgroundNotice(data.error || 'This photo does not clearly show an animal, plant or fungus, so it was not added to your Compendium.')
        return
      }
      if (!response.ok) {
        const message = data.error || `Identification failed (HTTP ${response.status}).`
        console.warn('WildQuest identification API returned an error:', { status: response.status, message, details: data.details })
        throw new Error(message)
      }

      // Fail closed when the backend does not explicitly confirm a biodiversity subject.
      const subjectType = String(data.subject_type || '').trim().toLowerCase()
      if (data.valid_subject !== true || !['animal', 'plant', 'fungus'].includes(subjectType)) {
        setBackgroundNotice('WildQuest could not confirm an animal, plant or fungus in this photo. It was not added to your Compendium.')
        return
      }

      const firstPrediction = Array.isArray(data.predictions) ? data.predictions[0] : undefined
      const rawName = String(data.species || firstPrediction?.species || data.common_name || '').trim()
      if (!rawName || /^(person|human|chair|table|phone|laptop|car|building|unknown object|unidentified object)$/i.test(rawName)) {
        setBackgroundNotice('This photo does not show a valid wildlife discovery, so it was not added to your Compendium.')
        return
      }

      const suggestedName = cleanSpeciesName(rawName)
      const categoryValue = String(data.category || data.organism_group || 'other')
      const scientificName = String(data.scientific_name || firstPrediction?.scientific_name || knownScientificName(suggestedName))
      const savedImage = await imagePromise
      const safeName = suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1)
      const rewardResult = awardDiscoveryIfNew(safeName, scientificName)
      const newEntry: SpeciesItem = {
        id,
        name: safeName,
        latin: scientificName,
        category: humanCategory(categoryValue),
        points: rewardResult.pointsAwarded,
        rarity: 'Unconfirmed',
        image: savedImage || '',
        status: 'AI suggestion — review when convenient',
        identificationStatus: 'complete',
        modelSuggestion: safeName,
        dateFound: localDate,
      }
      setCompendium((current) => dedupeCompendium([newEntry, ...current]))

      setBackgroundNotice(rewardResult.pointsAwarded
        ? `Identified ${safeName}: +${rewardResult.pointsAwarded} points for this discovery.`
        : rewardResult.newForQuest && rewardResult.alreadyRewardedToday
          ? `Identified ${safeName}. Saved to Compendium, but this species has already earned points today.`
          : rewardResult.newForQuest
            ? `Identified ${safeName}. It has been logged, but no discovery points were awarded.`
            : `Identification ready: ${safeName}. This taxon has already been counted in this quest, or no quest is active.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn('Background identification failed:', message)
      setBackgroundNotice('Photo not added. WildQuest could not verify the subject; try another clear photo of an animal, plant or fungus.')
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

        {tab === 'collection' && <Compendium onOpen={openModal} onTab={setTab} items={compendium} />}

        {tab === 'community' && <Community items={compendium} onOpenProfile={() => setProfile(true)} />}



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

          items={compendium}

          onTab={setTab}

          onStartQuest={startQuest}

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
        .explore-data-details { margin-top: 8px; color: #817b6e; font-size: 10px; line-height: 1.5; }
        .explore-data-details summary { cursor: pointer; color: #656d4a; font-weight: 650; }
        .explore-data-details p { margin: 6px 0; }
        .nearby-results-note { font-size: 11px; margin-top: 10px; }
        @media (max-width: 380px) { .combined-context-heading { align-items: flex-start; flex-direction: column; } }
        .explore-source-checks { display: grid; gap: 0; margin: 16px 0; padding: 14px; border: 1px solid #e5dfd2; border-radius: 15px; background: #fffdf8; }
        .explore-source-checks-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding-bottom: 9px; }
        .explore-source-checks-head .eyebrow { margin: 0; font-size: 9px; }
        .explore-source-checks-head h2 { margin: 3px 0 0; color: #303a27; font-size: 15px; }
        .explore-source-checks-head > span { flex: 0 0 auto; padding: 5px 8px; border-radius: 99px; background: #e9eadf; color: #596548; font-size: 9px; font-weight: 750; }
        .explore-source-check-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 9px; padding: 10px 0; border-top: 1px solid #ede8dd; }
        .explore-source-check-row > div { display: grid; gap: 3px; min-width: 0; }
        .explore-source-check-row strong { color: #303a27; font-size: 12px; }
        .explore-source-check-row small { color: #817b6e; font-size: 10px; line-height: 1.45; overflow-wrap: anywhere; }
        .source-check-status { flex: 0 0 auto; max-width: 92px; padding: 5px 7px; border-radius: 99px; background: #ede9df; color: #6b685d; font-size: 9px; font-weight: 800; text-align: center; }
        .source-check-status.success { color: #355a38; background: #e1eddd; }
        .source-check-status.running { color: #5b633d; background: #eef0d9; }
        .source-check-status.failed { color: #8a3f34; background: #f5e3dc; }
        .source-check-status.fallback, .source-check-status.partial { color: #8a5c20; background: #f4ead5; }
        .source-check-status.skipped, .source-check-status.waiting { color: #777668; background: #eeece6; }
        .explore-source-check-note { margin: 8px 0 0; color: #817b6e; font-size: 10px; line-height: 1.5; }
        @media (max-width: 370px) { .explore-source-check-row { flex-direction: column; } .source-check-status { align-self: flex-start; } }
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
        .nearby-where-to-look { display: flex; align-items: flex-start; gap: 4px; max-width: 100%; margin-top: 2px; color: #526344; font-size: 10px; line-height: 1.35; overflow-wrap: anywhere; }
        .nearby-where-to-look > svg { flex: 0 0 auto; margin-top: 1px; }
        .nearby-where-to-look b { font-weight: 750; }
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

        /* Compact Explore landing: put nearby discovery first while bringing seasonal events into the first viewport. */
        .explore-landing-title { margin-bottom: 8px; }
        .explore-landing-title .eyebrow { margin-bottom: 3px; }
        .explore-landing-title h1 { margin: 0 0 4px; font-size: 25px; line-height: 1.08; letter-spacing: -.035em; }
        .explore-landing-title > p:last-child { margin: 0; font-size: 11px; line-height: 1.4; }
        .explore-local-panel { margin: 8px 0 12px; padding: 11px 12px 12px; }
        .explore-local-panel .explore-module-heading { margin-bottom: 8px; }
        .explore-local-panel .explore-module-heading h2 { font-size: 17px; line-height: 1.15; }
        .explore-local-panel .explore-module-heading p:not(.eyebrow) { margin-top: 3px; font-size: 10px; line-height: 1.35; }
        .explore-local-panel .explore-module-icon { flex-basis: 34px; width: 34px; height: 34px; }
        .explore-local-panel .explore-map-wrap { height: clamp(118px, 30vw, 148px); }
        .explore-local-panel .explore-map-empty { min-height: 118px; gap: 5px; padding: 12px; }
        .explore-local-panel .explore-map-empty-icon { width: 35px; height: 35px; }
        .explore-local-panel .explore-map-empty strong { font-size: 12px; }
        .explore-local-panel .explore-map-empty > span:last-child { max-width: 280px; font-size: 10px; line-height: 1.35; }
        .explore-local-panel .map-footer { padding-top: 9px; padding-bottom: 9px; }
        .explore-results-panel { position: relative; margin: 12px 0 18px; padding: 12px 0 0; border-top: 1px solid #e3dece; }
        .explore-events-panel { margin-top: 12px; }

        /* Separate seasonal events from live nearby exploration without changing either feature's logic. */
        .explore-feature-panel { position: relative; margin: 12px 0 18px; padding: 16px 13px; border: 1px solid #e3dece; border-radius: 22px; background: rgba(255,253,248,.62); box-shadow: 0 5px 18px rgba(47,54,38,.035); transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease, background .22s ease; }
        .explore-feature-panel:hover { transform: translateY(-2px); border-color: #cbd1b7; background: rgba(255,253,248,.92); box-shadow: 0 12px 27px rgba(47,54,38,.075); }
        .explore-feature-panel:focus-within { border-color: #a8b68d; box-shadow: 0 0 0 3px rgba(168,182,141,.18), 0 10px 25px rgba(47,54,38,.06); }
        .seasonal-events-section { margin: 8px 0 18px; }
        .explore-module-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .explore-module-heading .eyebrow { margin: 0 0 5px; }
        .explore-module-heading h2 { margin: 0; color: #303a27; font-size: 21px; line-height: 1.12; letter-spacing: -.035em; }
        .explore-module-heading p:not(.eyebrow) { margin: 6px 0 0; max-width: 390px; color: #827d70; font-size: 11px; line-height: 1.5; }
        .explore-module-icon { display: grid; place-items: center; flex: 0 0 40px; width: 40px; height: 40px; border: 1px solid #e3e3d4; border-radius: 13px; color: #536746; background: #e9eadf; transition: transform .22s ease, background .22s ease; }
        .explore-feature-panel:hover .explore-module-icon { transform: translateY(-2px) rotate(-3deg); background: #dfe5d0; }
        .explore-local-panel .explore-map-card { margin-top: 0; }
        /* Seasonal event collection: event cards are data-driven so new event objects can be added without layout changes. */
        .event-section-heading { margin-bottom: 5px; }
        .event-section-heading .eyebrow { font-size: 13px; letter-spacing: .12em; }
        .event-section-heading h2 { margin-bottom: 0; }
        .event-section-icon { display: grid; place-items: center; width: 38px; height: 38px; flex: 0 0 38px; border: 1px solid #e7e1d4; border-radius: 13px; color: #60744d; background: #f8f5ed; }
        .event-section-intro { margin: 0 0 13px; color: #827d70; font-size: 12px; line-height: 1.5; }
        .event-featured-list { display: grid; gap: 12px; }
        .event-featured-card { position: relative; display: flex; width: 100%; min-height: 272px; flex-direction: column; justify-content: space-between; padding: 16px; overflow: hidden; border: 0; border-radius: 21px; background: #293c30; color: #fffdf5; text-align: left; cursor: pointer; isolation: isolate; box-shadow: 0 9px 24px rgba(35,48,30,.13); }
        .event-featured-card:focus-visible { outline: 3px solid #a6b98a; outline-offset: 3px; }
        .event-featured-image, .event-featured-shade { position: absolute; z-index: -1; inset: 0; width: 100%; height: 100%; }
        .event-featured-image { object-fit: cover; transition: transform .6s ease; }
        .event-featured-card:hover .event-featured-image { transform: scale(1.035); }
        .event-featured-shade { background: linear-gradient(180deg, rgba(15,28,23,.48) 0%, rgba(15,28,23,.10) 32%, rgba(15,28,23,.83) 100%); }
        .event-featured-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .event-featured-top > span { display: inline-flex; align-items: center; gap: 5px; padding: 7px 9px; border: 1px solid rgba(255,255,255,.23); border-radius: 99px; background: rgba(20,32,25,.32); color: #fffdf5; font-size: 9px; font-weight: 800; letter-spacing: .08em; backdrop-filter: blur(8px); }
        .event-featured-top .event-featured-live { background: #e4e9d2; border-color: #e4e9d2; color: #34482e; }
        .event-featured-copy { display: grid; gap: 8px; }
        .event-featured-location { display: flex; align-items: center; gap: 5px; color: #edf1e2; font-size: 10px; font-weight: 700; }
        .event-featured-copy > strong { max-width: 340px; font-size: clamp(25px, 6vw, 35px); letter-spacing: -.045em; line-height: .99; }
        .event-featured-copy > em { max-width: 345px; color: #f5f2e8; font-family: Georgia, serif; font-size: 14px; line-height: 1.4; }
        .event-featured-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 4px; color: #e1e7d5; font-size: 10px; font-weight: 700; }
        .event-featured-cta { display: inline-flex; align-items: center; gap: 6px; padding: 9px 11px; border-radius: 99px; color: #2e432e; background: #f6f3e7; font-size: 10px; font-weight: 800; white-space: nowrap; }
        .event-future-note { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; padding: 12px; border: 1px dashed #dcd6c7; border-radius: 14px; background: rgba(255,253,248,.58); }
        .event-future-icon { display: grid; place-items: center; width: 32px; height: 32px; flex: 0 0 32px; border-radius: 10px; color: #657452; background: #e9eadf; }
        .event-future-note strong { display: block; color: #464d38; font-size: 11px; }
        .event-future-note p { margin: 3px 0 0; color: #898273; font-size: 10px; line-height: 1.45; }
        .event-readme-section { display: grid; gap: 13px; margin: 0 0 17px; padding: 15px; border: 1px solid #e0e3d3; border-radius: 18px; background: linear-gradient(145deg, #f0f2e7, #fffdf8 68%); }
        .event-readme-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .event-readme-heading .eyebrow { margin: 0 0 5px; }
        .event-readme-heading h2 { margin: 0; color: #303a27; font-size: 21px; line-height: 1.08; letter-spacing: -.035em; }
        .event-readme-icon { display: grid; place-items: center; flex: 0 0 40px; width: 40px; height: 40px; border-radius: 13px; background: #e1e6d4; color: #536746; }
        .event-readme-intro { margin: 0; color: #6f7564; font-size: 12px; line-height: 1.7; }
        .event-readme-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
        .event-readme-stats > div { display: grid; align-content: start; gap: 4px; padding: 12px; border: 1px solid #e7e6d9; border-radius: 13px; background: rgba(255,253,248,.88); }
        .event-readme-stat-icon { display: grid; place-items: center; width: 29px; height: 29px; margin-bottom: 3px; border-radius: 9px; background: #e8eadc; color: #596d4b; }
        .event-readme-stats strong { color: #34442d; font-size: 17px; letter-spacing: -.025em; }
        .event-readme-stats small { color: #817b6e; font-size: 10px; line-height: 1.4; }
        .event-readme-explainer-grid { display: grid; gap: 9px; }
        .event-readme-card { display: grid; gap: 7px; padding: 12px; border: 1px solid #e6e3d7; border-radius: 13px; background: rgba(255,253,248,.72); }
        .event-readme-card-icon { display: grid; place-items: center; width: 31px; height: 31px; border-radius: 10px; color: #576a48; background: #e7eadc; }
        .event-readme-card h3, .event-readme-subheading h3 { margin: 0; color: #3e4b34; font-size: 13px; }
        .event-readme-card p { margin: 0; color: #737465; font-size: 11px; line-height: 1.65; }
        .event-readme-threats, .event-readme-help { display: grid; gap: 10px; padding-top: 2px; }
        .event-readme-subheading { display: flex; align-items: center; gap: 9px; }
        .event-readme-subheading > div > .eyebrow { margin: 0 0 3px; font-size: 8px; }
        .event-readme-threat-grid { display: grid; gap: 8px; }
        .event-readme-threat-grid article { padding: 10px; border-left: 3px solid #b2bd97; border-radius: 0 10px 10px 0; background: rgba(234,235,222,.65); }
        .event-readme-threat-grid strong { display: block; margin-bottom: 3px; color: #47513b; font-size: 11px; }
        .event-readme-threat-grid p { margin: 0; color: #777768; font-size: 10px; line-height: 1.55; }
        .event-readme-caveat { margin: 0; color: #898373; font-size: 9px; line-height: 1.5; }
        .event-readme-help ul { display: grid; gap: 8px; margin: 0; padding-left: 18px; color: #707563; font-size: 10px; line-height: 1.55; }
        .event-readme-sources { display: grid; gap: 8px; padding-top: 11px; border-top: 1px solid #e4e3d7; }
        .event-readme-sources > span { color: #8a8576; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
        .event-readme-sources a { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: #596c49; font-size: 10px; font-weight: 750; text-decoration: none; }
        .event-readme-sources a:hover { text-decoration: underline; }
        .event-more-species { margin: 13px 0 0; padding: 10px; border-radius: 11px; color: #516146; background: #e9ecdf; font-size: 11px; font-weight: 750; line-height: 1.5; text-align: center; }
        .event-detail-screen { padding-bottom: 28px; }
        .event-back-button { display: inline-flex; align-items: center; gap: 5px; padding: 7px 0 12px; border: 0; background: transparent; color: #63734e; font-size: 12px; font-weight: 800; cursor: pointer; }
        .event-detail-hero { position: relative; display: flex; min-height: 350px; align-items: flex-end; overflow: hidden; border-radius: 22px; background: #243a2e; color: #fffdf5; isolation: isolate; }
        .event-detail-hero > img, .event-detail-hero-shade { position: absolute; z-index: -1; inset: 0; width: 100%; height: 100%; }
        .event-detail-hero > img { object-fit: cover; }
        .event-detail-hero-shade { background: linear-gradient(180deg, rgba(18,31,24,.12) 0%, rgba(18,31,24,.10) 25%, rgba(18,31,24,.88) 100%); }
        .event-detail-hero-content { display: grid; width: 100%; gap: 10px; padding: 21px; }
        .event-detail-kicker { display: inline-flex; align-items: center; gap: 6px; color: #e3ead6; font-size: 9px; font-weight: 850; letter-spacing: .13em; }
        .event-detail-hero h1 { max-width: 450px; margin: 0; color: #fffdf5; font-size: clamp(34px, 8vw, 48px); line-height: .97; letter-spacing: -.055em; }
        .event-detail-quote { max-width: 410px; margin: 0; color: #f1eedf; font-family: Georgia, serif; font-size: 16px; line-height: 1.42; }
        .event-detail-pills { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin-top: 3px; }
        .event-detail-pills span { display: inline-flex; align-items: center; gap: 5px; padding: 7px 9px; border: 1px solid rgba(255,255,255,.27); border-radius: 99px; background: rgba(20,32,25,.32); color: #fffdf5; font-size: 9px; font-weight: 700; backdrop-filter: blur(8px); }
        .event-intro-row { display: grid; gap: 8px; padding: 22px 2px 20px; }
        .event-intro-row .eyebrow { margin: 0 0 5px; }
        .event-intro-row h2, .event-checklist-heading h2 { margin: 0; color: #303a27; font-size: 22px; letter-spacing: -.035em; line-height: 1.1; }
        .event-intro-row > p { margin: 0; color: #787465; font-size: 12px; line-height: 1.65; }
        .event-checklist-section { padding: 16px 13px 13px; border: 1px solid #e8e2d6; border-radius: 18px; background: rgba(255,253,248,.85); }
        .event-checklist-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 13px; }
        .event-checklist-heading .eyebrow { margin: 0 0 5px; }
        .event-checklist-heading h2 { font-size: 20px; }
        .event-checklist-heading p:not(.eyebrow) { margin: 5px 0 0; color: #827d70; font-size: 10px; line-height: 1.5; }
        .event-count { display: inline-flex; align-items: center; gap: 5px; flex: 0 0 auto; padding: 7px 9px; border-radius: 99px; background: #e9eadf; color: #536446; font-size: 10px; font-weight: 800; }
        .event-species-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 8px; }
        .event-species-card { min-width: 0; overflow: hidden; border-radius: 12px; border: 1px solid #ece6da; background: #fffef9; }
        .event-species-photo { position: relative; aspect-ratio: 1.15 / 1; overflow: hidden; background: linear-gradient(135deg,#e2e6d6,#b9c9b1); }
        .event-species-photo > img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
        .event-species-card:hover .event-species-photo > img { transform: scale(1.05); }
        .event-species-photo-fallback { display: grid; place-items: center; width: 100%; height: 100%; color: #657652; }
        .event-species-photo-fallback svg { width: 30px; height: 30px; }
        .event-species-group-icon { position: absolute; right: 6px; bottom: 6px; display: grid; place-items: center; width: 24px; height: 24px; border: 1px solid rgba(255,255,255,.65); border-radius: 8px; color: #314432; background: rgba(255,253,245,.92); }
        .event-species-name { display: grid; gap: 3px; padding: 8px 7px 9px; }
        .event-species-name strong { display: -webkit-box; overflow: hidden; color: #38402d; font-size: 10px; font-weight: 800; line-height: 1.35; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        .event-species-name span { color: #858071; font-size: 9px; }
        .event-photo-loading { display: flex; align-items: center; gap: 7px; margin: 12px 0 0; color: #817b6e; font-size: 10px; }
        .event-photo-loading > span { width: 8px; height: 8px; border-radius: 50%; background: #778660; box-shadow: 0 0 0 4px #e7e9dc; }
        .event-species-note { margin: 13px 0 0; padding-top: 11px; border-top: 1px solid #ece6da; color: #817b6e; font-size: 10px; line-height: 1.6; }
        .event-field-note { display: flex; align-items: flex-start; gap: 11px; margin-top: 13px; padding: 14px; border-radius: 15px; background: #e9eadf; }
        .event-field-note > span { display: grid; place-items: center; width: 36px; height: 36px; flex: 0 0 36px; border-radius: 11px; color: #526448; background: #f8f6ed; }
        .event-field-note strong { color: #435039; font-size: 12px; }
        .event-field-note p { margin: 4px 0 0; color: #707563; font-size: 10px; line-height: 1.55; }
        .event-sources { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 13px; color: #888172; font-size: 9px; }
        .event-sources a { display: inline-flex; align-items: center; gap: 4px; color: #5e724d; font-size: 10px; font-weight: 800; text-decoration: none; }
        @media (min-width: 620px) { .event-featured-card { min-height: 315px; padding: 21px; } .event-detail-hero { min-height: 410px; } .event-species-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; } .event-species-name strong { font-size: 12px; } .event-intro-row { grid-template-columns: 1fr 1.1fr; align-items: start; gap: 18px; } .event-readme-explainer-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .event-readme-threat-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .explore-feature-panel { padding: 18px; } }
        @media (max-width: 350px) { .event-species-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .event-featured-bottom { align-items: flex-start; flex-direction: column; } .event-featured-card { min-height: 300px; } .event-detail-hero-content { padding: 17px; } }
        @media (prefers-reduced-motion: reduce) { .explore-feature-panel, .explore-module-icon, .event-featured-image, .event-species-photo > img { transition: none !important; } .explore-feature-panel:hover { transform: none; } }
        .home-explore-banner { margin-top: 2px; }
        .home-explore-banner > img { object-position: center 42%; }
        /* Keep the first Explore card compact even where generic feature-panel styles are declared later. */
        .explore-local-panel { margin: 8px 0 12px; padding: 11px 12px 12px; }
        .explore-local-panel .explore-module-heading { margin-bottom: 8px; }
        .explore-local-panel .explore-module-heading h2 { font-size: 17px; line-height: 1.15; }
        .explore-local-panel .explore-module-heading p:not(.eyebrow) { margin-top: 3px; font-size: 10px; line-height: 1.35; }
        .explore-local-panel .explore-module-icon { flex-basis: 34px; width: 34px; height: 34px; }
        .explore-local-panel .explore-map-wrap { height: clamp(118px, 30vw, 148px); }
        .explore-local-panel .explore-map-empty { min-height: 118px; gap: 5px; padding: 12px; }
        .explore-local-panel .explore-map-empty-icon { width: 35px; height: 35px; }
        .explore-local-panel .explore-map-empty strong { font-size: 12px; }
        .explore-local-panel .explore-map-empty > span:last-child { max-width: 280px; font-size: 10px; line-height: 1.35; }
        .explore-local-panel .map-footer { padding-top: 9px; padding-bottom: 9px; }
        .explore-complete-hint { display: flex; align-items: center; gap: 10px; margin: 10px 0 2px; padding: 11px 12px; border: 1px solid #d7dfc8; border-radius: 13px; background: #f0f3e8; color: #34412b; animation: explore-hint-in .22s ease-out both; }
        .explore-complete-mark { display: grid; place-items: center; flex: 0 0 25px; width: 25px; height: 25px; border-radius: 50%; background: #34412b; color: #fffdf8; font-size: 14px; font-weight: 800; }
        .explore-complete-hint > div { display: grid; gap: 3px; min-width: 0; }
        .explore-complete-hint strong { font-size: 12px; line-height: 1.25; }
        .explore-complete-hint span:last-child { color: #6c735f; font-size: 11px; line-height: 1.4; }
        @keyframes explore-hint-in { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }
        .explore-results-panel { position: relative; margin: 12px 0 18px; padding: 12px 0 0; border-top: 1px solid #e3dece; }
        .home-compendium-empty { display: flex; align-items: center; flex-wrap: wrap; gap: 9px; padding: 14px; border: 1px dashed #d9d8c8; border-radius: 13px; color: #737764; font-size: 12px; }
        .home-compendium-empty > svg { color: #657552; flex: 0 0 auto; }
        .home-compendium-empty .text-link { margin-left: auto; }
        .compendium-empty { display: grid; justify-items: center; gap: 9px; margin-top: 14px; padding: 30px 18px; border: 1px dashed #d7d8c6; border-radius: 18px; background: rgba(255,253,248,.72); text-align: center; }
        .compendium-empty-mark { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 16px; color: #5c704b; background: #e6eadb; }
        .compendium-empty h2 { margin: 0; color: #39442f; font-size: 19px; line-height: 1.2; }
        .compendium-empty p { max-width: 300px; margin: 0; color: #747768; font-size: 12px; line-height: 1.6; }
        .compendium-empty-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 5px; }
        .species-photo-placeholder { display: grid; width: 100%; height: 100%; place-items: center; color: #647650; background: #e9ecdf; }
        .clickable-leader-row { display: flex; width: 100%; align-items: center; gap: 10px; border: 0; text-align: left; font: inherit; cursor: pointer; transition: background .18s ease, transform .18s ease; }
        .clickable-leader-row:hover, .clickable-leader-row:focus-visible { background: rgba(232,235,220,.78); outline: 2px solid #cbd3b9; outline-offset: -2px; }
        .clickable-leader-row:hover { transform: translateY(-1px); }
        .clickable-leader-row > div { flex: 1; min-width: 0; }
        .clickable-leader-row > b { white-space: nowrap; }
        .clickable-leader-row > svg { flex: 0 0 auto; color: #647650; }
        .community-feed-empty { display: grid; justify-items: start; gap: 8px; margin-top: 18px; padding: 18px; border: 1px solid #e4e3d7; border-radius: 16px; background: rgba(255,253,248,.78); }
        .community-feed-empty h2 { margin: 0; color: #3d4932; font-size: 17px; }
        .community-feed-empty p { margin: 0; color: #777967; font-size: 12px; line-height: 1.55; }
        .user-profile-panel { display: grid; gap: 16px; }
        .user-profile-heading { display: grid; justify-items: center; gap: 6px; padding: 15px 0; text-align: center; }
        .user-profile-avatar { display: grid; place-items: center; width: 64px; height: 64px; border: 3px solid #e1e6d4; border-radius: 50%; background: #35432e; color: #fffdf5; font-size: 19px; font-weight: 850; }
        .user-profile-heading .eyebrow { margin: 5px 0 0; }
        .user-profile-heading h2 { margin: 0; color: #303a27; font-size: 25px; }
        .user-profile-heading > p:last-child { margin: 0; color: #6e7562; font-size: 12px; }
        .user-profile-species { display: grid; gap: 10px; text-align: left; }
        .user-profile-species h3 { margin: 0; color: #3f4934; font-size: 14px; }
        .user-profile-species ul { display: grid; gap: 0; max-height: 42vh; overflow-y: auto; margin: 0; padding: 0; list-style: none; border: 1px solid #e5e2d7; border-radius: 12px; }
        .user-profile-species li { display: grid; gap: 3px; padding: 10px 12px; border-bottom: 1px solid #eeece4; }
        .user-profile-species li:last-child { border-bottom: 0; }
        .user-profile-species li span { color: #3c4632; font-size: 12px; font-weight: 750; }
        .user-profile-species li em { color: #888170; font-size: 10px; }
        @media (prefers-reduced-motion: reduce) { .clickable-leader-row { transition: none; } .clickable-leader-row:hover { transform: none; } }

      `}</style>

    </main>

  );

}
