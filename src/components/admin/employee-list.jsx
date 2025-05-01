"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../../config/firebase" // Correct relative path
import AddEmployeeForm from "./add-employee-form"

const EmployeeList = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "employees"))
      const employeesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setEmployees(employeesList)
    } catch (error) {
      console.error("Error fetching employees:", error)
      setError("Failed to fetch employees. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (employeeData) => {
    try {
      setError("")
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, employeeData.email, employeeData.password)
      const user = userCredential.user

      // Add user to Firestore - using the user's UID as the document ID
      await setDoc(doc(db, "employees", user.uid), {
        uid: user.uid,
        idNumber: employeeData.idNumber,
        firstName: employeeData.firstName,
        middleName: employeeData.middleName,
        lastName: employeeData.lastName,
        age: Number.parseInt(employeeData.age, 10),
        gender: employeeData.gender,
        department: employeeData.course, // Using course field for department
        email: employeeData.email,
        reasonsOfVisit: employeeData.reasonsOfVisit,
        createdAt: serverTimestamp(),
      })

      // Add user role to users collection - using the user's UID as the document ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: employeeData.email,
        role: "employee",
        createdAt: serverTimestamp(),
      })

      fetchEmployees()
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding employee:", error)
      setError(`Error adding employee: ${error.message}`)
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName || ""} ${employee.middleName || ""} ${employee.lastName || ""}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      employee.idNumber?.includes(searchTerm) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employee List</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Add Employee
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
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center">Loading employees...</div>
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
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">{employee.idNumber}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {employee.firstName} {employee.middleName} {employee.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{employee.age}</td>
                    <td className="whitespace-nowrap px-6 py-4">{employee.gender}</td>
                    <td className="whitespace-nowrap px-6 py-4">{employee.department}</td>
                    <td className="whitespace-nowrap px-6 py-4">{employee.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No employees found
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
              <h2 className="text-xl font-bold">Add New Employee</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <AddEmployeeForm onSubmit={handleAddEmployee} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeList
