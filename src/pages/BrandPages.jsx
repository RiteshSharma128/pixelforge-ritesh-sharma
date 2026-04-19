import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Diamond, Palette, LayoutTemplate, Megaphone, Share2, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { PageHeader, LoadingBox, ImageGrid, DropZone, FormCard } from '../components/ui'

// ─── LOGO GENERATOR ───────────────────────────────────────
export function LogoPage() {
  const [form,    setForm]    = useState({ brandName:'', industry:'', style:'Minimalist & Modern', colorMood:'Deep Purple & Gold', extra:'' })
  const [loading, setLoading] = useState(false)
  const [images,  setImages]  = useState([])
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const generate = async () => {
    if (!form.brandName.trim()) return toast.error('Enter a brand name')
    setLoading(true); setImages([])
    try {
      const { data } = await api.post('/images/logo', form)
      setImages(data.images)
      toast.success(data.message)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<Diamond size={20}/>} title="Logo Generator" subtitle="Create 4 professional logo concepts for your brand using AI"/>
      <FormCard>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="label">Brand Name</label><input className="input" placeholder="PixelForge" value={form.brandName} onChange={f('brandName')}/></div>
          <div><label className="label">Industry</label><input className="input" placeholder="Tech, Fashion, Food..." value={form.industry} onChange={f('industry')}/></div>
          <div>
            <label className="label">Style</label>
            <select className="select" value={form.style} onChange={f('style')}>
              {['Minimalist & Modern','Bold & Geometric','Playful & Colorful','Elegant & Luxury','Retro & Vintage','Tech & Futuristic'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Color Mood</label>
            <select className="select" value={form.colorMood} onChange={f('colorMood')}>
              {['Deep Purple & Gold','Electric Blue & White','Emerald & Black','Coral & Cream','Navy & Silver','Red & Black'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="label">Extra Instructions <span className="normal-case text-purple-300/30 font-normal">(optional)</span></label>
          <textarea className="textarea min-h-16" placeholder="Include mountain icon, no text in logo, minimalist lines..." value={form.extra} onChange={f('extra')}/>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary justify-center">
          {loading ? <><span className="spinner"/>Generating...</> : <><Diamond size={15}/>Generate 4 Logo Concepts</>}
        </button>
      </FormCard>
      {loading && <LoadingBox message="Generating 4 logo concepts..." sub="Each logo takes ~20s on free HF tier"/>}
      {!loading && images.length > 0 && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-white mb-4">Logo Concepts</h3>
          <ImageGrid images={images}/>
        </div>
      )}
    </div>
  )
}

// ─── BRAND KIT ────────────────────────────────────────────
export function BrandKitPage() {
  const [kit,     setKit]     = useState({ colors:['#6d28d9','#06d6a0','#f59e0b','#f43f5e','#1e1b4b'], headingFont:'Inter', tagline:'', mission:'' })
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [logoFile,setLogoFile]= useState(null)
  const [logoPreview,setLogoPreview] = useState(null)

  useEffect(() => {
    api.get('/brandkit').then(r => { if(r.data.kit) setKit(r.data.kit) }).catch(()=>{})
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/brandkit', kit)
      toast.success('Brand kit saved!')
    } catch (e) { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handleLogoFile = f => {
    setLogoFile(f)
    const r = new FileReader(); r.onload = e => { setLogoPreview(e.target.result); setKit(p=>({...p, logoUrl: e.target.result})) }; r.readAsDataURL(f)
  }

  const addColor = () => {
    const inp = document.createElement('input'); inp.type = 'color'
    inp.onchange = e => setKit(p=>({...p, colors:[...p.colors, e.target.value]}))
    inp.click()
  }

  const removeColor = i => setKit(p=>({...p, colors: p.colors.filter((_,idx)=>idx!==i)}))
  const copyColor = hex => { navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`) }

  const generatePalette = () => {
    const palettes = [
      ['#4c1d95','#6d28d9','#a78bfa','#c4b5fd','#f5f3ff'],
      ['#064e3b','#059669','#34d399','#a7f3d0','#ecfdf5'],
      ['#7f1d1d','#b91c1c','#f87171','#fecaca','#fff5f5'],
      ['#0c4a6e','#0284c7','#38bdf8','#bae6fd','#f0f9ff'],
      ['#431407','#c2410c','#fb923c','#fed7aa','#fff7ed'],
    ]
    const colors = palettes[Math.floor(Math.random()*palettes.length)]
    setKit(p=>({...p, colors})); toast.success('New palette generated!')
  }

  const exportKit = () => {
    const blob = new Blob([JSON.stringify(kit,null,2)],{type:'application/json'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'brand-kit.json'; a.click()
    toast.success('Brand kit exported!')
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<Palette size={20}/>} title="Brand Kit" subtitle="Your complete brand identity in one place"/>
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={exportKit} className="btn-ghost text-xs py-1.5 px-3"><Download size={13}/>Export JSON</button>
        <button onClick={save} disabled={saving} className="btn-primary text-xs py-1.5 px-3">
          {saving ? <><span className="spinner"/>Saving...</> : '💾 Save Kit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Logo */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Logo</h3>
          <div className="w-28 h-28 bg-[#161625] border border-violet-900/30 rounded-2xl flex items-center justify-center mb-3 overflow-hidden">
            {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain"/> : <span className="text-4xl">💎</span>}
          </div>
          <DropZone onFile={handleLogoFile} icon="📁" label="Upload logo" sub="PNG with transparency recommended"/>
        </div>

        {/* Colors */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Color Palette</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {kit.colors.map((c,i) => (
              <div key={i} className="group relative">
                <div className="w-10 h-10 rounded-xl cursor-pointer border-2 border-transparent hover:border-white/40 transition-all hover:scale-110"
                  style={{background:c}} onClick={() => copyColor(c)} title={c}/>
                <button onClick={() => removeColor(i)} className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[9px] hidden group-hover:flex items-center justify-center">×</button>
              </div>
            ))}
            <button onClick={addColor} className="w-10 h-10 rounded-xl border-2 border-dashed border-violet-900/50 hover:border-violet-500 flex items-center justify-center text-purple-300/40 hover:text-violet-400 transition-all text-lg">+</button>
          </div>
          <button onClick={generatePalette} className="btn-ghost text-xs py-1.5 px-3">✨ AI Generate Palette</button>
        </div>

        {/* Typography */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Typography</h3>
          <div style={{fontFamily: kit.headingFont}} className="bg-[#161625] border border-violet-900/20 rounded-xl p-4 text-2xl font-bold mb-3 text-white">
            Aa — {kit.headingFont}
          </div>
          <div className="bg-[#161625] border border-violet-900/20 rounded-xl p-4 text-sm text-purple-200/70 mb-4">
            Body text — regular weight for brand communications and descriptions
          </div>
          <div>
            <label className="label">Heading Font</label>
            <select className="select" value={kit.headingFont} onChange={e=>setKit(p=>({...p,headingFont:e.target.value}))}>
              {['Inter','Playfair Display','DM Serif Display','Raleway','Poppins','Montserrat'].map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Voice */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Brand Voice</h3>
          <div className="mb-3">
            <label className="label">Tagline</label>
            <input className="input" placeholder="Create. Inspire. Evolve." value={kit.tagline||''} onChange={e=>setKit(p=>({...p,tagline:e.target.value}))}/>
          </div>
          <div>
            <label className="label">Mission Statement</label>
            <textarea className="textarea min-h-20" placeholder="We empower creators to bring their vision to life..." value={kit.mission||''} onChange={e=>setKit(p=>({...p,mission:e.target.value}))}/>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TEMPLATES ────────────────────────────────────────────
const TEMPLATES = [
  { name:'Instagram Post',    size:'1080×1080', icon:'📸', cat:'Social',  p:'vibrant Instagram post lifestyle photography warm tones' },
  { name:'YouTube Thumbnail', size:'1280×720',  icon:'▶️', cat:'Video',   p:'YouTube thumbnail high contrast bold colors dramatic lighting clickbait' },
  { name:'Facebook Cover',    size:'851×315',   icon:'👥', cat:'Social',  p:'Facebook cover photo wide panoramic professional brand identity' },
  { name:'Twitter Header',    size:'1500×500',  icon:'🐦', cat:'Social',  p:'Twitter header banner minimalist abstract geometric design' },
  { name:'Google Leaderboard',size:'728×90',    icon:'📢', cat:'Ads',     p:'Google ads leaderboard banner clean CTA product showcase' },
  { name:'Product Mockup',    size:'1:1',       icon:'📦', cat:'Ecom',    p:'product mockup white background studio lighting ecommerce professional' },
  { name:'Logo Concept',      size:'512×512',   icon:'💎', cat:'Brand',   p:'logo design minimal vector scalable white background professional' },
  { name:'Ad Square',         size:'1080×1080', icon:'🎯', cat:'Ads',     p:'square ad banner bold typography product highlight strong CTA marketing' },
  { name:'LinkedIn Post',     size:'1200×627',  icon:'💼', cat:'Social',  p:'LinkedIn professional post corporate business imagery trustworthy' },
  { name:'Story',             size:'1080×1920', icon:'📱', cat:'Social',  p:'Instagram story vertical format mobile first engaging full bleed' },
  { name:'Email Header',      size:'600×200',   icon:'📧', cat:'Email',   p:'email newsletter header branded professional welcoming CTA strip' },
  { name:'Podcast Cover',     size:'3000×3000', icon:'🎙️', cat:'Audio',   p:'podcast cover art bold typography abstract background professional square' },
  { name:'Pinterest Pin',     size:'1000×1500', icon:'📌', cat:'Social',  p:'Pinterest pin vertical lifestyle photography inspirational minimal' },
  { name:'Shopify Banner',    size:'1200×400',  icon:'🛍️', cat:'Ecom',    p:'Shopify store banner product sale announcement clean minimal ecommerce' },
]

export function TemplatesPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const cats = ['All', ...new Set(TEMPLATES.map(t=>t.cat))]
  const filtered = filter==='All' ? TEMPLATES : TEMPLATES.filter(t=>t.cat===filter)

  const useTemplate = (t) => { window.location.href = `/?prompt=${encodeURIComponent(t.p)}`; toast.success(`Template "${t.name}" loaded!`) }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<LayoutTemplate size={20}/>} title="Templates" subtitle="Start with a pre-configured template — customize and generate instantly"/>
      <div className="flex gap-2 mb-5 flex-wrap">
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===c?'bg-violet-600 text-white':'bg-[#161625] text-purple-300/60 border border-violet-900/25 hover:text-white'}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map((t,i) => (
          <div key={i} onClick={() => useTemplate(t)} className="card p-0 overflow-hidden cursor-pointer hover:border-violet-500/50 hover:-translate-y-0.5 transition-all">
            <div className="aspect-video bg-[#161625] flex items-center justify-center text-4xl">{t.icon}</div>
            <div className="p-3">
              <div className="text-sm font-medium text-white mb-0.5">{t.name}</div>
              <div className="text-xs text-purple-300/40">{t.size} · {t.cat}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── AD BANNERS ───────────────────────────────────────────
const AD_SIZES = [
  { id:'728x90',   label:'728×90 Leaderboard' },
  { id:'300x250',  label:'300×250 Medium Rect' },
  { id:'1080x1080',label:'1080×1080 Square' },
  { id:'1080x1920',label:'1080×1920 Story' },
  { id:'1200x628', label:'1200×628 LinkedIn' },
]

export function AdsPage() {
  const [form,    setForm]    = useState({ product:'', cta:'Learn More', style:'Clean & Minimal', platform:'All Platforms' })
  const [sizes,   setSizes]   = useState(['728x90','300x250','1080x1080'])
  const [loading, setLoading] = useState(false)
  const [images,  setImages]  = useState([])
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const toggleSize = id => setSizes(p => p.includes(id) ? p.filter(s=>s!==id) : [...p, id])

  const generate = async () => {
    if (!form.product.trim()) return toast.error('Enter product name')
    if (!sizes.length) return toast.error('Select at least one size')
    setLoading(true); setImages([])
    try {
      const { data } = await api.post('/images/ads', { ...form, sizes })
      setImages(data.images)
      toast.success(data.message)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<Megaphone size={20}/>} title="Ad Banner Generator" subtitle="Generate ad banners in all standard sizes for Google, Facebook, Instagram"/>
      <FormCard>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="label">Product / Service</label><input className="input" placeholder="Running Shoes, SaaS App..." value={form.product} onChange={f('product')}/></div>
          <div><label className="label">CTA Text</label><input className="input" placeholder="Shop Now, Get Started..." value={form.cta} onChange={f('cta')}/></div>
          <div>
            <label className="label">Visual Style</label>
            <select className="select" value={form.style} onChange={f('style')}>
              {['Clean & Minimal','Bold & Vibrant','Dark & Cinematic','Luxury & Elegant','Fun & Playful'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Platform</label>
            <select className="select" value={form.platform} onChange={f('platform')}>
              {['All Platforms','Google Display','Facebook/Instagram','LinkedIn','Twitter/X'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="label">Banner Sizes</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {AD_SIZES.map(s => (
              <button key={s.id} onClick={() => toggleSize(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${sizes.includes(s.id)?'bg-violet-600 border-violet-500 text-white':'bg-[#161625] border-violet-900/25 text-purple-300/60 hover:text-white'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary justify-center">
          {loading ? <><span className="spinner"/>Generating...</> : <><Megaphone size={15}/>Generate {sizes.length} Banner{sizes.length!==1?'s':''}</>}
        </button>
      </FormCard>
      {loading && <LoadingBox message={`Generating ${sizes.length} ad banner${sizes.length>1?'s':''}...`}/>}
      {!loading && images.length > 0 && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-white mb-4">Banners Ready</h3>
          <ImageGrid images={images}/>
        </div>
      )}
    </div>
  )
}

// ─── SOCIAL POSTS ─────────────────────────────────────────
const PLATFORMS = [
  { id:'Instagram', dim:'1080×1080' },
  { id:'Twitter/X', dim:'1600×900'  },
  { id:'Facebook',  dim:'1200×630'  },
  { id:'LinkedIn',  dim:'1200×627'  },
]

export function SocialPage() {
  const [platform, setPlatform] = useState('Instagram')
  const [prompt,   setPrompt]   = useState('')
  const [tone,     setTone]     = useState('Energetic')
  const [loading,  setLoading]  = useState(false)
  const [images,   setImages]   = useState([])

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Describe your post')
    setLoading(true); setImages([])
    try {
      const { data } = await api.post('/images/social', { prompt, platform, tone, count: 3 })
      setImages(data.images)
      toast.success(data.message)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<Share2 size={20}/>} title="Social Media Posts" subtitle="Create scroll-stopping visuals optimized for each platform"/>
      <FormCard>
        {/* Platform tabs */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${platform===p.id?'bg-violet-600 border-violet-500 text-white':'bg-[#161625] border-violet-900/25 text-purple-300/60 hover:text-white'}`}>
              {p.id} <span className="opacity-50 ml-1">{p.dim}</span>
            </button>
          ))}
        </div>
        <div className="mb-4">
          <label className="label">Post Description</label>
          <textarea className="textarea min-h-20" placeholder="New product launch for summer collection, vibrant colors, lifestyle photography..." value={prompt} onChange={e=>setPrompt(e.target.value)}/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tone</label>
            <select className="select" value={tone} onChange={e=>setTone(e.target.value)}>
              {['Energetic','Professional','Minimalist','Luxury','Inspirational','Fun & Playful'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={generate} disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <><span className="spinner"/>Generating...</> : <><Share2 size={15}/>Generate 3 Posts</>}
            </button>
          </div>
        </div>
      </FormCard>
      {loading && <LoadingBox message={`Creating 3 ${platform} posts...`}/>}
      {!loading && images.length > 0 && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-white mb-4">{platform} Posts</h3>
          <ImageGrid images={images}/>
        </div>
      )}
    </div>
  )
}
