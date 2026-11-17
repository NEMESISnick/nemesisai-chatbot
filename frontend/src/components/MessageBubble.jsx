import { Check, Copy, ExternalLink, X } from 'lucide-react'
import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

const MessageBubble = ({role, content, images}) => {

  const isUser = role === "user"

  const [lightbox, setLightbox] = useState(null)

  const [copyCode, setCopyCode] = useState("")

  const copycode = async (code) => {
    await navigator.clipboard.writeText(code)
    setCopyCode(code)
    setTimeout(() => {
      setCopyCode("")
    }, 2000);
  }



  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`w-fit max-w-[90vw] md:max-w-[72%]  px-4 py-2.5 rounded-sm break-words overflow-hidden text-[1.1vw] leading-relaxed ${isUser ? "bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm" : "bg-white/10 backdrop-blur-md  text-slate-200 rounded-tl-sm"}`}>

        {images.length > 0 && (
          <div className='flex flex-wrap gap-3 mt-4'>
            {images.map((img, i) => (
              <img className='w-40 h-28 rounded-lg object-cover cursor-zoom-in hover:opacity-90 transition' src={img} key={i} loading='lazy' onError={(e) => e.currentTarget.remove()} onClick={() => setLightbox(img)} alt="" />
            ))}
          </div>
        )}

        <Markdown remarkPlugins={[remarkGfm]} components={{
          h1:({children}) => (
            <h1 className='text-2xl font-bold mt-5 mb-3'>{children}</h1>
          ),
          h2:({children}) => (
            <h2 className='text-xl font-semibold mt-4 mb-2'>{children}</h2>
          ),
          h3:({children}) => (
            <h3 className='text-lg font-semibold mt-3 mb-2'>{children}</h3>
          ),
          p:({children}) => (
            <p className='mb-3 whitespace-pre-wrap break-words'>{children}</p>
          ),
          ul:({children}) => (
            <ul className='list-disc pl-5 space-y-1 my-2'>{children}</ul>
          ),
          ol:({children}) => (
            <ol className='list-decimal pl-5 space-y-1 my-2'>{children}</ol>
          ),
          table:({children}) => (
            <div className='overflow-x-auto my-4'>
              <table className='min-w-full border border-white/[0.06]'>
                {children}
              </table>
            </div>
          ),
          th:({children}) => (
            <th className='border border-white/[0.03] bg-white/5 px-3 py-2 text-left'>
              {children}
            </th>
          ),
          td:({children}) => (
            <td className='border border-white/[0.06] px-3 py-2'>
              {children}
            </td>
          ),
          a:({href, children}) => {
            const isPdf = typeof children === 'string' && children.trim() === 'Download PDF'
            const isPpt = typeof children === 'string' && children.trim() === 'Download PPT'

            return (
              <>
                <a href={href} target='_blank' rel='noreferrer' className='text-indigo-400 underline inline-flex items-center gap-1'>
                  {isPdf ? 'Open PDF in new tab' : children}
                  <ExternalLink size={10}/>
                </a>
                {isPdf && (
                  <iframe
                    src={href}
                    title='Generated PDF preview'
                    className='my-3 block h-[70vh] min-h-[480px] w-full rounded bg-white'
                  />
                )}
                {isPpt && href && (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(href)}`}
                    title='Generated PowerPoint preview'
                    className='my-3 block h-[70vh] min-h-[480px] w-full rounded bg-white'
                    allowFullScreen
                  />
                )}
              </>
            )
          },
          code:({className, children}) => {
            const value = String(children).trim()

            if(!className) {
              return (
                <code className='px-1.5 py-0.5 rounded bg-white/[0.06] text-pink-400'>
                  {value}
                </code>
              )
            }

            const language = className.replace("language-", "")

            return (
              <div className='my-4 overflow-hidden rounded-xl border border-white/[0.03] bg-[#111318]'>
                <div className='flex items-center justify-between bg-[#1b1d24] border-b border-white/[0.06] px-4 py-2'>
                  <span className='uppercase text-xs text-slate-400'>
                    {language}
                  </span>

                  <button className='flex items-center gap-3 text-xs' onClick={() => copycode(value)}>
                    {
                      copyCode == value ? 
                      <>
                        <Check size={10}/>
                        Copied
                      </> : 
                      <>
                        <Copy size={10}/>
                        Copy
                      </>
                    }
                  </button>
                </div>

                <SyntaxHighlighter language={language} wrapLongLines showLineNumbers customStyle={{fontSize:"0.9vw"}}>
                  {value}
                </SyntaxHighlighter>
              </div>
            )
          }
        }}>
          {content}
        </Markdown>
        
      </div>

      {lightbox && 
      <div className='fixed inset-0 x-50 bg-white/10 backdrop-blur-md flex items-center justify-center p-6'>
        <button className='absolute top-5 right-5 text-white/80 hover:text-white' onClick={() => setLightbox(null)}>
          <X/>
        </button>
        <img src={lightbox} className='z-10 max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl object-contain' alt="" />
      </div> }
    </div>
  )
}

export default MessageBubble