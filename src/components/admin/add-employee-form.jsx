"use client";

import { useState } from "react";
import { db, secondaryAuth } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";

const AddEmployeeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    idNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    gender: "",
    department: "",
    email: "",
    password: "",
    reasonsOfVisit: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, ...employeeInfo } = formData;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // ✅ Create employee account using secondaryAuth to avoid logging out the admin
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      const user = userCredential.user;
      await secondaryAuth.signOut();

      // ✅ Add to employees collection
      const employeeRef = await addDoc(collection(db, "employees"), {
        ...employeeInfo,
        email,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      // ✅ Add to users collection for role management
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        role: "employee",
        createdAt: serverTimestamp(),
      });

      // ✅ Log creation in employeeHistory
      await addDoc(collection(db, "employeeHistory"), {
        ...employeeInfo,
        email,
        uid: user.uid,
        action: "created",
        timestamp: serverTimestamp(),
      });

      setSuccess(
        "Employee created successfully! The employee can now login with the provided credentials."
      );

      setFormData({
        idNumber: "",
        firstName: "",
        middleName: "",
        lastName: "",
        age: "",
        gender: "",
        department: "",
        email: "",
        password: "",
        reasonsOfVisit: "",
      });

      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Error creating employee:", error);
      setError("Error creating employee: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-xl md:text-2xl font-bold text-red-800">
            Add New Employee
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Fill out the form to register a new employee
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="p-4 md:p-6 rounded-lg border bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">👤</span>
                <h2 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: "ID Number", name: "idNumber", type: "text" },
                  { label: "First Name", name: "firstName", type: "text" },
                  { label: "Middle Name", name: "middleName", type: "text" },
                  { label: "Last Name", name: "lastName", type: "text" },
                  { label: "Age", name: "age", type: "number" },
                  {
                    label: "Gender",
                    name: "gender",
                    type: "select",
                    options: ["", "Male", "Female", "Other"],
                  },
                  { label: "Department", name: "department", type: "text" },
                ].map(({ label, name, type, options }) => (
                  <div key={name} className="space-y-1">
                    <label
                      htmlFor={name}
                      className="block text-xs font-medium text-gray-700"
                    >
                      {label}
                    </label>
                    {type === "select" ? (
                      <select
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50"
                      >
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option || "Select"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 md:p-6 rounded-lg border bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔐</span>
                <h2 className="text-lg font-semibold text-gray-800">
                  Account Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Email", name: "email", type: "email" },
                  { label: "Password", name: "password", type: "password" },
                ].map(({ label, name, type }) => (
                  <div key={name} className="space-y-1">
                    <label
                      htmlFor={name}
                      className="block text-xs font-medium text-gray-700"
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      id={name}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50"
                    />
                    {name === "password" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 6 characters
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 md:p-6 rounded-lg border bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📝</span>
                <h2 className="text-lg font-semibold text-gray-800">
                  Reasons for Visit
                </h2>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="reasonsOfVisit"
                  className="block text-xs font-medium text-gray-700"
                >
                  Describe the reasons for visit
                </label>
                <textarea
                  id="reasonsOfVisit"
                  name="reasonsOfVisit"
                  rows={3}
                  value={formData.reasonsOfVisit}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border rounded-lg bg-white text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-70"
                  >
                    {loading ? "Creating..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeForm;