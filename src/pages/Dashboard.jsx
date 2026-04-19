import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Sparkles, RefreshCw, Scissors, Paintbrush, ArrowUpCircle,
  Diamond, Palette, LayoutTemplate, Megaphone, Share2,
  Grid, Users, MessageSquare, Settings, LogOut, Menu, X, Download, Zap
} from 'lucide-react'

import GeneratePage   from './GeneratePage'
import VariationsPage from './VariationsPage'
import BgRemovePage   from './BgRemovePage'
import InpaintPage    from './InpaintPage'
import UpscalePage    from './UpscalePage'
import LogoPage       from './LogoPage'
import BrandKitPage   from './BrandKitPage'
import TemplatesPage  from './TemplatesPage'
import AdsPage        from './AdsPage'
import SocialPage     from './SocialPage'
import GalleryPage    from './GalleryPage'
import TeamPage       from './TeamPage'
import CommentsPage   from './CommentsPage'
import SettingsPage   from './SettingsPage'

const NAV = [
  { group: 'Create', items: [
    { to: '/',           label: 'Text to Image',  icon: <Sparkles size={16}/> },
    { to: '/variations', label: 'Variations',     icon: <RefreshCw size={16}/> },
    { to: '/templates',  label: 'Templates',      icon: <LayoutTemplate size={16}/> },
  ]},
  { group: 'Edit', items: [
    { to: '/bg-remove',  label: 'Remove BG',      icon: <Scissors size={16}/> },
    { to: '/inpaint',    label: 'Inpainting',      icon: <Paintbrush size={16}/> },
    { to: '/upscale',    label: 'Upscaling',       icon: <ArrowUpCircle size={16}/> },
  ]},
  { group: 'Brand', items: [
    { to: '/logo',       label: 'Logo Generator',  icon: <Diamond size={16}/> },
    { to: '/brand-kit',  label: 'Brand Kit',       icon: <Palette size={16}/> },
  ]},
  { group: 'Marketing', items: [
    { to: '/ads',        label: 'Ad Banners',      icon: <Megaphone size={16}/> },
    { to: '/social',     label: 'Social Posts',    icon: <Share2 size={16}/> },
  ]},
  { group: 'Workspace', items: [
    { to: '/gallery',    label: 'Gallery',         icon: <Grid size={16}/> },
    { to: '/team',       label: 'Team',            icon: <Users size={16}/> },
    { to: '/comments',   label: 'Comments',        icon: <MessageSquare size={16}/> },
  ]},
]

function SidebarContent({ onClose, user, onLogout, navigate }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-violet-900/25">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">✦</div>
        <div>
          <div className="text-white font-bold text-sm leading-none">PixelForge</div>
          <div className="text-purple-300/40 text-[9px] tracking-widest uppercase mt-0.5">AI Studio</div>
        </div>
        <button onClick={onClose} className="lg:hidden ml-auto text-purple-300/40 hover:text-white p-1">
          <X size={16}/>
        </button>
      </div>

      {/* User chip */}
      <div
        className="mx-3 mt-3 p-2.5 bg-[#161625] border border-violet-900/25 rounded-xl flex items-center gap-2 cursor-pointer hover:border-violet-600/40 transition-colors"
        onClick={() => { navigate('/settings'); onClose(); }}>
        <div className="text-xl leading-none flex-shrink-0">{user?.avatar || '🎨'}</div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-semibold truncate">{user?.name || 'User'}</div>
          <div className="text-purple-300/40 text-[10px] uppercase tracking-wide">{user?.plan || 'free'} plan</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV.map(g => (
          <div key={g.group}>
            <div className="text-[10px] font-semibold text-purple-300/30 uppercase tracking-widest px-3 mb-1.5">
              {g.group}
            </div>
            {g.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }>
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-violet-500 rounded-r"/>}
                    <span className={isActive ? 'text-violet-400' : 'text-purple-300/40'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-violet-900/25 space-y-1">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-violet-500 rounded-r"/>}
              <Settings size={15} className={isActive ? 'text-violet-400' : 'text-purple-300/40'}/>
              Settings
            </>
          )}
        </NavLink>
        <button
          onClick={onLogout}
          className="nav-item w-full text-rose-400/60 hover:text-rose-400 hover:bg-rose-900/10">
          <LogOut size={15}/>Sign Out
        </button>
      </div>
    </>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const planClass =
    user?.plan === 'pro'  ? 'badge-violet' :
    user?.plan === 'team' ? 'badge-teal'   : 'badge-amber'

  return (
    <div className="flex min-h-screen bg-[#07070f]">

      {/* Sidebar — desktop always visible, mobile toggle */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-56 z-50
        bg-[#0f0f1a] border-r border-violet-900/25 flex flex-col
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent
          onClose={() => setSidebarOpen(false)}
          user={user}
          onLogout={handleLogout}
          navigate={navigate}/>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}/>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 bg-[#07070f]/90 backdrop-blur border-b border-violet-900/20 flex items-center gap-3 px-5">
          <button className="lg:hidden text-purple-300/60 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={20}/>
          </button>
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-violet-400"/>
            <span className="text-xs font-semibold text-purple-300/50 uppercase tracking-widest truncate max-w-[180px]">
              {user?.workspace || 'My Studio'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`badge text-[10px] ${planClass}`}>
              {(user?.plan || 'free').toUpperCase()}
            </span>
            <a
              href="/api/gallery/download-zip"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost py-1.5 px-3 text-xs">
              <Download size={13}/>ZIP
            </a>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-5 max-w-5xl mx-auto w-full">
          <Routes>
            <Route index              element={<GeneratePage/>}/>
            <Route path="variations"  element={<VariationsPage/>}/>
            <Route path="templates"   element={<TemplatesPage/>}/>
            <Route path="bg-remove"   element={<BgRemovePage/>}/>
            <Route path="inpaint"     element={<InpaintPage/>}/>
            <Route path="upscale"     element={<UpscalePage/>}/>
            <Route path="logo"        element={<LogoPage/>}/>
            <Route path="brand-kit"   element={<BrandKitPage/>}/>
            <Route path="ads"         element={<AdsPage/>}/>
            <Route path="social"      element={<SocialPage/>}/>
            <Route path="gallery"     element={<GalleryPage/>}/>
            <Route path="team"        element={<TeamPage/>}/>
            <Route path="comments"    element={<CommentsPage/>}/>
            <Route path="settings"    element={<SettingsPage/>}/>
            <Route path="*"           element={<GeneratePage/>}/>
          </Routes>
        </main>
      </div>
    </div>
  )
}
