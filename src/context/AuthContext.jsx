import {
  createUserWithEmailAndPassword,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { auth } from '../firebase'
import AuthContext from './AuthContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(Boolean(auth))
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    if (!auth) {
      return undefined
    }

    let activeUid = null
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      activeUid = currentUser?.uid ?? null
      setUser(currentUser)
      setAuthError('')

      if (!currentUser) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setLoading(true)
      getIdTokenResult(currentUser)
        .then((tokenResult) => {
          if (activeUid !== currentUser.uid) return
          setIsAdmin(tokenResult.claims.admin === true)
          setLoading(false)
        })
        .catch((error) => {
          if (activeUid !== currentUser.uid) return
          setIsAdmin(false)
          setAuthError(`No se pudo verificar el permiso de administración: ${error.message}`)
          setLoading(false)
        })
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase no está configurado. Revisa las variables VITE_FIREBASE_*.')
    const credential = await signInWithEmailAndPassword(auth, email, password)
    setAuthMessage(`Se conectó correctamente: ${credential.user.email}`)
  }, [])

  const register = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase no está configurado. Revisa las variables VITE_FIREBASE_*.')
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    setAuthMessage(`Cuenta creada y sesión iniciada: ${credential.user.email}`)
  }, [])

  const logout = useCallback(async () => {
    if (!auth) throw new Error('Firebase no está configurado. Revisa las variables VITE_FIREBASE_*.')
    await signOut(auth)
    setAuthMessage('')
  }, [])

  const value = useMemo(
    () => ({ user, isAdmin, loading, authError, authMessage, login, register, logout }),
    [user, isAdmin, loading, authError, authMessage, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
