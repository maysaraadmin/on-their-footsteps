import React, { useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitted(true)
    setIsSubmitting(false)
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  if (submitted) {
    return (
      <div className="py-12 max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4">شكراً لتواصلك معنا!</h2>
          <p className="text-gray-600 mb-6">
            سنقوم بالرد على رسالتك في أقرب وقت ممكن.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            إرسال رسالة أخرى
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">اتصل بنا</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4">أرسل لنا رسالة</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  dir="rtl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموضوع
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  dir="rtl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرسالة
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  dir="rtl"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>
          
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">معلومات التواصل</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📧</span>
                </div>
                <div>
                  <h3 className="font-medium">البريد الإلكتروني</h3>
                  <p className="text-gray-600">info@ontheirfootsteps.com</p>
                  <p className="text-gray-600">support@ontheirfootsteps.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📱</span>
                </div>
                <div>
                  <h3 className="font-medium">الهاتف</h3>
                  <p className="text-gray-600">+966 50 123 4567</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📍</span>
                </div>
                <div>
                  <h3 className="font-medium">العنوان</h3>
                  <p className="text-gray-600">رياض، المملكة العربية السعودية</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🕐</span>
                </div>
                <div>
                  <h3 className="font-medium">ساعات العمل</h3>
                  <p className="text-gray-600">الأحد - الخميس: 9:00 ص - 5:00 م</p>
                  <p className="text-gray-600">الجمعة: 9:00 ص - 2:00 م</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium mb-4">تابعنا على</h3>
              <div className="flex space-x-4 space-x-reverse">
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  فيسبوك
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  تويتر
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  انستغرام
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  يوتيوب
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
