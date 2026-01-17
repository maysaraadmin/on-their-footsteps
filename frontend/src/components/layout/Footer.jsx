import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">على خطاهم</h3>
            <p className="text-gray-600">تطبيق للتعرف على سير الصحابة والتابعين</p>
          </div>
          <div className="flex space-x-6">
            <Link to="/about" className="text-blue-600 hover:underline">من نحن</Link>
            <Link to="/privacy" className="text-blue-600 hover:underline">الخصوصية</Link>
            <Link to="/terms" className="text-blue-600 hover:underline">الشروط</Link>
            <Link to="/contact" className="text-blue-600 hover:underline">اتصل بنا</Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} على خطاهم. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  )
}

export default Footer
