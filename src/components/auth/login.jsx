"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import "../../Css/login.css"

const Login = ({ setUser, setUserRole }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [debug, setDebug] = useState("")

  const navigate = useNavigate()
  const { role } = useParams()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setDebug("")

    try {
      // Add debug info
      setDebug((prev) => prev + `Attempting to sign in with email: ${email}\n`)

      // Sign in user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      setDebug((prev) => prev + `Authentication successful. User ID: ${user.uid}\n`)
      setDebug((prev) => prev + `Checking for user role in Firestore...\n`)

      // Check user role in Firestore - use direct document access to avoid permission issues
      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data()
          setDebug((prev) => prev + `User found in Firestore. Role: ${userData.role}\n`)

          // Verify if the user has the selected role
          if (userData.role !== role) {
            setDebug((prev) => prev + `Role mismatch. User role: ${userData.role}, Selected role: ${role}\n`)
            setError(`This account is not registered as a ${role}. Please select the correct role.`)
            await auth.signOut()
            setUser(null)
            setLoading(false)
            return
          }

          // Set user and role in state
          setUser(user)
          setUserRole(userData.role)
          setDebug((prev) => prev + `Login successful. Navigating to /${userData.role}\n`)

          // Navigate to the appropriate dashboard
          navigate(`/${userData.role}`)
        } else {
          setDebug((prev) => prev + `User not found in Firestore. Creating new user document...\n`)

          // User exists in Authentication but not in Firestore
          // Create a new user document in Firestore
          try {
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              email: user.email,
              role: role,
              createdAt: serverTimestamp(),
            })

            setDebug((prev) => prev + `Created user document in users collection\n`)

            // Also create a document in the role-specific collection
            if (role === "admin") {
              await setDoc(doc(db, "admins", user.uid), {
                uid: user.uid,
                email: user.email,
                firstName: "Admin",
                lastName: "User",
                createdAt: serverTimestamp(),
              })
              setDebug((prev) => prev + `Created admin document\n`)
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
              setDebug((prev) => prev + `Created student document\n`)
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
              setDebug((prev) => prev + `Created employee document\n`)
            }

            // Set user and role in state
            setUser(user)
            setUserRole(role)
            setDebug((prev) => prev + `Login successful. Navigating to /${role}\n`)

            // Navigate to the appropriate dashboard
            navigate(`/${role}`)
          } catch (error) {
            setDebug((prev) => prev + `Error creating user document: ${error.message}\n`)
            console.error("Error creating user document:", error)
            setError("Failed to create user profile. Please contact an administrator.")
            await auth.signOut()
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Error fetching user document:", error)
        setError("Failed to fetch user data. Please try again.")
        await auth.signOut()
        setUser(null)
      }
    } catch (error) {
      setDebug((prev) => prev + `Login error: ${error.code} - ${error.message}\n`)
      console.error("Login error:", error)

      // Provide more specific error messages based on Firebase error codes
      if (error.code === "auth/invalid-email") {
        setError("Invalid email format")
      } else if (error.code === "auth/user-not-found") {
        setError("No user found with this email")
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later")
      } else {
        setError(`Authentication error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate("/")
  }

  // Function to toggle debug info visibility
  const toggleDebug = () => {
    const debugElement = document.getElementById("debug-info")
    if (debugElement) {
      debugElement.style.display = debugElement.style.display === "none" ? "block" : "none"
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>School Clinic Response System</h1>
          <p>
            Sign in as{" "}
            <span className="role-label" style={{ color: "red" }}>
              {role}
            </span>
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button type="button" onClick={handleBack} className="btn-secondary">
              Back to Role Selection
            </button>
          </div>
        </form>

        {/* Debug button - only visible in development */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={toggleDebug}
            style={{
              background: "transparent",
              border: "none",
              color: "#999",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Debug Info
          </button>

          <div
            id="debug-info"
            style={{
              display: "none",
              marginTop: "10px",
              padding: "10px",
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              textAlign: "left",
              fontSize: "12px",
              whiteSpace: "pre-wrap",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {debug || "No debug information available"}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
