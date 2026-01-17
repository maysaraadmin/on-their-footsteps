import React from 'react'

const ProgressChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">مخطط التقدم</h3>
      {data.length > 0 ? (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-grow mr-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-gray-500">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">لا توجد بيانات تقدم متاحة</p>
      )}
    </div>
  )
}

export default ProgressChart