import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Clock, MapPin, ChevronRight, BookOpen, Users, Volume2 } from 'lucide-react'
import Lottie from 'lottie-react'
import api from '../services/api'
import AudioPlayer from '../components/AudioPlayer'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorDisplay from '../components/ErrorDisplay'
import ErrorBoundary from '../components/ErrorBoundary'
import CharacterHero from '../components/CharacterHero'
import CharacterActions from '../components/CharacterActions'
import CharacterTabs from '../components/CharacterTabs'
import CharacterStats from '../components/CharacterStats'
import CharacterTimeline from '../components/CharacterTimeline'
import { getErrorMessage } from '../utils/errorHandler'

const CharacterDetail = () => {
  const { id } = useParams()
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('story')
  const [bookmarked, setBookmarked] = useState(false)

  // Refs for request cancellation
  const abortControllerRef = useRef(null)

  useEffect(() => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    const controller = new AbortController()
    abortControllerRef.current = controller

    fetchCharacter(controller.signal)

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [id])

  const fetchCharacter = async (signal) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get(`/characters/${id}`, { signal })

      if (!response.data) {
        throw new Error('Character data is empty')
      }

      setCharacter(response.data)

      // Check if bookmarked
      const progressResponse = await api.get(`/progress/character/${id}`, { signal })
      setBookmarked(progressResponse.data?.bookmarked || false)

    } catch (err) {
      // Don't show error for cancelled requests
      if (err.name !== 'AbortError') {
        const errorMessage = getErrorMessage(err, 'فشل في تحميل بيانات الشخصية')
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async () => {
    try {
      const newBookmarkState = !bookmarked
      await api.put(`/progress/character/${id}`, { bookmarked: newBookmarkState })
      setBookmarked(newBookmarkState)
    } catch (err) {
      console.error('Error updating bookmark:', err)
      // Show user-friendly error message
      alert('فشل في تحديث الإشارة المرجعية. يرجى المحاولة مرة أخرى')
    }
  }

  const handleShare = () => {
    try {
      if (navigator.share && character) {
        navigator.share({
          title: `قصة ${character.name}`,
          text: character.description,
          url: window.location.href,
        })
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(window.location.href)
          .then(() => {
            alert('تم نسخ الرابط إلى الحافظة')
          })
          .catch(() => {
            alert('فشل في نسخ الرابط')
          })
      }
    } catch (err) {
      console.error('Error sharing:', err)
      alert('فشل في المشاركة')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />
  if (!character) return <ErrorDisplay error="الشخصية غير موجودة" />

  return (
    <ErrorBoundary>
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
        <CharacterHero character={character} />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Story Content */}
            <div className="lg:col-span-2">
              {/* Actions */}
              <CharacterActions
                bookmarked={bookmarked}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />

              {/* Tabs */}
              <CharacterTabs
                character={character}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

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

              {/* Audio Stories */}
              {character.audio_stories?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Volume2 />
                    <span>قصص صوتية</span>
                  </h3>
                  <div className="space-y-4">
                    {character.audio_stories.map((audio, idx) => (
                      <AudioPlayer key={idx} audioUrl={audio.url} title={audio.title} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Stats and Info */}
            <div className="space-y-6">
              {/* Character Stats */}
              <CharacterStats character={character} />

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
              {false && character.animations?.[0] && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">معاينة</h3>
                  <div className="aspect-square">
                    <Lottie
                      animationData={character.animations[0]}
                      loop={true}
                      autoplay={true}
                      className="w-full h-full"
                      rendererSettings={{
                        preserveAspectRatio: 'xMidYMid meet'
                      }}
                      onError={(error) => {
                        console.error('Lottie error:', error)
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default CharacterDetail