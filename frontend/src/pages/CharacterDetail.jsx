import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  Bookmark,
  Share2,
  Volume2,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  BookOpen,
  Users
} from 'lucide-react'
import Lottie from 'lottie-react'
import api from '../services/api'
import CharacterTimeline from '../components/CharacterTimeline'
import AudioPlayer from '../components/AudioPlayer'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorDisplay from '../components/ErrorDisplay'

const CharacterDetail = () => {
  const { id } = useParams()
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('story')
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetchCharacter()
  }, [id])

  const fetchCharacter = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/characters/${id}`)
      setCharacter(response.data)
      
      // Check if bookmarked
      const progressResponse = await api.get(`/progress/${id}`)
      setBookmarked(progressResponse.data?.bookmarked || false)
    } catch (err) {
      setError('فشل في تحميل بيانات الشخصية')
      console.error('Error fetching character:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async () => {
    try {
      await api.put(`/progress/${id}`, { bookmarked: !bookmarked })
      setBookmarked(!bookmarked)
    } catch (err) {
      console.error('Error updating bookmark:', err)
    }
  }

  const handleShare = () => {
    if (navigator.share && character) {
      navigator.share({
        title: `قصة ${character.name}`,
        text: character.description,
        url: window.location.href,
      })
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay message={error} />
  if (!character) return <ErrorDisplay message="الشخصية غير موجودة" />

  return (
    <>
      <Helmet>
        <title>{character.name} - على خطاهم</title>
        <meta name="description" content={character.description} />
        <meta property="og:title" content={character.name} />
        <meta property="og:description" content={character.description} />
        {character.profile_image && (
          <meta property="og:image" content={character.profile_image} />
        )}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
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

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleBookmark}
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
                  onClick={handleShare}
                  className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <Share2 size={20} />
                  <span>مشاركة</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Story Content */}
            <div className="lg:col-span-2">
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

              {/* Audio Stories */}
              {character.audio_stories?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Volume2 />
                    <span>القصص الصوتية</span>
                  </h3>
                  <div className="space-y-4">
                    {character.audio_stories.map((audio, idx) => (
                      <AudioPlayer
                        key={idx}
                        title={`الجزء ${idx + 1}`}
                        url={audio}
                        duration="15:30"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Facts */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">معلومات سريعة</h3>
                <div className="space-y-4">
                  {character.birth_year && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock size={18} />
                        <span>سنة الميلاد</span>
                      </div>
                      <span className="font-medium">{character.birth_year} م</span>
                    </div>
                  )}

                  {character.birth_place && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin size={18} />
                        <span>مكان الميلاد</span>
                      </div>
                      <span className="font-medium">{character.birth_place}</span>
                    </div>
                  )}

                  {character.death_year && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock size={18} />
                        <span>سنة الوفاة</span>
                      </div>
                      <span className="font-medium">{character.death_year} م</span>
                    </div>
                  )}

                  {character.death_place && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin size={18} />
                        <span>مكان الوفاة</span>
                      </div>
                      <span className="font-medium">{character.death_place}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4">الإحصائيات</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen size={18} />
                      <span>عدد المشاهدات</span>
                    </div>
                    <span className="font-bold text-2xl">
                      {character.views_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={18} />
                      <span>عدد المعجبين</span>
                    </div>
                    <span className="font-bold text-2xl">
                      {character.likes_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Characters */}
              {character.related_characters?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">شخصيات ذات صلة</h3>
                  <div className="space-y-3">
                    {character.related_characters.slice(0, 5).map((relatedId) => (
                      <div
                        key={relatedId}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
                          <div>
                            <p className="font-medium">اسم الشخصية</p>
                            <p className="text-sm text-gray-500">الصحابة</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Animation Preview */}
              {character.animations?.[0] && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">معاينة</h3>
                  <div className="aspect-square">
                    <Lottie
                      animationData={character.animations[0]}
                      loop={true}
                      autoplay={true}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CharacterDetail