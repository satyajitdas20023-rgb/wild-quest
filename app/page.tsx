

'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Award,
  Bell,
  Bird,
  BookOpen,
  Camera,
  ChevronRight,
  CircleHelp,
  Compass,
  Fish,
  Flower2,
  Footprints,
  Headphones,
  Leaf,
  MapPin,
  Menu,
  Mic,
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

const species = [
  { name: 'European Robin', latin: 'Erithacus rubecula', category: 'Bird', points: 20, rarity: 'Uncommon', image: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=600&q=85' },
  { name: 'Field Poppy', latin: 'Papaver rhoeas', category: 'Plant', points: 10, rarity: 'Common', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=85' },
  { name: 'Common Blue', latin: 'Polyommatus icarus', category: 'Insect', points: 35, rarity: 'Rare', image: 'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=600&q=85' },
  { name: 'Atlantic Salmon', latin: 'Salmo salar', category: 'Fish', points: 35, rarity: 'Rare', image: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=600&q=85' },
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

function Home({ onTab, onOpen }: { onTab: (tab: Tab) => void; onOpen: (kind: string) => void }) {
  return <div className="screen">
    <section className="intro"><p className="eyebrow">SATURDAY, 12 OCTOBER</p><h1>Good morning, Alex.</h1><div className="location"><MapPin size={14} /> Bristol, UK <span className="dot" /> Demonstration location</div></section>
    <section className="progress-card"><div className="progress-top"><div><span className="eyebrow light">THIS WEEK&apos;S QUEST</span><h2>65 <small>/ 150 pts</small></h2></div><div className="difficulty">MEDIUM <ChevronRight size={14} /></div></div><div className="progress-track"><span style={{ width: '43%' }} /></div><div className="progress-bottom"><span>85 points to go</span><span>43% complete</span></div></section>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">KEEP EXPLORING</p><h2>Continue your quest</h2></div><button className="text-link" onClick={() => onTab('quests')}>View all <ArrowRight size={15} /></button></div><div className="active-quest"><img src={quests[0].image} alt="Sunlight through a green woodland" /><div className="quest-overlay"><span className="pill">ACTIVE QUEST</span><h3>Wildlife Explorer</h3><p>2 of 5 discoveries this week</p><button className="cream-button" onClick={() => onTab('quests')}>Continue quest <ArrowRight size={15} /></button></div></div></section>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">CAPTURE A MOMENT</p><h2>Make a discovery</h2></div></div><div className="action-grid"><button className="action-card" onClick={() => onOpen('photo')}><span className="action-icon sage"><Camera size={21} /></span><span><strong>Photograph</strong><small>Identify a species</small></span><ArrowRight size={16} /></button><button className="action-card" onClick={() => onOpen('audio')}><span className="action-icon brown"><Mic size={21} /></span><span><strong>Record a call</strong><small>Listen for wildlife</small></span><ArrowRight size={16} /></button></div></section>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">NEARBY, DEMONSTRATION</p><h2>Worth a closer look</h2></div><button className="text-link" onClick={() => onTab('explore')}>Explore <ArrowRight size={15} /></button></div><div className="recommendation"><img src={species[0].image} alt="European robin perched on a branch" /><div><span className="rarity">UNCOMMON · 20 PTS</span><h3>European Robin</h3><p>Often found in woodland edges and quiet gardens.</p><button className="outline-button" onClick={() => onTab('explore')}>Where should I look?</button></div></div></section>
    <section className="section-block collection-strip"><div className="section-heading"><div><p className="eyebrow">YOUR FIELD NOTES</p><h2>Recently collected</h2></div><button className="text-link" onClick={() => onTab('collection')}>See collection <ArrowRight size={15} /></button></div><div className="mini-row">{species.slice(0, 3).map((item) => <button className="mini-card" key={item.name} onClick={() => onTab('collection')}><img src={item.image} alt="" /><span>{item.name}</span></button>)}</div></section>
  </div>
}

function Quests({ onOpen }: { onOpen: (kind: string) => void }) { const [difficulty, setDifficulty] = useState('Medium'); return <div className="screen"><div className="page-title"><p className="eyebrow">YOUR WEEKLY ADVENTURE</p><h1>Choose your path.</h1><p>Every mode is a different way to pay attention. Pick one and make it yours.</p></div><div className="difficulty-row">{['Easy', 'Medium', 'Hard'].map((item) => <button key={item} className={difficulty === item ? 'difficulty-chip selected' : 'difficulty-chip'} onClick={() => setDifficulty(item)}>{item}<small>{item === 'Easy' ? '50 pts' : item === 'Medium' ? '150 pts' : '300 pts'}</small></button>)}</div><div className="quest-list">{quests.map((quest, index) => { const Icon = quest.icon; return <article className="quest-card" key={quest.title}><img src={quest.image} alt="" /><div className="quest-card-body"><div className="quest-card-top"><span className="round-icon" style={{ background: quest.color }}><Icon size={19} /></span><span className="quest-status">{index === 0 ? 'IN PROGRESS' : 'READY'}</span></div><h2>{quest.title}</h2><p>{quest.desc}</p><span className="quest-meta"><MapPin size={13} /> {quest.habitats}</span><div className="quest-card-bottom"><span>{quest.progress}</span><button className="dark-button" onClick={() => onOpen('quest')}>{index === 0 ? 'Continue' : 'Start'} <ArrowRight size={15} /></button></div></div></article> })}</div></div> }

function Explore({ onOpen }: { onOpen: (kind: string) => void }) { return <div className="screen"><div className="page-title"><p className="eyebrow">DEMONSTRATION EXPLORATION</p><h1>Look a little closer.</h1><p>Recommendations are examples, not verified live sightings.</p></div><div className="searchbox"><Search size={18} /><span>Search a species or habitat</span></div><div className="filter-row"><button className="filter active">All habitats</button><button className="filter">Woodland</button><button className="filter">Coastal</button></div><div className="map-card"><div className="map-art"><span className="map-label one">Woodland edge</span><span className="map-label two">Harbourside</span><div className="map-pin"><MapPin size={18} /></div></div><div className="map-footer"><div><strong>Places to explore</strong><span><MapPin size={13} /> Bristol, UK · demonstration</span></div><button className="outline-button" onClick={() => onOpen('location')}>Change</button></div></div><div className="section-heading compact"><div><p className="eyebrow">SUITABLE HABITATS</p><h2>Where should I look?</h2></div><button className="icon-button"><MoreHorizontal size={19} /></button></div>{species.slice(0, 3).map((item) => <div className="habitat-row" key={item.name}><img src={item.image} alt="" /><div><span className="rarity">{item.rarity.toUpperCase()} · {item.points} PTS</span><h3>{item.name}</h3><p>{item.category} · Suitable habitat nearby</p></div><ChevronRight size={17} /></div>)}</div> }

function Collection({ onOpen }: { onOpen: (kind: string) => void }) { const [query, setQuery] = useState(''); const shown = species.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())); return <div className="screen"><div className="page-title collection-title"><div><p className="eyebrow">YOUR FIELD GUIDE</p><h1>Collection</h1></div><div className="collection-count"><strong>12</strong><span>unique species</span></div></div><div className="collection-stats"><div><strong>240</strong><span>accepted points</span></div><div><strong>8%</strong><span>of local guide</span></div><div><strong>4</strong><span>this month</span></div></div><div className="searchbox"><Search size={18} /><input aria-label="Search collection" placeholder="Search species" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="filter-row"><button className="filter active">All</button><button className="filter">Birds</button><button className="filter">Plants</button><button className="filter">Insects</button></div><div className="species-grid">{shown.map((item) => <button className={`species-card rarity-${item.rarity.toLowerCase().replace(' ', '-')}`} key={item.name} onClick={() => onOpen('species')}><div className="species-photo"><img src={item.image} alt={item.name} /><span className="species-points">+{item.points} pts</span><span className="species-stamp">FIELD NOTE</span></div><div className="species-copy"><strong>{item.name}</strong><em>{item.latin}</em></div><div className="species-meta"><span className="species-category">{item.category}</span><span className="species-rarity">{item.rarity}</span></div></button>)}</div></div> }

function Community() { return <div className="screen"><div className="page-title"><p className="eyebrow">THE WILD AROUND US</p><h1>Community</h1><p>Shared discoveries from a demonstration community.</p></div><div className="leaderboard-card"><div className="leader-head"><div><span className="eyebrow light">THIS WEEK</span><h2>Field notes leaderboard</h2></div><Trophy size={25} /></div><div className="leader-row you"><span className="rank">01</span><span className="community-avatar">AM</span><div><strong>Alex Morgan <small>YOU</small></strong><span>12 species discovered</span></div><b>65 pts</b></div>{['Maya Chen', 'Theo Williams', 'Samira Patel'].map((name, i) => <div className="leader-row" key={name}><span className="rank">0{i + 2}</span><span className="community-avatar muted">{name.split(' ').map(n => n[0]).join('')}</span><div><strong>{name} <small>DEMO</small></strong><span>{10 - i * 2} species discovered</span></div><b>{58 - i * 11} pts</b></div>)}</div><div className="section-heading compact"><div><p className="eyebrow">FROM THE COMMUNITY</p><h2>Recent discoveries</h2></div><button className="icon-button"><MoreHorizontal size={19} /></button></div><div className="community-grid">{species.slice(0, 3).map((item) => <div className="community-photo" key={item.name}><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><span>Shared by demo explorer</span></div></div>)}</div></div> }

function Modal({ kind, close }: { kind: string; close: () => void }) { return <div className="modal-backdrop" onClick={close}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={close} aria-label="Close"><X size={18} /></button>{kind === 'photo' ? <><span className="modal-icon sage"><Camera size={24} /></span><p className="eyebrow">NEW DISCOVERY</p><h2>What did you find?</h2><p className="modal-text">Choose a category, then take a photo or select one from your gallery. Identification results will be clearly labelled as demonstration results.</p><div className="modal-options"><button onClick={close}><Camera size={19} /> Take a photo</button><button onClick={close}><BookOpen size={19} /> Choose from gallery</button></div></> : kind === 'audio' ? <><span className="modal-icon brown"><Headphones size={24} /></span><p className="eyebrow">BIRD CALL RECORDING</p><h2>Listen first.</h2><p className="modal-text">Record a short soundscape without approaching nests or disturbing wildlife. Results are demonstration-only.</p><button className="record-button" onClick={close}><Mic size={20} /> Start recording</button></> : kind === 'species' ? <><img className="modal-image" src={species[0].image} alt="European robin" /><p className="eyebrow">YOUR OBSERVATION</p><h2>European Robin</h2><em>Erithacus rubecula</em><p className="modal-text">Observed today · Uncommon · 20 points. This demonstration entry is safely stored in your field guide.</p><button className="dark-button full" onClick={close}>Done <ArrowRight size={15} /></button></> : <><span className="modal-icon sage"><Sparkles size={24} /></span><p className="eyebrow">QUEST READY</p><h2>Begin Wildlife Explorer?</h2><p className="modal-text">Your weekly target is 150 points on Medium. Unique species discoveries award points once per quest.</p><button className="dark-button full" onClick={close}>Start exploring <ArrowRight size={15} /></button></>}</div></div> }

export default function Page() {
  const [tab, setTab] = useState<Tab>('home');
  const [modal, setModal] = useState<string | null>(null);
  const [profile, setProfile] = useState(false);

  return (

    <main className="app-shell">
      <div className="phone-frame">
        <Header onProfile={() => setProfile(true)} />

        {tab === 'home' && <Home onTab={setTab} onOpen={setModal} />}
        {tab === 'quests' && <Quests onOpen={setModal} />}
        {tab === 'explore' && <Explore onOpen={setModal} />}
        {tab === 'collection' && <Collection onOpen={setModal} />}
        {tab === 'community' && <Community />}

        <nav className="bottom-nav flex w-full items-center justify-around px-1 py-2">
          {(
            [
              { id: 'home', label: 'Home', icon: Leaf },
              { id: 'quests', label: 'Quests', icon: Target },
              { id: 'explore', label: 'Explore', icon: Compass },
              { id: 'collection', label: 'Collection', icon: BookOpen },
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
          close={() => {
            setModal(null);
            setProfile(false);
          }}
        />
      )}
      
    </main>
  );
}
