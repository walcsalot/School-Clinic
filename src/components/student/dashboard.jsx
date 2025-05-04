"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import EmergencyButton from "./EmergencyButton";
import { toast } from "react-hot-toast";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergencyResponse, setEmergencyResponse] = useState(null);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          setStudentData({
            id: studentDoc.id,
            ...studentDoc.data(),
          });
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();

    if (auth.currentUser) {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", auth.currentUser.uid),
        where("type", "==", "emergency_response")
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const response = change.doc.data();
            setEmergencyResponse(response);
            setShowEmergencyBanner(true);
            
            toast.success(
              <div>
                <div className="font-bold">Emergency Response!</div>
                <div>{response.message}</div>
                <div className="text-sm">Help will arrive in {response.estimatedArrival || "1 minute"}</div>
              </div>,
              {
                duration: 10000,
                icon: '🚑',
              }
            );

            setTimeout(() => {
              setShowEmergencyBanner(false);
            }, 60000);
          }
        });
      });

      return () => unsubscribe();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
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
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-800 sm:text-2xl">Student Data Not Found</h2>
          <p className="mt-2 text-gray-600">
            We couldn't find your student records. Please contact the administrator for assistance.
          </p>
          <button className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Emergency Response Banner */}
      {showEmergencyBanner && emergencyResponse && (
        <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded sm:p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Emergency Response</h3>
              <div className="mt-1 text-sm text-green-700">
                <p>{emergencyResponse.message}</p>
                <p className="mt-1 font-medium">Estimated arrival: {emergencyResponse.estimatedArrival || "1 minute"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className="mb-6 rounded-2xl bg-white p-4 shadow-md sm:p-6">
        <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Student Dashboard</h1>
            <p className="mt-1 text-gray-600 sm:mt-2">Welcome to your personal health portal</p>
          </div>
          <div className="mt-4 flex items-center md:mt-0">
            <div className="mr-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-600">
                {studentData.firstName.charAt(0)}
                {studentData.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {studentData.firstName} {studentData.lastName}
              </p>
              <p className="text-sm text-gray-500">ID: {studentData.idNumber}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Card */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg sm:p-6">
        <h2 className="mb-1 text-xl font-semibold sm:mb-2 sm:text-2xl">
          Hello!, {studentData.firstName}!
        </h2>
        <p className="max-w-2xl text-sm opacity-90 sm:text-base">
          This is your personalized health dashboard. Here you can view your profile information and
          clinic visit history.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
        {/* Personal Information Card */}
        <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">Personal Information</h2>
            <div className="rounded-full bg-blue-100 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 sm:text-sm">Student ID</p>
                <p className="text-sm font-medium sm:text-base">{studentData.idNumber}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 sm:text-sm">Full Name</p>
                <p className="text-sm font-medium sm:text-base">
                  {studentData.firstName} {studentData.middleName} {studentData.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 sm:text-sm">Age</p>
                <p className="text-sm font-medium sm:text-base">{studentData.age} years</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 sm:text-sm">Gender</p>
                <p className="text-sm font-medium capitalize sm:text-base">{studentData.gender}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 sm:text-sm">Course</p>
                <p className="text-sm font-medium sm:text-base">{studentData.course}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 sm:text-sm">Email</p>
                <p className="text-sm font-medium sm:text-base">{studentData.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Visit Card */}
        <div className="rounded-2xl bg-white p-4 shadow-md lg:col-span-2 sm:p-6">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">Clinic Visit Information</h2>
            <div className="rounded-full bg-green-100 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {studentData.reasonsOfVisit ? (
            <div className="rounded-xl border border-green-100 bg-green-50 p-4 sm:p-6">
              <div className="flex items-start">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 sm:mr-4 sm:h-12 sm:w-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-600 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-800 sm:text-lg">Last Visit Recorded</h3>
                  <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
                    <span className="font-medium">Reason:</span> {studentData.reasonsOfVisit}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-6">
              <div className="flex items-start">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 sm:mr-4 sm:h-12 sm:w-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-800 sm:text-lg">No Recent Visits</h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Button - Fixed position for mobile */}
      {auth.currentUser && studentData && (
        <div className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
          <EmergencyButton user={{ 
            ...studentData, 
            uid: auth.currentUser.uid,
            displayName: `${studentData.firstName} ${studentData.lastName}`,
            email: auth.currentUser.email
          }} />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;