import { useState, useEffect } from 'react'
import {
  Grid, Users, MessageSquare, Settings,
  Trash2, UserPlus, Check, X, Shield, LogOut
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { PageHeader, ImageGrid, FormCard } from '../components/ui'
import { useNavigate } from 'react-router-dom'

// ─── GALLERY ──────────────────────────────────────────────
export function GalleryPage() {
  const [images,  setImages]  = useState([])
  const [stats,   setStats]   = useState({})
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)

  const TYPES = ['all','text-to-image','variation','bg-remove','inpaint','upscale','logo','ad-banner','social']

  const load = async () => {
    setLoading(true)
    try {
      const q = filter === 'all' ? '' : `type=${filter}&`
      const { data } = await api.get(`/gallery?${q}page=${page}&limit=24`)
      setImages(data.images || [])
      setTotal(data.total || 0)
    } catch (e) {
      toast.error('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data } = await api.get('/user/stats')
      if (data.success) setStats(data.stats)
    } catch (_) {}
  }

  useEffect(() => { load(); loadStats() }, [filter, page])

  const deleteImg = async id => {
    try {
      await api.delete(`/gallery/${id}`)
      setImages(p => p.filter(i => (i._id || i.id) !== id))
      toast.success('Deleted')
    } catch (_) { toast.error('Delete failed') }
  }

  const toggleFav = async id => {
    try {
      const { data } = await api.patch(`/gallery/${id}/favorite`)
      setImages(p => p.map(i => (i._id || i.id) === id ? { ...i, isFavorite: data.isFavorite } : i))
    } catch (_) {}
  }

  const clearAll = async () => {
    if (!window.confirm('Delete ALL images? Cannot be undone.')) return
    try {
      await api.delete('/gallery')
      setImages([]); setTotal(0)
      toast.success('Gallery cleared')
    } catch (_) { toast.error('Clear failed') }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<Grid size={20}/>} title="Gallery" subtitle="All your generated images — stored securely"/>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Images',    val: stats.total      || 0 },
          { label: 'Generated Today', val: stats.todayCount || 0 },
          { label: 'Team Members',    val: stats.team       || 0 },
          { label: 'Comments',        val: stats.comments   || 0 },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <div className="text-2xl font-bold text-violet-300">{s.val}</div>
            <div className="text-xs text-purple-300/50 mt-1 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => { setFilter(t); setPage(1) }}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                filter === t
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-[#161625] border-violet-900/25 text-purple-300/60 hover:text-white'
              }`}>
              {t === 'all' ? 'All' : t.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
        <a href="/api/gallery/download-zip" target="_blank" rel="noreferrer" className="btn-teal text-xs py-1.5 px-3">
          📦 ZIP
        </a>
        <button onClick={clearAll} className="btn-danger text-xs py-1.5 px-3">
          <Trash2 size={12}/>Clear
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><div className="spinner-lg"/></div>
      ) : (
        <>
          <ImageGrid images={images} onDelete={deleteImg} onFavorite={toggleFav}/>
          {total > 24 && (
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs py-1.5 px-3">← Prev</button>
              <span className="text-sm text-purple-300/50 self-center">{page} / {Math.ceil(total / 24)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 24)} className="btn-ghost text-xs py-1.5 px-3">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── TEAM ─────────────────────────────────────────────────
export function TeamPage() {
  const [members,  setMembers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [inviting, setInviting] = useState(false)
  const [form,     setForm]     = useState({ email: '', name: '', role: 'member' })

  const COLORS  = ['#6d28d9','#059669','#d97706','#db2777','#0284c7','#7c3aed']
  const AVATARS = ['👤','🎨','🚀','⚡','💎','🌟','🎯','🦋']

  useEffect(() => {
    api.get('/team')
      .then(r => setMembers(r.data.members || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const invite = async () => {
    if (!form.email.trim() || !form.name.trim()) return toast.error('Email and name required')
    setInviting(true)
    try {
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)]
      const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
      const { data } = await api.post('/team', { ...form, color, avatar })
      setMembers(p => [...p, data.member])
      setForm({ email: '', name: '', role: 'member' })
      toast.success(data.message || 'Member invited!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invite failed')
    } finally {
      setInviting(false)
    }
  }

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/team/${id}`, { role })
      setMembers(p => p.map(m => m._id === id ? { ...m, role } : m))
      toast.success(`Role updated to ${role}`)
    } catch (_) { toast.error('Role update failed') }
  }

  const removeMember = async id => {
    try {
      await api.delete(`/team/${id}`)
      setMembers(p => p.filter(m => m._id !== id))
      toast.success('Member removed')
    } catch (_) {}
  }

  const ROLE_STYLES = {
    admin:  'badge-amber',
    member: 'badge-violet',
    viewer: 'badge bg-white/5 text-purple-300/60 border border-white/10'
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<Users size={20}/>} title="Team Workspace" subtitle="Manage your workspace members and permissions"/>

      <FormCard title="Invite Member" icon={<UserPlus size={16}/>}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Name</label>
            <input
              className="input" placeholder="Priya Sharma"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}/>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input" type="email" placeholder="priya@co.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}/>
          </div>
          <div>
            <label className="label">Role</label>
            <div className="flex gap-2">
              <select className="select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <button onClick={invite} disabled={inviting} className="btn-primary whitespace-nowrap">
                {inviting ? <span className="spinner"/> : <><UserPlus size={14}/>Invite</>}
              </button>
            </div>
          </div>
        </div>
      </FormCard>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner-lg"/></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map(m => (
            <div key={m._id} className="card p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${m.color}25` }}>
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{m.name}</div>
                <div className="text-xs text-purple-300/40 truncate">{m.email}</div>
                <span className={`${ROLE_STYLES[m.role] || 'badge-violet'} mt-1 text-[10px] inline-block`}>
                  {m.role?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="bg-[#161625] border border-violet-900/25 rounded-lg text-xs text-purple-300/70 px-2 py-1 outline-none cursor-pointer"
                  value={m.role}
                  onChange={e => changeRole(m._id, e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button onClick={() => removeMember(m._id)} className="text-rose-400/50 hover:text-rose-400 transition-colors">
                  <X size={15}/>
                </button>
              </div>
            </div>
          ))}
          {!members.length && (
            <div className="col-span-2 flex flex-col items-center py-10 opacity-40">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm text-purple-300">No team members yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── COMMENTS ─────────────────────────────────────────────
export function CommentsPage() {
  const { user }  = useAuth()
  const [comments,  setComments]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [text,      setText]      = useState('')
  const [ref,       setRef]       = useState('General')
  const [replying,  setReplying]  = useState(null)
  const [replyText, setReplyText] = useState('')

  const REFS = ['General','Image Generation','Logo Concepts','Ad Banners','Brand Kit','Social Posts']

  useEffect(() => {
    api.get('/comments')
      .then(r => setComments(r.data.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const post = async () => {
    if (!text.trim()) return toast.error('Write a comment first')
    try {
      const { data } = await api.post('/comments', { text: text.trim(), ref })
      setComments(p => [data.comment, ...p])
      setText('')
      toast.success('Comment posted!')
    } catch (_) { toast.error('Post failed') }
  }

  const reply = async id => {
    if (!replyText.trim()) return
    try {
      const { data } = await api.post(`/comments/${id}/reply`, { text: replyText.trim() })
      setComments(p => p.map(c => c._id === id ? data.comment : c))
      setReplying(null); setReplyText('')
      toast.success('Reply added!')
    } catch (_) { toast.error('Reply failed') }
  }

  const resolve = async id => {
    try {
      await api.patch(`/comments/${id}/resolve`)
      setComments(p => p.map(c => c._id === id ? { ...c, isResolved: true } : c))
    } catch (_) {}
  }

  const del = async id => {
    try {
      await api.delete(`/comments/${id}`)
      setComments(p => p.filter(c => c._id !== id))
      toast.success('Deleted')
    } catch (_) {}
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<MessageSquare size={20}/>} title="Comments" subtitle="Team feedback and discussions on your projects"/>

      <FormCard title="Add Comment" icon={<MessageSquare size={16}/>}>
        <textarea
          className="textarea min-h-20 mb-3"
          placeholder="Leave feedback on any image or project..."
          value={text}
          onChange={e => setText(e.target.value)}/>
        <div className="flex gap-2">
          <select className="select flex-1" value={ref} onChange={e => setRef(e.target.value)}>
            {REFS.map(r => <option key={r}>{r}</option>)}
          </select>
          <button onClick={post} className="btn-primary whitespace-nowrap">
            Post Comment
          </button>
        </div>
      </FormCard>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner-lg"/></div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c._id} className={`card p-4 ${c.isResolved ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-violet-900/40 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                  {(c.user?.name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{c.user?.name || 'User'}</span>
                    <span className="badge-violet text-[9px]">{c.ref}</span>
                    {c.isResolved && <span className="badge-teal text-[9px]">✓ Resolved</span>}
                    <span className="text-xs text-purple-300/30 ml-auto">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-purple-200/70 mt-1 leading-relaxed">{c.text}</p>
                </div>
              </div>

              {c.replies?.length > 0 && (
                <div className="ml-11 border-l-2 border-violet-900/30 pl-3 space-y-1.5 mb-2">
                  {c.replies.map((r, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium text-white/80">{r.authorName}: </span>
                      <span className="text-purple-300/60">{r.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {replying === c._id && (
                <div className="ml-11 flex gap-2 mt-2">
                  <input
                    className="input flex-1 text-xs py-1.5"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && reply(c._id)}/>
                  <button onClick={() => reply(c._id)} className="btn-primary py-1.5 px-3 text-xs">
                    <Check size={12}/>
                  </button>
                  <button onClick={() => { setReplying(null); setReplyText('') }} className="btn-ghost py-1.5 px-3 text-xs">
                    <X size={12}/>
                  </button>
                </div>
              )}

              <div className="flex gap-3 mt-2 ml-11">
                <button
                  onClick={() => setReplying(replying === c._id ? null : c._id)}
                  className="text-xs text-purple-300/50 hover:text-violet-400">
                  ↩ Reply
                </button>
                {!c.isResolved && (
                  <button onClick={() => resolve(c._id)} className="text-xs text-teal-400/60 hover:text-teal-400">
                    ✓ Resolve
                  </button>
                )}
                {c.user?._id === user?._id && (
                  <button onClick={() => del(c._id)} className="text-xs text-rose-400/50 hover:text-rose-400 ml-auto">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {!comments.length && (
            <div className="flex flex-col items-center py-10 opacity-40">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm text-purple-300">No comments yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── SETTINGS ─────────────────────────────────────────────
// NOTE: API keys are stored in backend .env file ONLY
// Frontend only manages: name, role, workspace (profile)
export function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [saving,  setSaving]  = useState(false)
  const [profile, setProfile] = useState({
    name:      user?.name      || '',
    role:      user?.role      || 'Designer',
    workspace: user?.workspace || ''
  })

  // Sync when user object updates
  useEffect(() => {
    if (user) {
      setProfile({
        name:      user.name      || '',
        role:      user.role      || 'Designer',
        workspace: user.workspace || ''
      })
    }
  }, [user])

  const saveProfile = async () => {
    if (!profile.name.trim()) return toast.error('Name cannot be empty')
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', {
        name:      profile.name.trim(),
        role:      profile.role,
        workspace: profile.workspace.trim()
      })
      if (data.success) {
        updateUser(data.user)
        toast.success('Profile updated! ✅')
      } else {
        toast.error(data.message || 'Update failed')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed — is backend running?')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account and ALL data? This cannot be undone.')) return
    try {
      await api.delete('/user/account')
      await logout()
      navigate('/auth')
    } catch (_) { toast.error('Delete failed') }
  }

  const ROLES = ['Designer','Marketer','Developer','Founder','Content Creator','Agency','Student','Other']

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<Settings size={20}/>} title="Settings" subtitle="Manage your profile and workspace"/>

      {/* Profile Card */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={16} className="text-violet-400"/>
          <h2 className="text-base font-bold text-white">Profile</h2>
        </div>

        {/* Current user info display */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-[#161625] rounded-xl border border-violet-900/20">
          <div className="text-4xl">{user?.avatar || '🎨'}</div>
          <div>
            <div className="text-base font-semibold text-white">{user?.name}</div>
            <div className="text-sm text-purple-300/50">{user?.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge-violet text-[10px]">{(user?.plan || 'free').toUpperCase()} PLAN</span>
              <span className="text-xs text-purple-300/40">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="Your name"/>
          </div>
          <div>
            <label className="label">Role</label>
            <select
              className="select"
              value={profile.role}
              onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Workspace Name</label>
            <input
              className="input"
              value={profile.workspace}
              onChange={e => setProfile(p => ({ ...p, workspace: e.target.value }))}
              placeholder="My Creative Studio"/>
          </div>
        </div>

        <button onClick={saveProfile} disabled={saving} className="btn-primary mt-5">
          {saving ? <><span className="spinner"/>Saving...</> : '💾 Save Profile'}
        </button>
      </div>

      

      {/* Account Actions */}
      <div className="card p-5">
        <h2 className="text-base font-bold text-white mb-4">Account</h2>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleLogout} className="btn-ghost">
            <LogOut size={15}/>Sign Out
          </button>
          <button onClick={handleDeleteAccount} className="btn-danger">
            <Trash2 size={15}/>Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
