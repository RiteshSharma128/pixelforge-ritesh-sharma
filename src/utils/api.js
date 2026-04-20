// // src/utils/api.js
// import axios from 'axios'

// const api = axios.create({
//   baseURL: '/api',
//   withCredentials: true,
//   headers: { 'Content-Type': 'application/json' }
// })

// api.interceptors.response.use(
//   r => r,
//   err => {
//     if (err.response?.status === 401) {
//       document.cookie = 'pf_token=;expires=Thu,01 Jan 1970 00:00:00 UTC;path=/'
//       if (!window.location.pathname.includes('/auth')) window.location.href = '/auth'
//     }
//     return Promise.reject(err)
//   }
// )

// export default api

import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pixelforge-backend-thds.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      document.cookie = 'pf_token=;expires=Thu,01 Jan 1970 00:00:00 UTC;path=/'
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'
      }
    }
    return Promise.reject(err)
  }
)

export default api
