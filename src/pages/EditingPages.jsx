import { useState, useRef, useEffect } from 'react'
import { RefreshCw, Scissors, Paintbrush, ArrowUpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { PageHeader, LoadingBox, ImageGrid, DropZone, FormCard } from '../components/ui'

// ─── VARIATIONS ───────────────────────────────────────────
export function VariationsPage() {
  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [style,   setStyle]   = useState('')
  const [loading, setLoading] = useState(false)
  const [images,  setImages]  = useState([])

  const handleFile = f => {
    setFile(f)
    const r = new FileReader()
    r.onload = e => setPreview(e.target.result)
    r.readAsDataURL(f)
  }

  const generate = async () => {
    if (!file) return toast.error('Upload an image first')
    setLoading(true); setImages([])
    try {
      const { data } = await api.post('/images/variations', { style, count: 4 })
      setImages(data.images || [])
      toast.success(data.message)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Generation failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<RefreshCw size={20}/>} title="Image Variations" subtitle="Upload an image and generate 4 AI-powered variations"/>
      <FormCard>
        <DropZone onFile={handleFile} icon="🖼️" label="Drop image or click to upload"/>
        {preview && (
          <img src={preview} className="mt-3 h-36 rounded-xl object-contain border border-violet-900/30" alt="preview"/>
        )}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="label">Style Override</label>
            <select className="select" value={style} onChange={e => setStyle(e.target.value)}>
              <option value="">Keep Original Style</option>
              <option>Anime</option>
              <option>Oil Painting</option>
              <option>Watercolor</option>
              <option>Sketch</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={generate} disabled={loading || !file} className="btn-primary w-full justify-center py-2.5">
              {loading ? <><span className="spinner"/>Generating...</> : <><RefreshCw size={15}/>Generate 4 Variations</>}
            </button>
          </div>
        </div>
      </FormCard>
      {loading && <LoadingBox message="Creating 4 variations..."/>}
      {!loading && images.length > 0 && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-white mb-4">Variations</h3>
          <ImageGrid images={images}/>
        </div>
      )}
    </div>
  )
}

