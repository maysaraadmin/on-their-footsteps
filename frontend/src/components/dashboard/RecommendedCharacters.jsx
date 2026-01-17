import React from 'react'
import { Link } from 'react-router-dom'

const RecommendedCharacters = ({ characters = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">شخصيات مقترحة</h3>
      {characters.length > 0 ? (
        <div className="space-y-4">
          {characters.map((character) => (
            <Link
              key={character.id}
              to={`/characters/${character.id}`}
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 text-lg">👤</span>
              </div>
              <div className="flex-grow">
                <h4 className="font-medium">{character.name}</h4>
                <p className="text-sm text-gray-600">{character.title}</p>
              </div>
              <div className="text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">لا توجد شخصيات مقترحة حالياً</p>
      )}
    </div>
  )
}

export default RecommendedCharacters
