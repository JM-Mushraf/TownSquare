import { useState } from 'react'

import axios from 'axios'
axios.defaults.withCredentials = true;
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useSelector } from 'react-redux';
import './App.css'
import Login from './Pages/Login/Login';
import Register from './Pages/Register/Register';
import Verify from './Pages/Verification/Verify';


function App() {
  const [count, setCount] = useState(0)
  const {userData}=useSelector((state)=>state.user)

  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/verify' element={<Verify/>} />
      </Routes>
      
    </Router>
  )
}

export default App
