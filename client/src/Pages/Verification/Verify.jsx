import axios from "axios";
import React from "react";
import { useState } from "react";
const Verify = () => {
  const [otp, setOtp] = useState(null);

  const handleOtpSubmit=async()=>{
    const newotp={"verificationCode":otp}
    const {data}=await axios.post(`${import.meta.env.VITE_BACKEND_BASEURL}/user/register/verification`,newotp)
    
    
  }
  return (
    <div>
      <input type="number" onChange={(e)=>setOtp(e.target.value)}/>
      Otp

      <button onClick={handleOtpSubmit} >submit</button>
    </div>
    
  );
};

export default Verify;
