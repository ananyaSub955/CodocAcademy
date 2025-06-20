import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full overflow-auto"> {/* Critical for layout */}
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
export default RootLayout