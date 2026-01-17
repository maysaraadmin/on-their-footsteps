import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">مرحباً بكم في تطبيق "على خطاهم"</h1>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          اكتشف سير الصحابة والتابعين وتعلم من سيرتهم العطرة. رحلة عبر التاريخ الإسلامي تنتظرك.
        </p>
        <div className="space-x-4 space-x-reverse">
          <Link 
            to="/characters" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            ابدأ الرحلة
          </Link>
          <Link 
            to="/about" 
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            اعرف المزيد
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
