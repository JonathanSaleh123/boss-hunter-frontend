"use client"

import { useAuth } from '../hooks/useAuth'
import ArenaUI from '../components/ArenaUI'
import AIBossBattle from '../components/LandingPage'
import UserProfile from '../components/auth/UserProfile'
import LoadingSpinner from '../components/auth/LoadingSpinner'

export default function Home() {
  const { session, isLoading } = useAuth("/auth/signin")

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!session) {
    return null
  }

  return (
    <main className="w-full h-screen relative">
      <div className="absolute top-4 right-4 z-50">
        <UserProfile />
      </div>
      {/* <ArenaUI /> */}
      <AIBossBattle />
    </main>
  )
}