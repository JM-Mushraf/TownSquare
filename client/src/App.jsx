import { useState } from 'react'
import Location from './locationIQ/map'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Location/>
    </>
  )
}

export default App
