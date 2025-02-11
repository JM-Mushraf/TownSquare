import { useState } from 'react'
import GetLocation from './Geolocation/Geolocation'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <GetLocation/>
    </>
  )
}

export default App
