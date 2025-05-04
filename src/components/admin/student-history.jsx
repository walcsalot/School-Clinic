"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import ViewStudentInfo from "./ViewStudentInfo"

const StudentHistory = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingStudentId, setViewingStudentId] = useState(null)

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
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student) => {
    setEditingStudent({
      ...student,
      age: student.age?.toString() || "",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditingStudent((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdate = async () => {
    try {
      const studentRef = doc(db, "students", editingStudent.id)
      const updatedStudent = {
        ...editingStudent,
        age: Number.parseInt(editingStudent.age),
      }
      delete updatedStudent.id
      await updateDoc(studentRef, updatedStudent)
      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent.id ? { id: editingStudent.id, ...updatedStudent } : student,
        ),
      )
      setEditingStudent(null)
    } catch (error) {
      console.error("Error updating student:", error)
      alert("Error updating student: " + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteDoc(doc(db, "students", id))
        setStudents((prev) => prev.filter((student) => student.id !== id))
      } catch (error) {
        console.error("Error deleting student:", error)
        alert("Error deleting student: " + error.message)
      }
    }
  }

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      student.idNumber?.includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.reasonsOfVisit?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 relative inline-block">
        Student History
        <span className="absolute bottom-[-8px] left-0 w-14 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded"></span>
      </h1>

      <div className="relative mb-7">
        <input
          type="text"
          placeholder="Search by name, ID, email, or reason of visit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg text-sm bg-white text-black shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "12px center"
          }}
        />
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading student history...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0">ID Number</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0">Age</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0">Gender</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0">Course</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0">Reasons Of Visit</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 border-b border-gray-100 font-mono font-medium">{student.idNumber}</td>
                    <td className="px-5 py-4 border-b border-gray-100 font-medium">{student.firstName} {student.middleName} {student.lastName}</td>
                    <td className="px-5 py-4 border-b border-gray-100">{student.age}</td>
                    <td className="px-5 py-4 border-b border-gray-100 capitalize">{student.gender}</td>
                    <td className="px-5 py-4 border-b border-gray-100">{student.course}</td>
                    <td className="px-5 py-4 border-b border-gray-100 break-all">{student.email}</td>
                    <td className="px-5 py-4 border-b border-gray-100">{student.reasonsOfVisit}</td>
                    <td className="px-5 py-4 border-b border-gray-100">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(student)} 
                          className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setViewingStudentId(student.idNumber)} 
                          className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)} 
                          className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg">
                        {searchTerm ? "No matching students found" : "No students found"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-slideUp">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Student</h2>
              <button 
                onClick={() => setEditingStudent(null)} 
                className="text-gray-400 hover:text-gray-500 text-2xl p-1 rounded hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-5 mb-6">
                {[
                  { label: "ID Number", name: "idNumber" },
                  { label: "First Name", name: "firstName" },
                  { label: "Middle Name", name: "middleName" },
                  { label: "Last Name", name: "lastName" },
                  { label: "Age", name: "age", type: "number" },
                  { label: "Course", name: "course" },
                ].map(({ label, name, type = "text" }) => (
                  <div key={name} className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={editingStudent[name] || ""}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                ))}

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={editingStudent.gender || ""}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editingStudent.email || ""}
                    onChange={handleChange}
                    readOnly
                    className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                  <small className="text-xs text-gray-500 mt-1">Email cannot be changed</small>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-1">Reasons Of Visit</label>
                <textarea
                  name="reasonsOfVisit"
                  rows="3"
                  value={editingStudent.reasonsOfVisit || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setEditingStudent(null)} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingStudentId && (
        <ViewStudentInfo 
          studentId={viewingStudentId} 
          onClose={() => setViewingStudentId(null)} 
        />
      )}
    </div>
  )
}

export default StudentHistory