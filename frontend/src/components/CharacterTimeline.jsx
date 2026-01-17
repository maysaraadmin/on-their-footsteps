import React from 'react'

const CharacterTimeline = ({ events = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4">الخط الزمني للشخصية</h3>
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start space-x-4 space-x-reverse">
              <div className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <span className="text-sm text-gray-500">{event.year}</span>
                </div>
                <p className="text-gray-600 text-sm">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">لا توجد أحداث متاحة لهذه الشخصية</p>
      )}
    </div>
  )
}

export default CharacterTimeline
