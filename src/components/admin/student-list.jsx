"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../../config/firebase"
import AddStudentForm from "./add-student-form"
import AdminDashboard from "./dashboard";

const StudentList = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "students"))
      const studentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStudents(studentsList)
      setErrorMessage("")
    } catch (error) {
      console.error("Error fetching students:", error)
      setErrorMessage("Failed to load students. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (studentData) => {
    try {
      setLoading(true)
      setErrorMessage("")
      setSuccessMessage("")
      
      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        studentData.email, 
        studentData.password
      )

      // Add to students collection
      await addDoc(collection(db, "students"), {
        uid: userCredential.user.uid,
        idNumber: studentData.idNumber,
        firstName: studentData.firstName,
        middleName: studentData.middleName,
        lastName: studentData.lastName,
        age: studentData.age,
        gender: studentData.gender,
        course: studentData.course,
        email: studentData.email,
        reasonsOfVisit: studentData.reasonsOfVisit,
        createdAt: serverTimestamp(),
      })

      // Add to users collection for role management
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email: studentData.email,
        role: "student",
        createdAt: serverTimestamp(),
      })

      // Add to student history
      await addDoc(collection(db, "studentHistory"), {
        uid: userCredential.user.uid,
        idNumber: studentData.idNumber,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        action: "created",
        timestamp: serverTimestamp(),
      })

      setSuccessMessage("Student added successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
      fetchStudents()
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding student:", error)
      let errorMsg = "Error adding student"
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = "Email already in use"
      } else if (error.code === 'auth/weak-password') {
        errorMsg = "Password should be at least 6 characters"
      }
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      student.idNumber?.includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="font-sans max-w-full mx-auto my-8 p-6 rounded-lg shadow-md w-[1220px] ml-5 bg-white">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl text-gray-800 m-0 font-semibold">Student List</h1>
        <button 
          onClick={() => {
            setShowAddForm(true)
            setErrorMessage("")
            setSuccessMessage("")
          }} 
          className="bg-blue-500 text-white border-none py-2 px-4 rounded-md cursor-pointer text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:bg-blue-600 hover:-translate-y-px hover:shadow-md hover:shadow-blue-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Add Student"}
        </button>
      </div>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search by name, ID, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-md text-sm bg-white text-black transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {loading && !showAddForm ? (
        <div className="py-8 text-center text-gray-500 italic">Loading students...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-sm mb-6">
          <table className="w-full bg-white min-w-[900px]">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider border-b-2 border-gray-200">ID Number</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider border-b-2 border-gray-200">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider border-b-2 border-gray-200">Age</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider border-b-2 border-gray-200">Gender</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider border-b-2 border-gray-200">Course</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider border-b-2 border-gray-200">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 border-b border-gray-200 font-mono font-medium w-[120px]">{student.idNumber}</td>
                    <td className="px-4 py-4 border-b border-gray-200 min-w-[200px] font-medium">{student.firstName} {student.middleName} {student.lastName}</td>
                    <td className="px-4 py-4 border-b border-gray-200 w-[80px] text-center">{student.age}</td>
                    <td className="px-4 py-4 border-b border-gray-200 w-[100px] capitalize">{student.gender}</td>
                    <td className="px-4 py-4 border-b border-gray-200 min-w-[180px]">{student.course}</td>
                    <td className="px-4 py-4 border-b border-gray-200 min-w-[220px] break-all">{student.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-lg">
                    {searchTerm ? "No matching students found" : "No students found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h2 className="text-xl font-semibold">Add New Student</h2>
              <button 
                onClick={() => {
                  setShowAddForm(false)
                  setErrorMessage("")
                }} 
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={loading}
              >
                ✕
              </button>
            </div>
            <AddStudentForm 
              onSubmit={handleAddStudent} 
              onCancel={() => {
                setShowAddForm(false)
                setErrorMessage("")
              }} 
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentList