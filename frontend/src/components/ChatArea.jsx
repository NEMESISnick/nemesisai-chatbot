import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { setArtifacts, setMessages } from '../redux/messageSlice'
import { useEffect } from 'react'
// import Lenis from "lenis"

const ChatArea = () => {

  //LENIS SETUP
      // const lenis = new Lenis()
      // function raf(time) {
      //     lenis.raf(time)
      //     requestAnimationFrame(raf)
      // }
      // requestAnimationFrame(raf)

  const {selectedConversation} = useSelector(state => state.conversation)
  const dispatch = useDispatch()

  useEffect(() => {
    let isCurrentConversation = true
    dispatch(setMessages([]))

    const getMesg = async () => {
      if (selectedConversation?._id) {
        const data = await getMessages(selectedConversation._id)
        if (!isCurrentConversation) return
        dispatch(setMessages(data))
        const latestArtifactMessage = [...data].reverse().find(msg => msg.artifacts && msg.artifacts.length > 0)
        dispatch(setArtifacts(latestArtifactMessage?.artifacts || [])) //this line
      }
    }

    getMesg()

    return () => {
      isCurrentConversation = false
    }
  }, [dispatch, selectedConversation?._id])
  

  return (
    <div className='flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden'>
      <Nav/>
      <MessageList/>
      <ChatInput/>
    </div>
  )
}

export default ChatArea
