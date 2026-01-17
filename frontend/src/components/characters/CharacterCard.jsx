import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Heart, Play, Star } from 'lucide-react'

const CharacterCard = ({ character, index }) => {
  const categories = {
    'الأنبياء': 'bg-green-100 text-green-800',
    'الصحابة': 'bg-blue-100 text-blue-800',
    'التابعون': 'bg-purple-100 text-purple-800',
    'العلماء': 'bg-yellow-100 text-yellow-800',
    'النساء الصالحات': 'bg-pink-100 text-pink-800',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Featured Badge */}
      {character.is_featured && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-islamic-gold to-yellow-500 text-white px-3 py-1 rounded-full text-sm">
            <Star size={14} />
            <span>مميز</span>
          </div>
        </div>
      )}

      {/* Character Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={character.profile_image || '/images/default-character.jpg'}
          alt={character.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categories[character.category] || 'bg-gray-100 text-gray-800'}`}>
            {character.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Name and Title */}
        <div className="mb-4">
          <Link to={`/characters/${character.id}`}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
              {character.name}
            </h3>
          </Link>
          <p className="text-2xl font-arabic-heading text-islamic-gold mb-2">
            {character.arabic_name}
          </p>
          {character.title && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {character.title}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-6">
          {character.description}
        </p>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen size={16} />
              <span>{(character.views_count || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={16} />
              <span>{(character.likes_count || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              to={`/characters/${character.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Play size={18} />
              <span>ابدأ القصة</span>
            </Link>
          </div>
        </div>

        {/* Era Badge */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            العصر: <span className="font-medium">{character.era}</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default CharacterCard