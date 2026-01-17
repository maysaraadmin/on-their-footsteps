import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { characters } from '../services/api';
import HeroSection from '../components/common/HeroSection';
import CharacterCard from '../components/characters/CharacterCard';
import CategoryCard from '../components/common/CategoryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { navigationLinks } from '../routes';

const Home = () => {
  const [featuredCharacters, setFeaturedCharacters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [charactersResponse, categoriesResponse] = await Promise.all([
          characters.getAll({ limit: 6, featured: true }),
          characters.getCategories()
        ]);
        
        setFeaturedCharacters(charactersResponse.data || []);
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        setError('فشل في تحميل البيانات');
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Characters Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              شخصيات بارزة
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              تعرف على أشهر الشخصيات الإسلامية ودورها في تاريخنا العظيم
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCharacters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              to="/characters"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              عرض جميع الشخصيات
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              استكشف حسب الفئة
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              تصفح الشخصيات حسب فئاتها المختلفة من الأنبياء والصحابة والعلماء
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نقدم تجربة تعليمية غنية وممتعة لتعلم التاريخ الإسلامي
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">محتوى غني</h3>
              <p className="text-gray-600">
                قصص مفصلة ومدروسة عن الشخصيات الإسلامية مع مصادر موثوقة
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">تتبع التقدم</h3>
              <p className="text-gray-600">
                تابع تقدمك التعليمي واحصل على إحصائيات مفصلة عن رحلتك
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">تعلم يومي</h3>
              <p className="text-gray-600">
                دروس يومية منتظمة للبقاء على اتصال مع تاريخنا الإسلامي
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ابدأ رحلتك في عالم التاريخ الإسلامي
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            انضم إلينا اليوم واستكشف قصص وحياة أعظم الشخصيات في تاريخ الإسلام
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/characters"
              className="px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              استكشف الآن
            </Link>
            <Link 
              to="/about"
              className="px-8 py-3 bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-800 transition-colors"
            >
              اعرف المزيد
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;