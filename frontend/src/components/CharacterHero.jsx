import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const CharacterHero = ({ character }) => {
  return (
    <div className="relative h-96 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={character.profile_image || '/images/default-character.jpg'}
          alt={character.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-white max-w-2xl"
        >
          {/* Verified Badge */}
          {character.is_verified && (
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1 bg-green-500 rounded-full">
                <Star size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">
                تمت المراجعة الشرعية
              </span>
            </div>
          )}

          {/* Name and Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4 font-arabic-heading">
            {character.arabic_name}
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {character.name}
          </h2>
          
          {/* Title and Era */}
          <div className="flex flex-wrap gap-4 mb-8">
            {character.title && (
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <span className="font-medium">{character.title}</span>
              </div>
            )}
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <span className="font-medium">{character.era}</span>
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <span className="font-medium">{character.category}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CharacterHero
