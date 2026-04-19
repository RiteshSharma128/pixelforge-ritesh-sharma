import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { PageHeader, LoadingBox, ImageGrid, FormCard } from '../components/ui'

const STYLES = [
  'Photorealistic','Anime / Manga','Digital Art','Oil Painting',
  'Watercolor','3D Render','Pencil Sketch','Pixel Art','Cinematic','Fantasy'
]

export default function GeneratePage() {
  const [prompt,  setPrompt]  = useState('')
  const [neg,     setNeg]     = useState('')
  const [style,   setStyle]   = useState('Photorealistic')
  const [count,   setCount]   = useState(2)
  const [loading, setLoading] = useState(false)
  const [images,  setImages]  = useState([])

  // Pick up template prompt from TemplatesPage
  useEffect(() => {
    const tp = sessionStorage.getItem('pf_template_prompt')
    if (tp) {
      setPrompt(tp)
      sessionStorage.removeItem('pf_template_prompt')
    }
  }, [])

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Enter a prompt first!')
    setLoading(true)
    setImages([])
    try {
      const { data } = await api.post('/images/generate', {
        prompt,
        style,
        count,
        negativePrompt: neg
      })
      setImages(data.images || [])
      toast.success(data.message)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={<Sparkles size={20}/>}
        title="Text to Image"
        subtitle="Describe your vision — FLUX.1 AI brings it to life instantly"/>

      <FormCard>
        <div className="mb-4">
          <label className="label">Prompt</label>
          <textarea
            className="textarea min-h-24"
            placeholder="A cinematic portrait of a cyberpunk samurai at neon-lit Tokyo streets, rain reflections, ultra detailed, 8K photography..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}/>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="label">Style</label>
            <select className="select" value={style} onChange={e => setStyle(e.target.value)}>
              {STYLES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Count</label>
            <select className="select" value={count} onChange={e => setCount(+e.target.value)}>
              {[1,2,4].map(n => <option key={n} value={n}>{n} image{n>1?'s':''}</option>)}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-end">
            <button onClick={generate} disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <><span className="spinner"/>Generating...</> : <><Sparkles size={15}/>Generate</>}
            </button>
          </div>
        </div>

        <div>
          <label className="label">
            Negative Prompt
            <span className="normal-case text-purple-300/30 font-normal ml-1">(optional)</span>
          </label>
          <input
            className="input"
            placeholder="blurry, low quality, watermark, deformed..."
            value={neg}
            onChange={e => setNeg(e.target.value)}/>
        </div>
      </FormCard>

      {loading && <LoadingBox message={`Generating ${count} image${count>1?'s':''}...`}/>}

      {!loading && images.length > 0 && (
        <div className="card p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Results</h3>
            <span className="badge-violet">{images.length} generated</span>
          </div>
          <ImageGrid images={images}/>
        </div>
      )}
    </div>
  )
}
