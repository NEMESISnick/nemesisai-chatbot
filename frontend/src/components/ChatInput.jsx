import { Code2, FileText, Globe2, ImageIcon, MessagesSquare, Mic, Paperclip, Presentation, Send, X, Zap } from 'lucide-react'
import { useState } from 'react'
import sendMessage from '../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts, setIsLoading } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'
import getCurrentUser from '../features/getCurrentUser'
import { setUserData } from '../redux/userSlice'
import { useRef } from 'react'

const ChatInput = () => {

  const {selectedConversation} = useSelector(state => state.conversation)
  const [selectedAgent, setSelectedAgent] = useState("Auto")
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const fileref = useRef(null)

  const dispatch = useDispatch()

    const [value, setValue] = useState("")


    const handleSendMessage = async () => {
        dispatch(setIsLoading(true))

        const prompt = value.trim()
        if (!prompt || isSending) return

        setIsSending(true)
        setSendError("")

      try {
        let conversation = selectedConversation

        if(!conversation) {
            const conv = await createConversation()
            dispatch(setSelectedConversation(conv))
            dispatch(addConversation(conv))
            conversation = conv
        }

        if(conversation.title == "New Chat") {
            await updateConversation({id:conversation?._id, title:prompt})
            dispatch(setConvTitle({conversationId:conversation?._id, title:prompt.slice(0, 11)}))
        }

        // const payload = {
        //     prompt, conversationId:conversation?._id, agent:selectedAgent.toLowerCase()
        // }

        console.log(selectedFile)

        const formData = new FormData()

        formData.append("prompt", value.trim())
        formData.append("conversationId", conversation?._id)
        formData.append("agent", selectedAgent.toLowerCase())
        if(selectedFile) {
            formData.append("file", selectedFile)
        }
        

        dispatch(addMessage({role:"user", content:prompt}))

        setValue("")

        const data = await sendMessage(formData)
        // if (typeof data?.answer !== "string") {
        //     throw new Error("The chat service returned an invalid response.")
        // }

        dispatch(setIsLoading(false))

        dispatch(setArtifacts(data.artifacts || [])) //this line

        setSelectedFile(null)

        dispatch(addMessage({
            role:"assistant",
            content:data.answer,
            images:data.images,
            artifacts:data.artifacts || []
        }))

        const updatedUser = await getCurrentUser()
        if (updatedUser) {
            dispatch(setUserData(updatedUser))
        }
      } catch (error) {
        console.error("Failed to send message:", error)
        setSendError(error.response?.data?.message || error.message || "Unable to send your message. Please try again.")
      } finally {
        setIsSending(false)
      }
    }

    const handleEnter = (e) => {
        if(e.key === "Enter" && !e.shiftKey && !isSending) {
            e.preventDefault()
            handleSendMessage()
        }
    }


    const agents = [
        {
            id:"auto",
            icon:Zap,
            label:"Auto"
        },
        {
            id:"chat",
            icon:MessagesSquare,
            label:"chat"
        },
        {
            id:"coding",
            icon:Code2,
            label:"coding"
        },
        {
            id:"pdf",
            icon:FileText,
            label:"PDF"
        },
        {
            id:"ppt",
            icon:Presentation,
            label:"PPT"
        },
        {
            id:"vision",
            icon:ImageIcon,
            label:"Image"
        },
        {
            id:"search",
            icon:Globe2,
            label:"Search"
        }
    ]

  return (
    <div className='w-full overflow-hidden px-3 md_px-5 py-4 border-t border-white/[0.06] bg-[#0d0f14]'>
        <div className='flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5'>

            <div className='flex w-[95%] gap-2 pr-2 flex-wrap'>
                {agents.map((agent) => {
                    const isActive = selectedAgent === agent.label
                    const Icon = agent.icon

                    return (
                        <div onClick={() => setSelectedAgent(agent.label)} className={`cursor-pointer flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-light border transition-all ${isActive ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-transparent" : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"}`}>
                            <Icon size={12} className={`${isActive ? "text-white" : "text-slate-500"}`}/>
                            {agent.label}
                        </div>
                    )
                })}
            </div>

            {sendError && (
                <p className="text-sm text-red-400" role="alert">{sendError}</p>
            )}

            {
                selectedFile && <div className='my-3'>
                    <div className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2'>
                        {
                            selectedFile?.type === "application/pdf" ? <FileText className='text-red-400' size={12}/> : selectedFile.type.startsWith("image/") && <img src={URL.createObjectURL(selectedFile)} className='h-10 w-10 rounded-xl object-cover mt-3'/>
                        }

                        <div>
                            <p className='text-xs text-white'>{selectedFile?.name}</p>

                            <p className='text-[10px] text-slate-500'>{Math.ceil(selectedFile.size)}KB</p>
                        </div>

                        <button className='ml-2' onClick={() => {setSelectedFile(null);fileref.current.value=""}}><X size={13} className='text-slate-500 hover:text-white'/></button>
                    </div>

                    
                </div>
            }

            <textarea name="" id="" placeholder='just ASK...' rows={2} className='w-full bg-transparent outline-none resize-none text-[1.1vw] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::webkit-scrollbar]:hidden disabled:opacity-50' 
            onChange={(e) => setValue(e.target.value)} 
            value={value} 
            onKeyDown={handleEnter}/>

            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1'>

                    <input type="file" accept='.pdf, image/*' hidden ref={fileref} onChange={(e) => {
                        const file = e.target.files[0]
                        if(file) {
                            setSelectedFile(file)
                        }
                    }}/>

                    <button className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer' 
                    onClick={() => fileref.current.click()}>
                        <Paperclip size={14}/>
                    </button>

                    <button className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer'>
                        <Mic size={14}/>
                    </button>
                </div>

                <button className={`flex items-center justify-center w-8 h-8 rounded-lg border-none text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent ${value.trim() ? "cursor-pointer" : "cursor-not-allowed"}`} 
                disabled={!value.trim() || isSending} 
                onClick={handleSendMessage}>
                    <Send size={14}/>
                </button>
            </div>
        </div>
    </div>
  )
}

export default ChatInput