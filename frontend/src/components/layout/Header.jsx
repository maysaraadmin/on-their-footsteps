import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          على خطاهم
        </Link>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">الرئيسية</Link>
          <Link to="/characters" className="hover:underline">الشخصيات</Link>
          <Link to="/categories" className="hover:underline">الأقسام</Link>
          <Link to="/timeline" className="hover:underline">الخط الزمني</Link>
          <Link to="/about" className="hover:underline">من نحن</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
