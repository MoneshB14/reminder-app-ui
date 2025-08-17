import { useState, useEffect } from "react"

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check login status from localStorage
    const loginStatus = localStorage.getItem("isLoggedIn")
    const email = localStorage.getItem("userEmail")
    
    if (loginStatus === "true" && email) {
      setIsLoggedIn(true)
      setUserEmail(email)
    }
    
    setIsLoading(false)
  }, [])

  const login = (email: string) => {
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userEmail", email)
    setIsLoggedIn(true)
    setUserEmail(email)
  }

  const logout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    setIsLoggedIn(false)
    setUserEmail(null)
  }

  return {
    isLoggedIn,
    userEmail,
    isLoading,
    login,
    logout,
  }
}
