
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { auth } from '../firebase'
import AuthContext from './AuthContextValue'

const ADMIN_UID = 'ELOTUimW7hNJZzCdScEQQ0fLIbx2'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(Boolean(auth))
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthError('')

      if (!currentUser) {
        setIsAdmin(false)
      } else {
        setIsAdmin(currentUser.uid === ADMIN_UID)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase no está configurado.')
    const credential = await signInWithEmailAndPassword(auth, email, password)
    setAuthMessage(`Se conectó correctamente: ${credential.user.email}`)
  }, [])

  const register = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase no está configurado.')
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    setAuthMessage(`Cuenta creada y sesión iniciada: ${credential.user.email}`)
  }, [])

  const logout = useCallback(async () => {
    if (!auth) throw new Error('Firebase no está configurado.')
    await signOut(auth)
    setAuthMessage('')
  }, [])

  const value = useMemo(
    () => ({ user, isAdmin, loading, authError, authMessage, login, register, logout }),
    [user, isAdmin, loading, authError, authMessage, login, register, logout],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
