"use client"

import { useState } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { serverTimestamp, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore"
import { auth, db } from "../../config/firebase"

export default function DebugAuth() {
  const [email, setEmail] = useState("stefen@gmail.com")
  const [password, setPassword] = useState("password123")
  const [role, setRole] = useState("admin")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setStatus("Attempting to login...")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      setStatus(`Login successful! User ID: ${user.uid}`)

      // Test Firestore access
      setStatus((prev) => prev + "\nTesting Firestore access...")

      try {
        // Try direct document access
        const userDocRef = doc(db, "users", user.uid)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          setStatus((prev) => prev + `\nDirect document access successful! User role: ${userDocSnap.data().role}`)
        } else {
          setStatus((prev) => prev + "\nUser document doesn't exist in Firestore")
        }
      } catch (firestoreError) {
        setStatus(
          (prev) => prev + `\nFirestore direct access error: ${firestoreError.code} - ${firestoreError.message}`,
        )
      }

      try {
        // Try query access
        const usersRef = collection(db, "users")
        const querySnapshot = await getDocs(usersRef)
        setStatus((prev) => prev + `\nCollection query successful! Found ${querySnapshot.size} users`)
      } catch (queryError) {
        setStatus((prev) => prev + `\nFirestore query error: ${queryError.code} - ${queryError.message}`)
      }
    } catch (error) {
      setStatus(`Login failed: ${error.code} - ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    setLoading(true)
    setStatus("Creating user...")

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Add user to users collection with role
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        createdAt: serverTimestamp(),
      })

      // Add user to role-specific collection
      if (role === "admin") {
        await setDoc(doc(db, "admins", user.uid), {
          uid: user.uid,
          email: user.email,
          firstName: "Admin",
          lastName: "User",
          createdAt: serverTimestamp(),
        })
      } else if (role === "student") {
        await setDoc(doc(db, "students", user.uid), {
          uid: user.uid,
          email: user.email,
          firstName: "Student",
          lastName: "User",
          idNumber: "ST" + Math.floor(10000 + Math.random() * 90000),
          age: 20,
          gender: "Not Specified",
          course: "Not Specified",
          createdAt: serverTimestamp(),
        })
      } else if (role === "employee") {
        await setDoc(doc(db, "employees", user.uid), {
          uid: user.uid,
          email: user.email,
          firstName: "Employee",
          lastName: "User",
          idNumber: "EM" + Math.floor(10000 + Math.random() * 90000),
          age: 30,
          gender: "Not Specified",
          department: "Not Specified",
          createdAt: serverTimestamp(),
        })
      }

      setStatus(`User created successfully with role: ${role}`)
    } catch (error) {
      setStatus(`User creation failed: ${error.code} - ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Firebase Authentication Debug</h1>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Password:</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "8px" }}>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={testLogin}
          disabled={loading}
          style={{ padding: "10px 15px", background: "#4285F4", color: "white", border: "none", borderRadius: "4px" }}
        >
          Test Login
        </button>
        <button
          onClick={createUser}
          disabled={loading}
          style={{ padding: "10px 15px", background: "#34A853", color: "white", border: "none", borderRadius: "4px" }}
        >
          Create User
        </button>
      </div>

      <div
        style={{
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          background: "#f9f9f9",
          minHeight: "100px",
        }}
      >
        <strong>Status:</strong>
        <pre style={{ whiteSpace: "pre-wrap" }}>{status || "Ready"}</pre>
      </div>
    </div>
  )
}
