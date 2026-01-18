import React from 'react'
import { Bookmark, Share2 } from 'lucide-react'

const CharacterActions = ({ bookmarked, onBookmark, onShare }) => {
  return (
    <div className="flex flex-wrap gap-4">
      <button
        onClick={onBookmark}
        className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
          bookmarked
            ? 'bg-yellow-500 text-white'
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
      >
        <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
        <span>{bookmarked ? 'محفوظة' : 'حفظ'}</span>
      </button>

      <button
        onClick={onShare}
        className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
      >
        <Share2 size={20} />
        <span>مشاركة</span>
      </button>
    </div>
  )
}

export default CharacterActions
