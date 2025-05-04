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
};

export default EmergencyAlerts;