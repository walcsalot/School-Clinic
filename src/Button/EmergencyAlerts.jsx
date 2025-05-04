"use client"

import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-hot-toast";
import alertSound from '../assets/alert-sound.mp3';

const EmergencyAlerts = ({ user }) => {
  const [emergencies, setEmergencies] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Play alert sound
  const playAlertSound = () => {
    if (soundEnabled && typeof window !== "undefined") {
      const audio = new Audio(alertSound);
      audio.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  useEffect(() => {
    let unsubscribe;

    const fetchEmergencies = async () => {
      try {
        setIsLoading(true);
        const q = query(
          collection(db, "emergencies"),
          where("resolved", "==", false)
        );
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const alerts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }));

          // Sort by newest first
          alerts.sort((a, b) => b.timestamp - a.timestamp);

          // Check if new alerts came in
          if (alerts.length > emergencies.length && emergencies.length > 0) {
            playAlertSound();
            toast.success(`New emergency alert!`, {
              duration: 4000,
              icon: '⚠️',
              position: 'top-right'
            });
          }

          setEmergencies(alerts);
          setIsLoading(false);
        });

      } catch (err) {
        console.error("Error fetching emergencies:", err);
        toast.error("Failed to load emergency alerts");
        setIsLoading(false);
      }
    };

    fetchEmergencies();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [emergencies.length]);

  const handleResolveEmergency = async (emergencyId) => {
    try {
      setIsLoading(true);
      await updateDoc(doc(db, "emergencies", emergencyId), {
        status: "resolved",
        resolved: true,
        resolvedBy: {
          uid: user?.uid,
          name: user?.displayName || "Admin",
          email: user?.email
        },
        resolvedAt: serverTimestamp()
      });
      toast.success("Emergency resolved successfully");
    } catch (err) {
      console.error("Error resolving emergency:", err);
      toast.error("Failed to resolve emergency");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "Just now";
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {/* Alerts header */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center">
          <span className="font-medium mr-2">Emergency Alerts</span>
          {emergencies.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {emergencies.length} active
            </span>
          )}
        </div>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${soundEnabled ? 'text-yellow-500' : 'text-gray-400'}`}
          aria-label={soundEnabled ? "Mute notifications" : "Unmute notifications"}
        >
          {soundEnabled ? '🔔' : '🔕'}
        </button>
      </div>

      {/* Emergency alerts list */}
      {emergencies.map(emergency => (
        <div 
          key={emergency.id} 
          className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-xs"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                  URGENT
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(emergency.timestamp)}
                </span>
              </div>
              <h3 className="font-bold text-red-700">EMERGENCY REQUEST</h3>
              <p className="text-sm text-gray-600 mt-1">
                From: {emergency.requestedBy?.name || 'Unknown'}
              </p>
              {emergency.location && (
                <p className="text-xs text-gray-500 mt-1">
                  Location: {emergency.location}
                </p>
              )}
            </div>
            <button 
              onClick={() => handleResolveEmergency(emergency.id)}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
              Resolve
            </button>
          </div>
          <p className="mt-2 text-sm">{emergency.notes}</p>
        </div>
      ))}
    </div>
  );
};

export default EmergencyAlerts;