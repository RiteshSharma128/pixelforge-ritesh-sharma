import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Zap, Image, Layers, Users } from 'lucide-react'

const FEATURES = [
  { icon: <Image size={14}/>, text: 'Text → Image via FLUX.1 AI' },
  { icon: <Zap size={14}/>,   text: 'BG Remove · Inpaint · Upscale' },
  { icon: <Layers size={14}/>,text: 'Logo · Brand Kit · Ad Banners' },
  { icon: <Users size={14}/>, text: 'Team Workspace · Comments' },
]

const AVATARS = ['🎨','🚀','⚡','🔥','💎','🌟','🎯','🦋','🐉','🌊','🎭','🏔️']
const PLANS = [
  { id:'free', name:'Free', desc:'50 images/mo · Basic features', badge:'' },
  { id:'pro',  name:'Pro',  desc:'Unlimited · All tools · Brand Kit · Team (5)', badge:'Popular' },
  { id:'team', name:'Team', desc:'Everything in Pro · Unlimited team · Priority', badge:'' },
]

export default function AuthPage() {
  const { login, register, demoLogin } = useAuth()
  const [tab, setTab]         = useState('login')   // login | signup | onboard
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  // onboard state
  const [obStep, setObStep]   = useState(1)
  const [selAvatar, setSelAvatar] = useState('🎨')
  const [selPlan, setSelPlan] = useState('free')
  const [newUserData, setNewUserData] = useState(null)
  // form fields
  const [form, setForm] = useState({ name:'', email:'', password:'', workspace:'', role:'Designer' })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  // password strength
  const passScore = (() => {
    const p = form.password
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const passColors = ['bg-red-500','bg-orange-400','bg-yellow-400','bg-green-500']

  const handleLogin = async e => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const d = await login(form.email, form.password)
      toast.success(d.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleSignup = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Fill all fields')
    if (form.password.length < 8) return toast.error('Password min 8 characters')
    setLoading(true)
    try {
      setNewUserData({ ...form })
      setLoading(false)
      setTab('onboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setLoading(true)
    try {
      const d = await demoLogin()
      toast.success(d.message)
    } catch (err) {
      toast.error('Demo failed')
    } finally { setLoading(false) }
  }

  const finishOnboard = async () => {
    setLoading(true)
    try {
      const d = await register({
        ...newUserData,
        avatar: selAvatar,
        plan:   selPlan,
        role:   form.role,
        workspace: form.workspace || 'My Studio'
      })
      toast.success('Welcome to PixelForge! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-[#07070f]">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-[46%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#4c1d95 0%,#1e1b4b 50%,#07070f 100%)' }}>
        {/* dot pattern */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage:'radial-gradient(rgba(167,139,250,0.4) 1px,transparent 1px)', backgroundSize:'32px 32px' }}/>
        {/* glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"/>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-xl border border-white/20">✦</div>
          <div>
            <div className="text-white font-bold text-lg leading-none">PixelForge AI</div>
            <div className="text-purple-300/60 text-xs tracking-widest uppercase mt-0.5">Image Studio</div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Create.<br/>
            <span className="bg-gradient-to-r from-violet-300 to-emerald-300 bg-clip-text text-transparent">Without</span><br/>
            Limits.
          </h1>
          <p className="text-purple-200/60 text-base leading-relaxed mb-8">
            Professional AI image generation, brand kits, ad banners, and team collaboration — all free to start.
          </p>
          <div className="flex flex-col gap-3">
            {FEATURES.map((f,i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur rounded-full px-4 py-2 border border-white/10 w-fit text-sm text-white/80">
                <span className="text-violet-300">{f.icon}</span>{f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['#6d28d9','#059669','#d97706','#db2777'].map((c,i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white" style={{ background:c, borderColor:'#1e1b4b' }}>
                {['AK','PS','RM','NJ'][i]}
              </div>
            ))}
          </div>
          <p className="text-sm text-purple-200/50"><strong className="text-white/80">2,400+</strong> creators generating daily</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* LOGIN */}
          {tab === 'login' && (
            <div className="animate-fade-in">
              <div className="text-2xl font-bold text-white mb-1">Welcome back 👋</div>
              <p className="text-purple-300/60 text-sm mb-7">Sign in to your PixelForge workspace</p>

              {/* Tab switcher */}
              <div className="flex gap-1 bg-[#161625] border border-violet-900/30 rounded-xl p-1 mb-7">
                <button onClick={() => setTab('login')} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white transition-all">Sign In</button>
                <button onClick={() => setTab('signup')} className="flex-1 py-2 rounded-lg text-sm font-medium text-purple-300/60 hover:text-white transition-all">Create Account</button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={f('email')}/>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input className="input pr-10" type={showPass?'text':'password'} placeholder="Your password" value={form.password} onChange={f('password')}/>
                    <button type="button" onClick={() => setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/40 hover:text-purple-300">
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? <><span className="spinner"/>&nbsp;Signing in...</> : 'Sign In →'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5 text-purple-300/30 text-xs">
                <div className="flex-1 h-px bg-violet-900/40"/>or<div className="flex-1 h-px bg-violet-900/40"/>
              </div>
              <button onClick={handleDemo} disabled={loading} className="btn-ghost w-full justify-center py-2.5">
                🚀 Try Demo — No Account Needed
              </button>
              <p className="text-center text-xs text-purple-300/40 mt-5">
                No account? <button onClick={() => setTab('signup')} className="text-violet-400 hover:text-violet-300">Sign up free →</button>
              </p>
            </div>
          )}

          {/* SIGNUP */}
          {tab === 'signup' && (
            <div className="animate-fade-in">
              <div className="text-2xl font-bold text-white mb-1">Start creating ✦</div>
              <p className="text-purple-300/60 text-sm mb-7">Free forever. No credit card needed.</p>

              <div className="flex gap-1 bg-[#161625] border border-violet-900/30 rounded-xl p-1 mb-7">
                <button onClick={() => setTab('login')} className="flex-1 py-2 rounded-lg text-sm font-medium text-purple-300/60 hover:text-white transition-all">Sign In</button>
                <button onClick={() => setTab('signup')} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white transition-all">Create Account</button>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Name</label><input className="input" placeholder="Arjun Sharma" value={form.name} onChange={f('name')}/></div>
                  <div><label className="label">Workspace</label><input className="input" placeholder="My Studio" value={form.workspace} onChange={f('workspace')}/></div>
                </div>
                <div><label className="label">Email</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={f('email')}/></div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input className="input pr-10" type={showPass?'text':'password'} placeholder="Min 8 characters" value={form.password} onChange={f('password')}/>
                    <button type="button" onClick={() => setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/40 hover:text-purple-300">
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  {form.password && (
                    <div className="flex gap-1 mt-2">
                      {[0,1,2,3].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < passScore ? passColors[passScore-1] : 'bg-white/10'}`}/>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? <><span className="spinner"/>&nbsp;Creating...</> : 'Create Free Account →'}
                </button>
              </form>
              <div className="flex items-center gap-3 my-5 text-purple-300/30 text-xs">
                <div className="flex-1 h-px bg-violet-900/40"/>or<div className="flex-1 h-px bg-violet-900/40"/>
              </div>
              <button onClick={handleDemo} disabled={loading} className="btn-ghost w-full justify-center py-2.5">🚀 Try Demo</button>
            </div>
          )}

          {/* ONBOARDING */}
          {tab === 'onboard' && (
            <div className="animate-fade-in">
              {/* Progress */}
              <div className="flex gap-2 mb-8">
                {[1,2].map(s => (
                  <div key={s} className={`flex-1 h-1 rounded-full transition-all ${obStep >= s ? 'bg-violet-500' : 'bg-white/10'}`}/>
                ))}
              </div>

              {obStep === 1 && (
                <div>
                  <div className="text-2xl font-bold text-white mb-1">Choose your avatar</div>
                  <p className="text-purple-300/60 text-sm mb-6">And tell us your role</p>
                  <div className="grid grid-cols-6 gap-2 mb-6">
                    {AVATARS.map(av => (
                      <button key={av} onClick={() => setSelAvatar(av)}
                        className={`text-2xl p-2 rounded-xl transition-all ${selAvatar===av ? 'bg-violet-600 scale-110 ring-2 ring-violet-400' : 'bg-[#161625] hover:bg-violet-900/30'}`}>
                        {av}
                      </button>
                    ))}
                  </div>
                  <div className="mb-6">
                    <label className="label">Your Role</label>
                    <select className="select" value={form.role} onChange={f('role')}>
                      {['Designer','Marketer','Developer','Founder','Content Creator','Agency','Student','Other'].map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setObStep(2)} className="btn-primary w-full justify-center py-3">Continue →</button>
                </div>
              )}

              {obStep === 2 && (
                <div>
                  <div className="text-2xl font-bold text-white mb-1">Choose your plan</div>
                  <p className="text-purple-300/60 text-sm mb-6">Start free. Upgrade anytime.</p>
                  <div className="space-y-3 mb-6">
                    {PLANS.map(p => (
                      <div key={p.id} onClick={() => setSelPlan(p.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selPlan===p.id ? 'border-violet-500 bg-violet-900/20' : 'border-violet-900/30 hover:border-violet-700/60'}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{p.name}</span>
                          {p.badge && <span className="badge-violet text-[10px]">{p.badge}</span>}
                          {selPlan===p.id && <span className="ml-auto w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs">✓</span>}
                        </div>
                        <p className="text-sm text-purple-300/60 mt-1">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setObStep(1)} className="btn-ghost flex-1 justify-center">← Back</button>
                    <button onClick={finishOnboard} disabled={loading} className="btn-primary flex-1 justify-center">
                      {loading ? <><span className="spinner"/>&nbsp;Setting up...</> : 'Enter PixelForge ✦'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
