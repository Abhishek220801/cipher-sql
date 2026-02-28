import { useRef } from "react";
import { useState } from "react"

export default function Login() {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    console.log('render');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(emailRef.current.value, passwordRef.current.value)
    }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input ref={emailRef} type="text" placeholder="email" className="border border-amber-400"/>
        <input ref={passwordRef} type="password" placeholder="password" className="border border-amber-400" />
        <button type="submit" className="bg-blue-300">Submit</button>
      </form>
    </div>
  )
}
