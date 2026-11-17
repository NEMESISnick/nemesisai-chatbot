import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios.js'
import googleLogo from '../assets/imgbin-google-logo-google-search-icon-google-google-logo-hEJMjnfCV4MA1gDtjaWTv5kc1.png'

import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice.js'
import Sidebar from '../components/Sidebar.jsx'
import ChatArea from '../components/ChatArea.jsx'
// import Artifact from '../components/Artifact.jsx'
import Artifact2 from '../components/Artifact2.jsx'


const Home = () => {

  const userData = useSelector((state) => state.user?.userData)

  const dispatch = useDispatch()
  console.log(userData)

  // console.log(userData)

  // console.log("MY COMPONENT RENDERED");

  // const { userData } = useSelector(state => state.user);

  // console.log("USER DATA:", userData);
  


  const handleLogin = async (token) => {
    try {
      const { data } = await api.post('/api/auth/login', { token })
      dispatch(setUserData(data))
      // console.log('Login response:', data)

      return data
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message || error)
      return null
    }
  }

  const googleLogin = async () => {
    const data = await signInWithPopup(auth, googleProvider)
    const token = await data.user.getIdToken()
    console.log(token)

    //these 3 lines changed slightly. now i undo them
    await handleLogin(token)
    console.log(data)
  }

  return (
    <div className='w-full h-screen'>

      {userData ? 
      <div className='flex h-screen min-w-0 overflow-hidden bg-black text-white'>
        <Sidebar/>
        <ChatArea/>
        <Artifact2/>
      </div> : 
      <div className='w-full h-screen bg-[#1a1a1a] flex items-center justify-center'>
        <div className=' w-[75%] h-[69%] py-[10vh]'>
          <div className=' text-[1.2vw] text-white px-[0.6vw] mb-[-3vw] font-jet'>
            <h5>Welcome to</h5>
          </div>
          <div className='text-[12vw] font-gilroy-h text-[#eb5939]'>
            <h1>NemesisAI</h1>
          </div>
          <div onClick={googleLogin} className='google h-[8vh] w-[18vw] bg-white mx-[0.6vw] rounded-md flex justify-center items-center cursor-pointer'>
            <img className='mr-[0.5vw] h-[5vh] w-[5vh]' src={googleLogo} alt="Google" />
            <h5 className='ml-[0.5vw] font-jet text-[1vw]'>Continue with Google</h5>
          </div>
        </div>
      </div>
      }

      

      

      {/* {!userData && (
      
      )
      } */}
      


    </div>
  )
}

export default Home