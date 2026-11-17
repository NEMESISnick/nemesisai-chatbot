import { Check, ChevronLeft, ChevronRight, Copy, Files } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const getPanelWidthBounds = () => {
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches
  const minWidth = isDesktop ? 288 : Math.min(240, window.innerWidth * 0.7)
  const maxWidth = isDesktop
    ? Math.max(288, Math.min(544, window.innerWidth * 0.81 - 320))
    : Math.min(544, window.innerWidth * 0.95)

  return { minWidth, maxWidth }
}

const Artifact = () => {
  const messages = useSelector(state => state.message?.messages ?? [])
  const [selectedFileName, setSelectedFileName] = useState('')
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [panelWidth, setPanelWidth] = useState(null)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (panelWidth === null) return

      const { minWidth, maxWidth } = getPanelWidthBounds()

      setPanelWidth(width => (
        width === null ? null : Math.max(minWidth, Math.min(maxWidth, width))
      ))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [panelWidth])

  const latestArtifact = [...messages].reverse()
    .find(message => message.role === 'assistant' && message.artifacts?.some(artifact => artifact.files?.length))
    ?.artifacts?.find(artifact => artifact.files?.length)
  const files = latestArtifact?.files ?? []

  if (files.length === 0) return null

  const selectedFile = files.find(file => file.name === selectedFileName) ?? files[0]

  const copyFile = async () => {
    await navigator.clipboard.writeText(selectedFile.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getCurrentPanelWidth = () => {
    if (panelWidth !== null) return panelWidth

    if (window.matchMedia('(min-width: 1024px)').matches) {
      return Math.max(288, Math.min(544, window.innerWidth * 0.3))
    }

    return Math.min(544, window.innerWidth * 0.85)
  }

  const resizePanel = (clientX, direction = 0) => {
    const { minWidth, maxWidth } = getPanelWidthBounds()
    const width = direction
      ? getCurrentPanelWidth() + direction * 24
      : window.innerWidth - clientX

    setPanelWidth(Math.max(minWidth, Math.min(maxWidth, width)))
  }

  return (
    <aside
      style={!isOpen || panelWidth === null ? undefined : { width: `${panelWidth}px` }}
      className={`fixed inset-y-0 right-0 z-40 flex h-full shrink-0 flex-col overflow-hidden border-l border-white/[0.06] bg-[#0d0f14] transition-[width] duration-200 lg:relative lg:z-auto ${
      isOpen ? 'w-[85vw] max-w-[34rem] lg:w-[30vw] lg:min-w-[18rem]' : 'w-12'
    } ${isResizing ? '!transition-none' : ''}`}
    >
      {isOpen && (
        <div
          role='separator'
          aria-label='Resize generated files panel'
          aria-orientation='vertical'
          aria-valuenow={Math.round(getCurrentPanelWidth())}
          aria-valuemin={getPanelWidthBounds().minWidth}
          aria-valuemax={getPanelWidthBounds().maxWidth}
          tabIndex={0}
          onPointerDown={event => {
            event.currentTarget.setPointerCapture(event.pointerId)
            setIsResizing(true)
          }}
          onPointerMove={event => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              resizePanel(event.clientX)
            }
          }}
          onPointerUp={event => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
            setIsResizing(false)
          }}
          onPointerCancel={() => setIsResizing(false)}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              resizePanel(0, 1)
            } else if (event.key === 'ArrowRight') {
              event.preventDefault()
              resizePanel(0, -1)
            }
          }}
          className='absolute inset-y-0 left-0 z-10 w-2 -translate-x-1/2 cursor-col-resize touch-none outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-transparent hover:after:bg-indigo-400 focus-visible:after:bg-indigo-400'
        />
      )}
      <header className={`flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.06] ${
        isOpen ? 'px-4' : 'justify-center px-2'
      }`}>
        {isOpen && (
          <>
            <Files size={16} className='shrink-0 text-indigo-400' />
            <h2 className='min-w-0 flex-1 truncate text-sm font-medium text-slate-200'>Generated files</h2>
            <span className='shrink-0 text-xs text-slate-500'>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
          </>
        )}
        <button
          type='button'
          onClick={() => setIsOpen(open => !open)}
          aria-label={isOpen ? 'Collapse generated files panel' : 'Open generated files panel'}
          aria-expanded={isOpen}
          title={isOpen ? 'Collapse generated files panel' : 'Open generated files panel'}
          className='flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
        >
          {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </header>

      {isOpen && <div className='flex min-h-0 flex-1'>
        <nav aria-label='Generated files' className='w-2/5 shrink-0 overflow-y-auto border-r border-white/[0.06] p-2'>
          {files.map(file => (
            <button
              key={file.name}
              type='button'
              title={file.name}
              onClick={() => setSelectedFileName(file.name)}
              className={`mb-1 w-full truncate rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                selectedFile.name === file.name
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
              }`}
            >
              {file.name}
            </button>
          ))}
        </nav>

        <section className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <div className='flex h-10 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3'>
            <span className='min-w-0 flex-1 truncate text-xs text-slate-400'>{selectedFile.name}</span>
            <button
              type='button'
              onClick={copyFile}
              aria-label='Copy file contents'
              className='flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className='min-h-0 flex-1 overflow-auto p-4 text-xs leading-5 text-slate-200 [tab-size:2]'>
            <code>{selectedFile.content}</code>
          </pre>
        </section>
      </div>}
    </aside>
  )
}

export default Artifact
