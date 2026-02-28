import { useRef } from "react";
import { useState } from "react"

export default function Practice() {
    const [time, setTime] = useState(0)
    const intervalIdRef = useRef(null);
    const handleStart = () => {
        if(intervalIdRef.current!=null){
            // clearInterval(intervalIdRef.current);
            return;
        }
        intervalIdRef.current = setInterval(() => setTime(time => time+1), 1000);
    }
    const handleStop = () => {
        clearInterval(intervalIdRef.current);
    }
    const handleReset = () => {
        clearInterval(intervalIdRef.current);
        setTime(0);
    }
  return (
    <div>
        <h1 className="text-2xl">Time: {time}</h1>
        <button className="bg-green-500 mr-2" onClick={handleStart}>Start</button>
        <button className="bg-red-500 mr-2" onClick={handleStop}>Stop</button>
        <button className="bg-yellow-500" onClick={handleReset}>Reset</button>
    </div>
  )
}
