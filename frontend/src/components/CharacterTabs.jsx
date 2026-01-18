import React from 'react'
import { motion } from 'framer-motion'
import CharacterTimeline from './CharacterTimeline'
import { Star, BookOpen } from 'lucide-react'

const CharacterTabs = ({ character, activeTab, setActiveTab }) => {
  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
        {['story', 'timeline', 'achievements', 'lessons'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'story' && 'القصة'}
            {tab === 'timeline' && 'الخط الزمني'}
            {tab === 'achievements' && 'الإنجازات'}
            {tab === 'lessons' && 'الدروس'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        {activeTab === 'story' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none dark:prose-invert"
          >
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {character.full_story?.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <CharacterTimeline events={character.timeline_events} />
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {character.key_achievements?.map((achievement, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-green-100 dark:border-gray-600"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Star className="text-green-600 dark:text-green-300" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{achievement}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {character.lessons?.map((lesson, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-blue-100 dark:border-gray-600"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BookOpen className="text-blue-600 dark:text-blue-300" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{lesson}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default CharacterTabs
