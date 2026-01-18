import React from 'react'
import { Clock, Users, BookOpen, MapPin } from 'lucide-react'

const CharacterStats = ({ character }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md">
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
          <Users size={20} />
          <span className="text-sm">المتابعون</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {character.followers_count || 0}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md">
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
          <BookOpen size={20} />
          <span className="text-sm">القصص</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {character.stories_count || 0}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md">
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
          <Clock size={20} />
          <span className="text-sm">مدة القراءة</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {character.reading_time || '15 دقيقة'}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md">
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
          <MapPin size={20} />
          <span className="text-sm">المواقع</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {character.locations?.length || 0}
        </div>
      </div>
    </div>
  )
}

export default CharacterStats
