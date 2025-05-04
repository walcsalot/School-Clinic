"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { toast } from "react-hot-toast";

const locationOptions = {
  'Quadrangle': [],
  'Admin BLDG': ['201', '202', '203', '204', '205', '206'],
  'Covered Court': [],
  'Faculty Room': ['CCS Dept', 'CAS Dept', 'COC Dept', 'BEED Dept', 'ENGR Dept', 'CBA Dept'],
  'SHS Room': [],
  'Engineering BLDG': ['E202', 'E203', 'E204', 'E205', 'E206', 'E207'],
  'Lecture Room': ['LR1', 'LR2', 'LR3', 'LR4', 'LR5'],
  'Library': [],
  'Canteen': []
};

const EmergencyButton = ({ user }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSubLocation, setSelectedSubLocation] = useState("");

  const handleEmergencyClick = async () => {
    if (isActivated || isLoading) return;
    
    setShowLocationModal(true);
  };

  const confirmEmergency = async () => {
    if (!selectedLocation) {
      toast.error("Please select a location");
      return;
    }

    setIsLoading(true);
    setIsActivated(true);
    setShowLocationModal(false);

    try {
      const fullLocation = selectedSubLocation 
        ? `${selectedLocation} - ${selectedSubLocation}`
        : selectedLocation;

      await addDoc(collection(db, "emergencies"), {
        timestamp: serverTimestamp(),
        status: "pending",
        requestedBy: {
          uid: user?.uid,
          name: user?.displayName || `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          studentId: user?.idNumber,
          course: user?.course,
          role: "student"
        },
        location: fullLocation,
        notes: "Emergency assistance requested by student",
        resolved: false
      });

      toast.success(`Emergency alert sent from ${fullLocation}! Campus security is on the way.`);
      
      setTimeout(() => {
        setIsActivated(false);
        setIsLoading(false);
        setSelectedLocation("");
        setSelectedSubLocation("");
      }, 5000);

    } catch (err) {
      console.error("Error sending emergency alert:", err);
      toast.error("Failed to send alert. Please try again or call campus security.");
      setIsLoading(false);
      setIsActivated(false);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSelectedSubLocation(""); // Reset sublocation when main location changes
  };

  return (
    <>
      {/* Emergency Button */}
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

          {isActivated && (
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
          )}
        </button>
      </div>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Select Your Location</h2>
              
              {/* Main Location Selection */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Building/Area</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(locationOptions).map((location) => (
                    <button
                      key={location}
                      onClick={() => handleLocationSelect(location)}
                      className={`p-3 rounded border ${
                        selectedLocation === location
                          ? "bg-blue-100 border-blue-500"
                          : "hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Location Selection (if applicable) */}
              {selectedLocation && locationOptions[selectedLocation].length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Specific Location in {selectedLocation}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {locationOptions[selectedLocation].map((subLocation) => (
                      <button
                        key={subLocation}
                        onClick={() => setSelectedSubLocation(subLocation)}
                        className={`p-3 rounded border ${
                          selectedSubLocation === subLocation
                            ? "bg-blue-100 border-blue-500"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        {subLocation}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Location Display */}
              <div className="mb-6 p-3 bg-gray-50 rounded">
                <p className="font-medium">Selected Location:</p>
                <p className="text-lg">
                  {selectedLocation} 
                  {selectedSubLocation && ` - ${selectedSubLocation}`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    setSelectedLocation("");
                    setSelectedSubLocation("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEmergency}
                  disabled={!selectedLocation}
                  className={`px-4 py-2 rounded text-white ${
                    selectedLocation
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Send Emergency Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyButton;