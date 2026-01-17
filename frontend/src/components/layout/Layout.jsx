import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />
      <main className="flex-grow bg-gray-50">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
