"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, onSnapshot, updateDoc, doc, addDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import EmergencyAlerts from "../../Button/EmergencyAlerts";
import { useAuthState } from "react-firebase-hooks/auth";
import { Toaster, toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEmployees: 0,
    recentVisits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const employeesSnapshot = await getDocs(collection(db, "employees"));

        // Count recent visits (last 1 day)
        const now = new Date();
        const oneDayAgo = new Date(now.setDate(now.getDate() - 1));
        let recentVisitsCount = 0;

        studentsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.lastVisit && new Date(data.lastVisit.toDate()) >= oneDayAgo) {
            recentVisitsCount++;
          }
        });

        employeesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.lastVisit && new Date(data.lastVisit.toDate()) >= oneDayAgo) {
            recentVisitsCount++;
          }
        });

        setStats({
          totalStudents: studentsSnapshot.size,
          totalEmployees: employeesSnapshot.size,
          recentVisits: recentVisitsCount,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time listener for emergencies
    const emergenciesQuery = query(
      collection(db, "emergencies"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(emergenciesQuery, (snapshot) => {
      const newEmergencies = [];
      snapshot.forEach((doc) => {
        newEmergencies.push({ id: doc.id, ...doc.data() });
      });
      setEmergencies(newEmergencies);

      // Show notifications for new emergencies
      if (newEmergencies.length > emergencies.length) {
        const newEmergency = newEmergencies.find(
          (emerg) => !emergencies.some((e) => e.id === emerg.id)
        );
        if (newEmergency) {
          notifyAdmin(newEmergency);
        }
      }
    });

    return () => unsubscribe();
  }, [emergencies.length]);

  const notifyAdmin = (emergency) => {
    const requesterName = emergency.requestedBy?.name || "Unknown";
    const emergencyType = emergency.type || "medical emergency";
    
    toast(
      (t) => (
        <div className="flex flex-col">
          <span className="font-bold">🚨 Emergency Alert!</span>
          <span>{requesterName} reports a {emergencyType}</span>
          <span className="text-sm text-gray-600">Location: {emergency.location || "Unknown"}</span>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => {
                handleRespond(emergency.id, emergency.requestedBy?.uid, emergency.requestedBy?.role);
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Respond (1 min)
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      ),
      {
        duration: 15000,
        position: "top-right",
      }
    );
  };

  const handleRespond = async (emergencyId, requesterUid, requesterRole) => {
    try {
      if (!emergencyId || !requesterUid) {
        throw new Error("Missing emergency ID or requester UID");
      }

      // 1. First update the emergency status
      await updateDoc(doc(db, "emergencies", emergencyId), {
        status: "responded",
        respondedAt: new Date(),
        responderId: user?.uid,
        responderName: user?.displayName || "Clinic Staff",
        estimatedArrival: "1 minute",
      });

      // 2. Create notification for requester
      await addDoc(collection(db, "notifications"), {
        userId: requesterUid,
        title: "Emergency Response",
        message: "Help is on the way! A clinic staff member will arrive within 1 minute.",
        timestamp: new Date(),
        read: false,
        type: "emergency_response",
        emergencyId: emergencyId,
      });

      // 3. Update user document (student or employee)
      try {
        const userData = {
          lastEmergencyResponse: new Date(),
          lastEmergencyId: emergencyId,
          updatedAt: new Date(),
        };

        if (requesterRole === "student") {
          await setDoc(doc(db, "students", requesterUid), userData, { merge: true });
        } else if (requesterRole === "employee") {
          await setDoc(doc(db, "employees", requesterUid), userData, { merge: true });
        }
      } catch (userUpdateError) {
        console.log("User document update completed with merge:", userUpdateError);
      }

      // Show success message
      toast.success(
        <div>
          <p>Response sent successfully!</p>
          <p className="text-sm">The requester has been notified.</p>
        </div>,
        { duration: 5000 }
      );

      // Remove from local state
      setEmergencies(emergencies.filter(e => e.id !== emergencyId));

    } catch (error) {
      console.error("Error responding to emergency:", error);
      toast.error(
        <div>
          <p>Failed to send response</p>
          <p className="text-sm">{error.message}</p>
        </div>,
        { duration: 5000 }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">School Clinic Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            {emergencies.length > 0 && (
              <div className="relative">
                <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  {emergencies.length}
                </div>
                <button 
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    document.getElementById('emergency-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
            )}
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.displayName?.split(' ').map(n => n[0]).join('') || 'AD'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your clinic today.</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Students Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-t-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-medium">Total Students</h2>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  <span>All registered students</span>
                </p>
              </div>
            </div>

            {/* Employees Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-t-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-medium">Total Employees</h2>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalEmployees}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span>All faculty and staff</span>
                </p>
              </div>
            </div>

            {/* Visits Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-t-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-medium">Recent Visits</h2>
                  <p className="text-3xl font-bold text-gray-800">{stats.recentVisits}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                  <span>Last 24 hours</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Alerts Section */}
        <div id="emergency-section">
          {emergencies.length > 0 && (
            <div className="bg-red-50 rounded-xl shadow-sm p-6 mb-6 border border-red-200">
              <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Active Emergency Alerts ({emergencies.length})
              </h2>
              <div className="space-y-4">
                {emergencies.map((emergency) => (
                  <div key={emergency.id} className="flex items-start pb-4 border-b border-red-100 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Emergency from {emergency.requestedBy?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {emergency.requestedBy?.role === "student" ? "Student" : "Employee"} • {emergency.location || "Unknown location"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {emergency.timestamp?.toDate ? 
                              new Date(emergency.timestamp.toDate()).toLocaleString() : 
                              "Unknown time"}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRespond(emergency.id, emergency.requestedBy?.uid, emergency.requestedBy?.role)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 whitespace-nowrap"
                          >
                            Respond (1 min)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Emergency Alerts (for admin only) */}
      <EmergencyAlerts user={user} />
    </div>
  );
};

export default AdminDashboard;