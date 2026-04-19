import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{
        style: { background: '#161625', color: '#f0eeff', border: '1px solid rgba(124,58,237,0.3)', fontSize: '13px' },
        success: { iconTheme: { primary: '#06d6a0', secondary: '#07070f' } },
        error:   { iconTheme: { primary: '#f43f5e', secondary: '#07070f' } }
      }}/>
    </BrowserRouter>
  </React.StrictMode>
)