// ─── BG REMOVE ────────────────────────────────────────────
export function BgRemovePage() {
  const [original, setOriginal] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)

  const handleFile = f => {
    setResult(null)
    const r = new FileReader()
    r.onload = e => setOriginal(e.target.result)
    r.readAsDataURL(f)
  }

  const remove = async () => {
    if (!original) return toast.error('Upload an image first')
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/images/remove-bg', { imageBase64: original })
      setResult(data.image)
      toast.success(data.message)
    } catch (e) {
      toast.error(e.response?.data?.message || 'BG removal failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<Scissors size={20}/>} title="Background Remover" subtitle="Remove backgrounds instantly — powered by Remove.bg API (50 free/month)"/>
      <FormCard>
        {!original ? (
          <DropZone onFile={handleFile} icon="✂️" sub="Best results with clear foreground subjects"/>
        ) : (
          <div>
            <img src={original} className="w-full max-h-64 rounded-xl object-contain border border-violet-900/30" alt="original"/>
            <div className="flex gap-2 mt-3">
              <button onClick={remove} disabled={loading} className="btn-primary">
                {loading ? <><span className="spinner"/>Removing...</> : <><Scissors size={15}/>Remove Background</>}
              </button>
              <button onClick={() => { setOriginal(null); setResult(null) }} className="btn-ghost">Reset</button>
            </div>
          </div>
        )}
      </FormCard>
      {loading && <LoadingBox message="Removing background..." sub="Powered by Remove.bg API"/>}
      {!loading && result && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-white mb-4">Result</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label mb-2">Original</p>
              <img src={original} className="w-full rounded-xl object-cover aspect-square" alt="original"/>
            </div>
            <div>
              <p className="label mb-2">Transparent PNG {result.cloudUrl && <span className="badge-teal ml-1 text-[9px]">☁ CDN</span>}</p>
              <img
                src={result.cloudUrl || result.url}
                className="w-full rounded-xl object-cover aspect-square"
                style={{ background: 'repeating-conic-gradient(#1e1e30 0% 25%,#26263c 0% 50%) 0 0/20px 20px' }}
                alt="result"/>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <a href={result.cloudUrl || result.url} download="no-bg.png" className="btn-primary">⬇ Download PNG</a>
            {result.cloudUrl && (
              <button onClick={() => { navigator.clipboard.writeText(result.cloudUrl); toast.success('CDN URL copied!') }} className="btn-teal">
                📋 Copy CDN URL
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── INPAINTING ───────────────────────────────────────────
export function InpaintPage() {
  const [original,  setOriginal]  = useState(null)
  const [prompt,    setPrompt]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [brushSize, setBrushSize] = useState(28)
  const canvasRef = useRef(null)
  const imgRef    = useRef(null)
  const drawing   = useRef(false)
  const ctxRef    = useRef(null)

  const handleFile = f => {
    setResult(null)
    const r = new FileReader()
    r.onload = e => setOriginal(e.target.result)
    r.readAsDataURL(f)
  }

  // Init canvas AFTER image renders in DOM
  useEffect(() => {
    if (!original) return
    const timer = setTimeout(() => {
      const img    = imgRef.current
      const canvas = canvasRef.current
      if (!img || !canvas) return

      // Use actual rendered size
      const w = img.offsetWidth  || 800
      const h = img.offsetHeight || 600
      canvas.width  = w
      canvas.height = h

      const ctx = canvas.getContext('2d')
      ctx.strokeStyle = '#ff0033'
      ctx.lineWidth   = brushSize
      ctx.lineCap     = 'round'
      ctx.lineJoin    = 'round'
      ctxRef.current  = ctx
    }, 300) // wait for image to render

    return () => clearTimeout(timer)
  }, [original])

  // Update brush size
  useEffect(() => {
    if (ctxRef.current) ctxRef.current.lineWidth = brushSize
  }, [brushSize])

  const getPos = (el, e) => {
    const rect  = el.getBoundingClientRect()
    const scaleX = el.width / rect.width
    const scaleY = el.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY
    }
  }

  const startDraw = e => {
    drawing.current = true
    const p = getPos(canvasRef.current, e)
    ctxRef.current?.beginPath()
    ctxRef.current?.moveTo(p.x, p.y)
  }
  const doDraw = e => {
    if (!drawing.current || !ctxRef.current) return
    const p = getPos(canvasRef.current, e)
    ctxRef.current.lineTo(p.x, p.y)
    ctxRef.current.stroke()
  }
  const stopDraw  = () => { drawing.current = false }
  const clearMask = () => {
    if (ctxRef.current && canvasRef.current)
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    toast.success('Mask cleared')
  }

  const run = async () => {
    if (!prompt.trim()) return toast.error('Describe what to replace in the masked area')
    if (!original)      return toast.error('Upload an image first')
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/images/inpaint', { prompt: prompt.trim() })
      setResult(data.image)
      toast.success(data.message)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Inpainting failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<Paintbrush size={20}/>} title="AI Inpainting" subtitle="Upload image · Paint red mask over area · Describe replacement"/>
      <FormCard>
        {!original ? (
          <DropZone onFile={handleFile} icon="🖌️" label="Upload image to edit"/>
        ) : (
          <div>
            <p className="label mb-2">Paint red mask over the area you want to replace</p>
            <div className="relative w-full">
              <img
                ref={imgRef}
                src={original}
                className="w-full rounded-xl block"
                alt="base"
                style={{ display: 'block' }}/>
              <canvas
                ref={canvasRef}
                onMouseDown={startDraw}
                onMouseMove={doDraw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '0.75rem',
                  cursor: 'crosshair',
                  opacity: 0.65
                }}/>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <label className="label mb-0 whitespace-nowrap">Brush size</label>
              <input
                type="range" min="5" max="80"
                value={brushSize}
                onChange={e => setBrushSize(+e.target.value)}
                className="flex-1 accent-violet-500"/>
              <span className="text-xs text-purple-300/50 w-10">{brushSize}px</span>
              <button onClick={clearMask} className="btn-ghost py-1.5 px-3 text-xs">Clear</button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="label">Describe what to place in the masked area</label>
          <textarea
            className="textarea min-h-16 mt-1"
            placeholder="A beautiful sunset sky with orange clouds..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}/>
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={run} disabled={loading || !original} className="btn-primary">
            {loading ? <><span className="spinner"/>Inpainting...</> : <><Paintbrush size={15}/>Apply Inpainting</>}
          </button>
          {original && (
            <button onClick={() => { setOriginal(null); setResult(null); setPrompt('') }} className="btn-ghost">
              Reset
            </button>
          )}
        </div>
      </FormCard>

      {loading && <LoadingBox message="Running AI inpainting..."/>}
      {!loading && result && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-white mb-4">Inpainting Result</h3>
          <img
            src={result.cloudUrl || result.url}
            className="w-full max-h-96 object-contain rounded-xl border border-violet-900/30"
            alt="result"/>
          <div className="flex gap-2 mt-4">
            <a href={result.cloudUrl || result.url} download="inpainted.png" className="btn-primary">⬇ Download</a>
            {result.cloudUrl && (
              <button onClick={() => { navigator.clipboard.writeText(result.cloudUrl); toast.success('Copied!') }} className="btn-teal">
                📋 CDN URL
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── UPSCALING ────────────────────────────────────────────
export function UpscalePage() {
  const [original, setOriginal] = useState(null)
  const [factor,   setFactor]   = useState(2)
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)

  const handleFile = f => {
    setResult(null)
    const r = new FileReader()
    r.onload = e => setOriginal(e.target.result)
    r.readAsDataURL(f)
  }

  const run = async () => {
    if (!original) return toast.error('Upload an image first')
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/images/upscale', { factor })
      setResult(data.image)
      toast.success(data.message)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upscaling failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={<ArrowUpCircle size={20}/>} title="AI Upscaling" subtitle="Enhance resolution 2x or 4x with AI super-resolution"/>
      <FormCard>
        {!original ? (
          <DropZone onFile={handleFile} icon="⬆️" sub="Works best on photos and artwork"/>
        ) : (
          <img src={original} className="w-full max-h-64 object-contain rounded-xl border border-violet-900/30" alt="preview"/>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="label">Scale Factor</label>
            <select className="select" value={factor} onChange={e => setFactor(+e.target.value)}>
              <option value={2}>2x (recommended)</option>
              <option value={4}>4x (ultra quality)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={run} disabled={loading || !original} className="btn-primary w-full justify-center py-2.5">
              {loading ? <><span className="spinner"/>Upscaling...</> : <><ArrowUpCircle size={15}/>Upscale {factor}x</>}
            </button>
          </div>
        </div>

        {original && (
          <button onClick={() => { setOriginal(null); setResult(null) }} className="btn-ghost mt-2 text-xs py-1.5">
            Reset
          </button>
        )}
      </FormCard>

      {loading && <LoadingBox message={`AI Upscaling ${factor}x...`}/>}
      {!loading && result && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-white mb-4">{factor}x Upscale Result</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label mb-2">Original</p>
              <img src={original} className="w-full rounded-xl" alt="original"/>
            </div>
            <div>
              <p className="label mb-2">Upscaled {factor}x</p>
              <img src={result.cloudUrl || result.url} className="w-full rounded-xl" alt="result"/>
            </div>
          </div>
          <a href={result.cloudUrl || result.url} download={`upscaled-${factor}x.png`} className="btn-primary mt-4 inline-flex">
            ⬇ Download
          </a>
        </div>
      )}
    </div>
  )
}

export default VariationsPage
