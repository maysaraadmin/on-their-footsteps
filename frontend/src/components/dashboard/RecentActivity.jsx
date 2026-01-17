import React from 'react'

const RecentActivity = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">النشاط الأخير</h3>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 space-x-reverse">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">
                    {activity.type === 'character' ? '👤' : 
                     activity.type === 'lesson' ? '📚' : 
                     activity.type === 'achievement' ? '🏆' : '📝'}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">لا توجد أنشطة حديثة</p>
      )}
    </div>
  )
}

export default RecentActivity
