import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Till System - SmashDaddy',
  description: 'Restaurant till system for order management',
}

export default function TillLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
} 