import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progress, characters, stats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressChart from '../components/dashboard/ProgressChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import AchievementBadge from '../components/dashboard/AchievementBadge';
import DailyStreak from '../components/dashboard/DailyStreak';
import RecommendedCharacters from '../components/dashboard/RecommendedCharacters';

const Dashboard = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedCharacters, setRecommendedCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setError('يجب تسجيل الدخول للوصول إلى لوحة التحكم');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [
          progressResponse,
          statsResponse,
          recommendedResponse
        ] = await Promise.all([
          progress.getSummary(),
          stats.getStats(),
          characters.getAll({ limit: 6, recommended: true })
        ]);

        setProgressData(progressResponse.data);
        setUserStats(statsResponse.data);
        setRecommendedCharacters(recommendedResponse.data?.characters || []);
        setRecentActivity(progressResponse.data?.recent_activity || []);
      } catch (err) {
        setError('فشل في تحميل بيانات لوحة التحكم');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <Link 
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'القصص المقروءة',
      value: userStats?.stories_completed || 0,
      icon: 'book',
      color: 'blue',
      change: '+2 هذا الأسبوع'
    },
    {
      title: 'وقت القراءة',
      value: `${Math.floor((userStats?.total_time_spent || 0) / 60)} ساعة`,
      icon: 'clock',
      color: 'green',
      change: '+45 دقيقة هذا الأسبوع'
    },
    {
      title: 'سلسلة الأيام',
      value: `${userStats?.streak_days || 0} يوم`,
      icon: 'fire',
      color: 'orange',
      change: 'استمر في القراءة!'
    },
    {
      title: 'المحفوظات',
      value: userStats?.bookmarks_count || 0,
      icon: 'bookmark',
      color: 'purple',
      change: '+3 هذا الشهر'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                مرحباً بك، {user?.full_name || user?.username}
              </h1>
              <p className="text-gray-600 mt-2">
                تابع تقدمك في رحلتك لتعلم التاريخ الإسلامي
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DailyStreak streak={userStats?.streak_days || 0} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.icon === 'book' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    )}
                    {stat.icon === 'clock' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                    {stat.icon === 'fire' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    )}
                    {stat.icon === 'bookmark' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    )}
                  </svg>
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm">
                {stat.title}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                تقدمك هذا الشهر
              </h2>
              <ProgressChart data={progressData?.monthly_progress || []} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  النشاط الأخير
                </h2>
                <Link 
                  to="/progress"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  عرض الكل
                </Link>
              </div>
              <RecentActivity activities={recentActivity} />
            </div>

            {/* Recommended Characters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  موصى به لك
                </h2>
                <Link 
                  to="/characters"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  عرض الكل
                </Link>
              </div>
              <RecommendedCharacters characters={recommendedCharacters} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                الإنجازات
              </h2>
              <div className="space-y-4">
                <AchievementBadge
                  title="قارئ مبتدئ"
                  description="قراءة أول 5 قصص"
                  icon="star"
                  unlocked={userStats?.stories_completed >= 5}
                />
                <AchievementBadge
                  title="باحث عن المعرفة"
                  description="قراءة أول 20 قصة"
                  icon="book"
                  unlocked={userStats?.stories_completed >= 20}
                />
                <AchievementBadge
                  title="مثابر"
                  description="سلسلة 7 أيام"
                  icon="fire"
                  unlocked={userStats?.streak_days >= 7}
                />
                <AchievementBadge
                  title="قارئ متخصص"
                  description="قراءة أول 50 قصة"
                  icon="trophy"
                  unlocked={userStats?.stories_completed >= 50}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                إجراءات سريعة
              </h2>
              <div className="space-y-3">
                <Link
                  to="/characters"
                  className="block w-full text-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  استكشف شخصيات جديدة
                </Link>
                <Link
                  to="/categories"
                  className="block w-full text-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  تصفح حسب الفئة
                </Link>
                <Link
                  to="/timeline"
                  className="block w-full text-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  الخط الزمني
                </Link>
              </div>
            </div>

            {/* Daily Goal */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-sm p-6 text-white">
              <h2 className="text-xl font-bold mb-4">
                هدف اليوم
              </h2>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span>التقدم اليومي</span>
                  <span>{userStats?.daily_progress || 0}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${userStats?.daily_progress || 0}%` }}
                  />
                </div>
              </div>
              <p className="text-primary-100 text-sm">
                اقرأ قصة واحدة اليوم للحفاظ على سلسلتك!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;