"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, orderBy, doc, updateDoc, addDoc } from "firebase/firestore"
import { db } from "../../config/firebase"
import { format } from 'date-fns'

const ViewStudentInfo = ({ studentId, onClose }) => {
  const [student, setStudent] = useState(null)
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newVisitCount, setNewVisitCount] = useState(1)
  const [visitReason, setVisitReason] = useState("")
  const [isAddingVisits, setIsAddingVisits] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch student details
        const studentQuery = query(collection(db, "students"), where("idNumber", "==", studentId))
        const studentSnapshot = await getDocs(studentQuery)
        
        if (studentSnapshot.empty) {
          throw new Error("Student not found")
        }
        
        const studentData = studentSnapshot.docs[0].data()
        setStudent({
          id: studentSnapshot.docs[0].id,
          ...studentData
        })
        
        // Fetch visit history
        const visitsQuery = query(
          collection(db, "visits"),
          where("studentId", "==", studentId),
          orderBy("visitDate", "desc")
        )
        const visitsSnapshot = await getDocs(visitsQuery)
        
        const visitsData = visitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          visitDate: doc.data().visitDate?.toDate()
        }))
        
        setVisits(visitsData)
      } catch (err) {
        console.error("Error fetching student data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (studentId) {
      fetchStudentData()
    }
  }, [studentId])

  const addVisits = async () => {
    if (!visitReason.trim()) {
      setError("Please enter a reason for the visit")
      return
    }

    try {
      setIsAddingVisits(true)
      setError(null)
      const studentRef = doc(db, "students", student.id)
      
      // Update total visits count
      await updateDoc(studentRef, {
        totalVisits: (student.totalVisits || 0) + newVisitCount,
        lastVisitDate: new Date() // Track last visit date
      })
      
      // Add new visit records
      const visitsCollection = collection(db, "visits")
      const newVisits = Array.from({ length: newVisitCount }, (_, i) => ({
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        visitDate: new Date(),
        reason: visitReason || "Added manually by admin",
        type: "manual",
        adminAdded: true
      }))
      
      // Batch add visits
      const promises = newVisits.map(visit => addDoc(visitsCollection, visit))
      await Promise.all(promises)
      
      // Refresh data
      await fetchStudentData()
      setSuccessMessage(`Successfully added ${newVisitCount} visit${newVisitCount > 1 ? 's' : ''}`)
      setTimeout(() => setSuccessMessage(""), 3000)
      setNewVisitCount(1)
      setVisitReason("")
    } catch (err) {
      console.error("Error adding visits:", err)
      setError(err.message)
    } finally {
      setIsAddingVisits(false)
    }
  }

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      
      // Fetch student details
      const studentQuery = query(collection(db, "students"), where("idNumber", "==", studentId))
      const studentSnapshot = await getDocs(studentQuery)
      
      if (!studentSnapshot.empty) {
        const studentData = studentSnapshot.docs[0].data()
        setStudent({
          id: studentSnapshot.docs[0].id,
          ...studentData
        })
      }
      
      // Fetch visit history
      const visitsQuery = query(
        collection(db, "visits"),
        where("studentId", "==", studentId),
        orderBy("visitDate", "desc")
      )
      const visitsSnapshot = await getDocs(visitsQuery)
      
      const visitsData = visitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        visitDate: doc.data().visitDate?.toDate()
      }))
      
      setVisits(visitsData)
    } catch (err) {
      console.error("Error fetching student data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center text-gray-600">Loading student information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl">
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mt-4">Error</h3>
            <p className="text-gray-600 mt-2">{error}</p>
            <button 
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            Student Information: {student.firstName} {student.lastName}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 text-2xl p-1 rounded hover:bg-gray-100 transition-colors"
            disabled={isAddingVisits}
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Personal Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">ID Number</p>
                  <p className="font-medium">{student.idNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{student.firstName} {student.middleName} {student.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{student.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{student.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Visits</p>
                  <p className="font-medium">{student.totalVisits || 0}</p>
                </div>
                {student.lastVisitDate && (
                  <div>
                    <p className="text-sm text-gray-500">Last Visit</p>
                    <p className="font-medium">
                      {format(student.lastVisitDate.toDate(), 'MMM dd, yyyy hh:mm a')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Academic Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{student.course || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium break-all">{student.email}</p>
                </div>
              </div>
              
              {/* Add Visits Form */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-800 mb-3">Add Visits</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Visits</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newVisitCount}
                      onChange={(e) => setNewVisitCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled={isAddingVisits}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={visitReason}
                      onChange={(e) => setVisitReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter visit reason"
                      rows={3}
                      disabled={isAddingVisits}
                    />
                  </div>
                  <button
                    onClick={addVisits}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    disabled={isAddingVisits}
                  >
                    {isAddingVisits ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Add ${newVisitCount} Visit${newVisitCount > 1 ? 's' : ''}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Student's General Reasons of Visit */}
          {student.reasonsOfVisit && (
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">General Reasons of Visit</h3>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="whitespace-pre-wrap">{student.reasonsOfVisit}</p>
              </div>
            </div>
          )}

          {/* Visit History */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Visit History</h3>
              <span className="text-sm text-gray-500">
                Total: {visits.length} visit{visits.length !== 1 ? 's' : ''}
              </span>
            </div>
            {visits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {visits.map((visit) => (
                      <tr key={visit.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {format(visit.visitDate, 'MMM dd, yyyy hh:mm a')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {visit.reason}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 capitalize">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            visit.type === 'manual' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {visit.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No visit history recorded</p>
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            disabled={isAddingVisits}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewStudentInfo