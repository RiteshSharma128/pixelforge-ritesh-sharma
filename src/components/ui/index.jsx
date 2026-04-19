// src/components/ui/index.jsx  — shared UI components
import { useDropzone } from 'react-dropzone'
import { Upload, Download, Star, Trash2 } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

export const PageHeader = ({ icon, title, subtitle }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-violet-400">{icon}</span>
      <h1 className="text-xl font-bold text-white">{title}</h1>
    </div>
    {subtitle && <p className="text-sm text-purple-300/60 ml-7">{subtitle}</p>}
  </div>
)

export const LoadingBox = ({ message = 'Generating...', sub = 'This may take 20–40s on the free AI tier' }) => (
  <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
    <div className="spinner-lg"/>
    <div>
      <p className="text-sm font-medium text-purple-200">{message}</p>
      <p className="text-xs text-purple-300/40 mt-1">{sub}</p>
    </div>
  </div>
)

export const DropZone = ({ onFile, accept = { 'image/*': [] }, label = 'Drop image or click to upload', sub = 'PNG · JPG · WEBP · max 10MB', icon }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => files[0] && onFile(files[0]),
    accept, maxFiles: 1, maxSize: 10 * 1024 * 1024
  })
  return (
    <div {...getRootProps()} className={`drop-zone ${isDragActive ? 'border-violet-500 bg-violet-900/10' : ''}`}>
      <input {...getInputProps()}/>
      <div className="text-4xl mb-3">{icon || '🖼️'}</div>
      <p className="text-sm text-purple-200/80 mb-1">
        {isDragActive ? 'Drop it!' : <span>Drop or <strong className="text-violet-400">click to upload</strong></span>}
      </p>
      <p className="text-xs text-purple-300/40">{sub}</p>
    </div>
  )
}

export const ImageGrid = ({ images, onDelete, onFavorite }) => {
  if (!images?.length) return (
    <div className="flex flex-col items-center py-14 opacity-40">
      <div className="text-5xl mb-3">🖼️</div>
      <p className="text-sm text-purple-300">No images yet</p>
    </div>
  )
  const downloadAll = async () => {
    toast('Building ZIP...', { icon: '📦' })
    const zip = new JSZip()
    images.forEach((img, i) => {
      const b64 = img.url.split(',')[1]
      if (b64) zip.file(`image-${i+1}-${img.type||'img'}.png`, b64, { base64: true })
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'pixelforge-export.zip')
  }
  return (
    <div>
      {images.length > 1 && (
        <div className="flex justify-end mb-3">
          <button onClick={downloadAll} className="btn-teal text-xs py-1.5 px-3">
            <Download size={13}/>Download All ZIP
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={img.id||i} className="img-card">
            <img src={img.cloudUrl || img.url} alt={img.type||`img-${i}`} loading="lazy"/>
            {img.cloudUrl && (
              <div className="absolute top-2 left-2">
                <span className="badge bg-sky-500/15 text-sky-300 border border-sky-500/20 text-[9px]">☁ CDN</span>
              </div>
            )}
            <span className="absolute top-2 right-2 badge-violet text-[9px]">{img.type||'img'}</span>
            <div className="img-overlay">
              <div className="flex gap-1.5 flex-wrap">
                <a href={img.cloudUrl||img.url} download={`image-${i+1}.png`} className="btn-ghost py-1 px-2 text-xs">
                  <Download size={11}/>Save
                </a>
                {onFavorite && (
                  <button onClick={() => onFavorite(img.id||img._id)} className={`py-1 px-2 text-xs rounded-lg border transition-all flex items-center gap-1 ${img.isFavorite?'bg-amber-500/20 border-amber-500/30 text-amber-300':'btn-ghost'}`}>
                    <Star size={11}/>
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(img.id||img._id)} className="btn-danger py-1 px-2 text-xs">
                    <Trash2 size={11}/>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const FormCard = ({ title, icon, children }) => (
  <div className="card p-5 mb-5">
    {title && <div className="flex items-center gap-2 mb-4"><span className="text-violet-400">{icon}</span><h2 className="text-base font-bold text-white">{title}</h2></div>}
    {children}
  </div>
)
