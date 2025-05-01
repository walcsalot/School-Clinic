"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../../config/firebase" // Correct relative path
import AddStudentForm from "./add-student-form"

const StudentList = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

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
    } catch (error) {
      console.error("Error fetching students:", error)
      setError("Failed to fetch students. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (studentData) => {
    try {
      setError("")
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, studentData.email, studentData.password)
      const user = userCredential.user

      // Add user to Firestore - using the user's UID as the document ID
      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        idNumber: studentData.idNumber,
        firstName: studentData.firstName,
        middleName: studentData.middleName,
        lastName: studentData.lastName,
        age: Number.parseInt(studentData.age, 10),
        gender: studentData.gender,
        course: studentData.course,
        email: studentData.email,
        reasonsOfVisit: studentData.reasonsOfVisit,
        createdAt: serverTimestamp(),
      })

      // Add user role to users collection - using the user's UID as the document ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: studentData.email,
        role: "student",
        createdAt: serverTimestamp(),
      })

      fetchStudents()
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding student:", error)
      setError(`Error adding student: ${error.message}`)
    }
  }

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      student.idNumber?.includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student List</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Student
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, ID, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center">Loading students...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ID Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">{student.idNumber}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {student.firstName} {student.middleName} {student.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{student.age}</td>
                    <td className="whitespace-nowrap px-6 py-4">{student.gender}</td>
                    <td className="whitespace-nowrap px-6 py-4">{student.course}</td>
                    <td className="whitespace-nowrap px-6 py-4">{student.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Student</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <AddStudentForm onSubmit={handleAddStudent} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentList
