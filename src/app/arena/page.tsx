"use client"

import { useAuth } from '../../hooks/useAuth'
import ArenaUI from '../../components/ArenaUI'
import UserProfile from '../../components/auth/UserProfile'
import LoadingSpinner from '../../components/auth/LoadingSpinner'

export default function ArenaPage() {
  const { session, isLoading } = useAuth("/auth/signin")

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!session) {
    return null
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <UserProfile />
      </div>
      <ArenaUI />
    </div>
  )
} 