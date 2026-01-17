import React from 'react'

const DailyStreak = ({ streak = 0 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">السلسلة اليومية</h3>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
          <span className="text-3xl">🔥</span>
        </div>
        <div className="text-3xl font-bold text-orange-600 mb-2">{streak}</div>
        <p className="text-gray-600">يوم متتالي</p>
        {streak > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            استمر في التعلم للحفاظ على سلسلتك!
          </p>
        )}
        {streak === 0 && (
          <p className="text-sm text-blue-600 mt-2">
            ابدأ التعلم اليوم لبناء سلسلتك!
          </p>
        )}
      </div>
    </div>
  )
}

export default DailyStreak
