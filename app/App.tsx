import React from 'react'
import { AuthContext, useAuthState } from './src/hooks/useAuth'
import { RootNavigator } from './src/navigation/RootNavigator'

export default function App() {
  const auth = useAuthState()
  return (
    <AuthContext.Provider value={auth}>
      <RootNavigator />
    </AuthContext.Provider>
  )
}
