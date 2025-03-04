import axios from "axios";
import React from "react";
import { useState } from "react";
const Verify = () => {
  const [otp, setOtp] = useState(null);

  const handleOtpSubmit=async()=>{
    const newotp={"verificationCode":otp}
    const {data}=await axios.post('http://localhost:3000/user/register/verification',newotp)
    console.log(data);
    
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
