import React from 'react'

const AchievementBadge = ({ achievements = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">الإنجازات</h3>
      {achievements.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`text-center p-4 rounded-lg ${
                achievement.unlocked 
                  ? 'bg-yellow-50 border-2 border-yellow-300' 
                  : 'bg-gray-50 border-2 border-gray-200 opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h4 className="font-medium text-sm">{achievement.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
              {achievement.unlocked && (
                <div className="mt-2">
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                    تم الحصول عليها
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">لا توجد إنجازات متاحة</p>
      )}
    </div>
  )
}

export default AchievementBadge
