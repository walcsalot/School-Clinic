"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { auth, db } from "../../config/firebase";  // Correct relative path

const EmployeeHistory = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

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
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employee) => {
    setEditingEmployee({
      ...employee,
      age: employee.age?.toString() || "",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditingEmployee((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdate = async () => {
    try {
      const employeeRef = doc(db, "employees", editingEmployee.id)

      // Convert age back to number
      const updatedEmployee = {
        ...editingEmployee,
        age: Number.parseInt(editingEmployee.age),
      }

      // Remove id field before updating
      delete updatedEmployee.id

      await updateDoc(employeeRef, updatedEmployee)

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === editingEmployee.id ? { id: editingEmployee.id, ...updatedEmployee } : employee,
        ),
      )

      setEditingEmployee(null)
    } catch (error) {
      console.error("Error updating employee:", error)
      alert("Error updating employee: " + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteDoc(doc(db, "employees", id))
        setEmployees((prev) => prev.filter((employee) => employee.id !== id))
      } catch (error) {
        console.error("Error deleting employee:", error)
        alert("Error deleting employee: " + error.message)
      }
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.middleName} ${employee.lastName}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      employee.idNumber?.includes(searchTerm) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.reasonsOfVisit?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Employee History</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, ID, email, or reason of visit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center">Loading employee history...</div>
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reasons Of Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
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
                    <td className="px-6 py-4">{employee.reasonsOfVisit}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="mr-2 rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
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
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Employee</h2>
              <button onClick={() => setEditingEmployee(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={editingEmployee.idNumber || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={editingEmployee.firstName || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={editingEmployee.middleName || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={editingEmployee.lastName || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={editingEmployee.age || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={editingEmployee.gender || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={editingEmployee.department || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingEmployee.email || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Reasons Of Visit</label>
              <textarea
                name="reasonsOfVisit"
                value={editingEmployee.reasonsOfVisit || ""}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setEditingEmployee(null)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeHistory
