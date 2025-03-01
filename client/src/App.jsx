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


function App() {
  const [count, setCount] = useState(0)
  const {userData}=useSelector((state)=>state.user)

  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login/>} />
      </Routes>
      
    </Router>
  )
}

export default App
