import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import api,{setAccessToken} from './api/axios'
import './App.css'
import Login from './pages/Login';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
  const tryRefresh=async()=>{
    try{
    const res=await api.post('/auth/refresh');
    setAccessToken(res.data.accessToken);
    setUser({loggedIn:true});
    }catch(error){
      setUser(null);
    }finally{
      setLoading(false);
    }
  };tryRefresh();
  },[]);
  if(loading)return <div>loading...</div>
  
  return (
    <BrowserRouter>
      <Routes>
        {/* If not logged in, show Login. If already logged in, redirect to dashboard */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={() => setUser({ loggedIn: true })} />}
        />
       
        </Routes>
 </BrowserRouter>
  );
  
}

export default App
