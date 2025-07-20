import React from 'react'
import UserNavbar from '../components/UserNavbar'
import { Outlet } from 'react-router-dom'
import Footer from '../../components/Footer'

const UserLayout = () => {

  return (
    <div className="h-screen flex flex-col">
      <UserNavbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <Footer />
    </div>

  )
}

export default UserLayout