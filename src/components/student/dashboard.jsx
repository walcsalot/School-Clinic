"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "../../config/firebase";  // Correct relative path

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        // Query students collection to find the document with matching UID
        const studentsRef = collection(db, "students")
        const q = query(studentsRef, where("uid", "==", user.uid))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0]
          setStudentData({
            id: studentDoc.id,
            ...studentDoc.data(),
          })
        }
      } catch (error) {
        console.error("Error fetching student data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center p-6">Loading...</div>
  }

  if (!studentData) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Student Data Not Found</h2>
          <p className="mt-2 text-gray-600">Please contact the administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Student Dashboard</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Welcome, {studentData.firstName}!</h2>
        <p className="text-gray-600">
          This is your clinic dashboard. Here you can view your profile information and visit history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold">Your Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">ID Number:</span> {studentData.idNumber}
            </p>
            <p>
              <span className="font-medium">Name:</span> {studentData.firstName} {studentData.middleName}{" "}
              {studentData.lastName}
            </p>
            <p>
              <span className="font-medium">Age:</span> {studentData.age}
            </p>
            <p>
              <span className="font-medium">Gender:</span> {studentData.gender}
            </p>
            <p>
              <span className="font-medium">Course:</span> {studentData.course}
            </p>
            <p>
              <span className="font-medium">Email:</span> {studentData.email}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold">Recent Clinic Visit</h2>
          {studentData.reasonsOfVisit ? (
            <div>
              <p>
                <span className="font-medium">Reason:</span> {studentData.reasonsOfVisit}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                If you need to update your information or have questions about your visit, please contact the clinic
                administrator.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">No recent clinic visits recorded.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
