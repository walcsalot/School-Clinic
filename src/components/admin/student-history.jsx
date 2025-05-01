"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { auth, db } from "../../config/firebase";  // Correct relative path

const StudentHistory = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

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

      // Convert age back to number
      const updatedStudent = {
        ...editingStudent,
        age: Number.parseInt(editingStudent.age),
      }

      // Remove id field before updating
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
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Student History</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, ID, email, or reason of visit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center">Loading student history...</div>
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reasons Of Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
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
                    <td className="px-6 py-4">{student.reasonsOfVisit}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => handleEdit(student)}
                        className="mr-2 rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Student</h2>
              <button onClick={() => setEditingStudent(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={editingStudent.idNumber || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={editingStudent.firstName || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={editingStudent.middleName || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={editingStudent.lastName || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={editingStudent.age || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={editingStudent.gender || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Course</label>
                <input
                  type="text"
                  name="course"
                  value={editingStudent.course || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingStudent.email || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Reasons Of Visit</label>
              <textarea
                name="reasonsOfVisit"
                value={editingStudent.reasonsOfVisit || ""}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setEditingStudent(null)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleUpdate} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentHistory
