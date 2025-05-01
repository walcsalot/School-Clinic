"use client"

import { useState } from "react"

const AddEmployeeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    idNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    gender: "",
    course: "", // Using course field for department
    email: "",
    password: "",
    reasonsOfVisit: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="idNumber" className="mb-1 block text-sm font-medium text-gray-700">
            ID Number
          </label>
          <input
            type="text"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="middleName" className="mb-1 block text-sm font-medium text-gray-700">
            Middle Name
          </label>
          <input
            type="text"
            id="middleName"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="age" className="mb-1 block text-sm font-medium text-gray-700">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="course" className="mb-1 block text-sm font-medium text-gray-700">
            Department
          </label>
          <input
            type="text"
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="reasonsOfVisit" className="mb-1 block text-sm font-medium text-gray-700">
          Reasons Of Visit
        </label>
        <textarea
          id="reasonsOfVisit"
          name="reasonsOfVisit"
          value={formData.reasonsOfVisit}
          onChange={handleChange}
          rows="3"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          Submit
        </button>
      </div>
    </form>
  )
}

export default AddEmployeeForm
