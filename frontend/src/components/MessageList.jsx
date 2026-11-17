import Lenis from "lenis";
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import { useEffect, useRef } from "react";
import LoadingAnimation from "./LoadingAnimation";

const MessageList = () => {

    const scrollContainerRef = useRef(null);
    const contentRef = useRef(null);
    
    useEffect(() => {
        const wrapper = scrollContainerRef.current;
        const content = contentRef.current;

        if (!wrapper || !content) return;

        const lenis = new Lenis({
        wrapper,
        content,
        smoothWheel: true,
        lerp: 0.08,
        autoRaf: true,
        });

        return () => {
        lenis.destroy();
        };
    }, []);



    const {selectedConversation} = useSelector(state => state.conversation)
    const {messages, isLoading} = useSelector(state => state.message)
    const bottomref = useRef(null)

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            bottomref.current?.scrollIntoView({
                behavior:"smooth",
                block:"end"
            })
        })
        return () => cancelAnimationFrame(frame)
    }, [messages?.length, isLoading])



  return (
    <div className='flex-1 overflow-y-auto px-6 py-6 space-y-5 [scrollbar-width:none] {&::webkit-scrollbar]:hidden' 
    ref={scrollContainerRef}>
        <div ref={contentRef}>
            {messages?.length === 0 || !selectedConversation ? 
            (
                <div className='h-full flex flex-col items-center justify-center gap-4 text-center'>
                    <div className='flex flex-col gap-1.5'>
                        <h1 className='text-[1.8vw] font-bold text-slate-200 tracking-tight'>NemesisAI</h1>
                        <p className='text-[1.2vw] font-semibold text-slate-200 tracking-tight'>How can I help you?</p>
                        <p className='text-[1vw] font-light text-slate-200 leading-relaxed'>Ask me anything - code, ideas, explanations, or just the quote of the day.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    {messages?.map((msg, i) => (
                        <div key={msg?._id ?? i}>
                            <MessageBubble role={msg?.role} content={msg?.content} images={msg.images || []}/>
                        </div>
                    ))}

                    {isLoading && <LoadingAnimation/>}
                </div>
            )
            }

            <div ref={bottomref}/>
        </div>
        
    </div>
  )
}

export default MessageList