"use client";

import { useNavigate } from "react-router-dom";

const Choosing = ({ setSelectedRole }) => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (setSelectedRole) setSelectedRole(role);
    navigate(`/login/${role}`);
  };

  const roleData = [
    {
      id: "admin",
      title: "Administrator",
      description: "Manage clinic operations and user accounts",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bgColor: "bg-white",
      borderColor: "border-purple-200",
      textColor: "text-purple-800",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    },
    {
      id: "student",
      title: "Student",
      description: "Access your health records and services",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      bgColor: "bg-white",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: "employee",
      title: "Employee",
      description: "Manage your health profile and records",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: "bg-white",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      buttonColor: "bg-green-600 hover:bg-green-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* School Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">SCHOOL-CLINIC-RESPONSE-SYSTEM</h1>
          </div>
          <div className="text-sm text-gray-500">
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
          {/* Portal Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">School Health Portal</h1>
            <p className="text-gray-600">Select your role to access the clinic management system</p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {roleData.map((role) => (
              <div 
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`cursor-pointer rounded-lg border ${role.borderColor} ${role.bgColor} p-6 transition-all duration-200 hover:shadow-md`}
              >
                <div className={`flex items-center justify-center h-12 w-12 rounded-lg ${role.buttonColor} mb-4 text-white`}>
                  {role.icon}
                </div>
                <h2 className={`text-lg font-semibold ${role.textColor} mb-2`}>{role.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{role.description}</p>
                <button
                  className={`w-full py-2 px-4 rounded-md text-white text-sm font-medium ${role.buttonColor} transition-colors duration-200`}
                >
                  Continue
                </button>
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Need assistance?</h3>
              <p className="mt-1 text-sm text-gray-500">
                Contact the school clinic at <span className="text-blue-600">clinic@spciligan.edu</span> or call <span className="text-blue-600">09816199937</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-2 md:mb-0">
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700">Terms of Service</a>
              <a href="#" className="hover:text-gray-700">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Choosing;