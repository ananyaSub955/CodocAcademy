import React from 'react'
import SuperAdminNavbar from '../components/SuperAdminNavbar'
import { Outlet } from 'react-router-dom'
import Footer from '../../components/Footer'

const UserLayout = () => {
    
  return (
    <div className="min-h-screen flex flex-col">
        <SuperAdminNavbar/>
        <main className="flex-1 w-full overflow-auto"> {/* Critical for layout */}
        <Outlet/>
      </main>
      <Footer/>
    </div>
  )
}

export default UserLayout