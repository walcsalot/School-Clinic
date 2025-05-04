"use client"

import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../config/firebase"
import { toast } from "react-hot-toast"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../../config/firebase"

const EmergencyButton = () => {
  const [isActivated, setIsActivated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user] = useAuthState(auth)

  const handleEmergencyClick = async () => {
    if (isActivated || isLoading) return
    
    setIsLoading(true)
    setIsActivated(true)

    try {
      // Add emergency record to Firestore
      await addDoc(collection(db, "emergencies"), {
        timestamp: serverTimestamp(),
        status: "pending",
        requestedBy: {
          uid: user?.uid || "anonymous",
          name: user?.displayName || "Unknown Student",
          email: user?.email || "unknown@school.edu"
        },
        location: window.location.pathname, // Or get specific location
        notes: "Emergency assistance requested",
        resolved: false
      })

      toast.success("Emergency alert sent! Help is on the way.")
      
      // Reset button after 5 seconds
      setTimeout(() => {
        setIsActivated(false)
        setIsLoading(false)
      }, 5000)

    } catch (err) {
      console.error("Error sending emergency alert:", err)
      toast.error("Failed to send alert. Please try again or call for help.")
      setIsLoading(false)
      setIsActivated(false)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={handleEmergencyClick}
        disabled={isLoading || isActivated}
        className={`
          relative flex items-center justify-center p-6 rounded-full shadow-xl 
          transition-all duration-300 transform
          ${isActivated 
            ? "bg-red-600 scale-110 shadow-lg shadow-red-500/50 ring-4 ring-red-300"
            : "bg-red-500 hover:bg-red-600 hover:scale-105"}
          ${isLoading ? "opacity-80 cursor-not-allowed" : ""}
        `}
        aria-label="Emergency Button"
      >
        <div className="flex flex-col items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <span className="text-white font-bold mt-2">
            {isActivated ? "HELP IS COMING!" : "EMERGENCY"}
          </span>
        </div>

        {/* Pulsing animation when activated */}
        {isActivated && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
        )}
      </button>
    </div>
  )
}

export default EmergencyButton