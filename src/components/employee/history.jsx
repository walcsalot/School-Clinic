"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

const EmployeeHistory = () => {
  const [visitHistory, setVisitHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitHistory();
  }, []);

  const fetchVisitHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const employeesRef = collection(db, "employees");
      const employeeQuery = query(employeesRef, where("uid", "==", user.uid));
      const employeeSnapshot = await getDocs(employeeQuery);

      if (employeeSnapshot.empty) {
        setLoading(false);
        return;
      }

      const employeeDoc = employeeSnapshot.docs[0];
      const employeeId = employeeDoc.id;

      const visitsRef = collection(db, "visits");
      const visitsQuery = query(visitsRef, where("employeeId", "==", employeeId));
      const visitsSnapshot = await getDocs(visitsQuery);

      const history = visitsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }));

      history.sort((a, b) => b.date - a.date);

      setVisitHistory(history);
    } catch (error) {
      console.error("Error fetching visit history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px] text-[1.2rem] text-gray-600">
        <span>Loading...</span>
        <span className="inline-block w-5 h-5 ml-2.5 rounded-full border-[3px] border-gray-200 border-t-blue-500 animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="font-['Segoe_UI',_Roboto,_Oxygen,_Ubuntu,_Cantarell,_'Open_Sans',_sans-serif] max-w-[2000px] mx-auto p-8 text-gray-800">
      <h1 className="text-[2rem] font-semibold mb-8 text-gray-800 relative pb-2">
        Visit History
        <span className="absolute bottom-0 left-0 w-[60px] h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded"></span>
      </h1>

      {visitHistory.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-xl shadow-sm">
          <div className="inline-flex items-center justify-center w-[60px] h-[60px] bg-blue-50 rounded-full mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-[30px] h-[30px] text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-[1.5rem] font-semibold mb-2 text-gray-800">No Visit History</h2>
          <p className="text-gray-600 text-[1.1rem] max-w-[500px] mx-auto">
            You don't have any recorded visits to the clinic yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-px">
          <table className="w-full border-collapse text-[0.95rem]">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="p-4 text-left font-semibold text-gray-600 uppercase text-[0.8rem] tracking-[0.5px]">
                  Date
                </th>
                <th className="p-4 text-left font-semibold text-gray-600 uppercase text-[0.8rem] tracking-[0.5px]">
                  Reason for Visit
                </th>
              </tr>
            </thead>
            <tbody>
              {visitHistory.map((visit, index) => (
                <tr 
                  key={visit.id} 
                  className="border-b border-gray-200 hover:bg-gray-50 last:border-b-0"
                  style={{
                    animation: `fadeIn 0.3s ease-out forwards`,
                    animationDelay: `${(index + 1) * 0.1}s`,
                    opacity: 0
                  }}
                >
                  <td className="p-5 align-top">{visit.date.toLocaleDateString()}</td>
                  <td className="p-5 align-top">{visit.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .employee-history-container {
            padding: 1.5rem;
          }
          
          .title {
            font-size: 1.75rem;
          }
          
          .visit-table th,
          .visit-table td {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeHistory;