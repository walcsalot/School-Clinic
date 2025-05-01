"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { auth, db } from "../../config/firebase";  // Correct relative path

const StudentProfile = () => {
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      const studentsRef = collection(db, "students")
      const q = query(studentsRef, where("uid", "==", user.uid))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0]
        const data = {
          id: studentDoc.id,
          ...studentDoc.data(),
        }
        setStudentData(data)
        setFormData(data)
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const studentRef = doc(db, "students", studentData.id)

      // Fields that can be updated
      const updatedData = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        course: formData.course,
      }

      await updateDoc(studentRef, updatedData)

      setStudentData({
        ...studentData,
        ...updatedData,
      })

      setEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile: " + error.message)
    }
  }

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">ID Number</label>
              <input
                type="text"
                value={studentData.idNumber}
                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">ID Number cannot be changed</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
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
                value={formData.course || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={studentData.email}
                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID Number</p>
                  <p>{studentData.idNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p>
                    {studentData.firstName} {studentData.middleName} {studentData.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p>{studentData.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p>{studentData.gender}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Academic Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Course</p>
                  <p>{studentData.course}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{studentData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentProfile
