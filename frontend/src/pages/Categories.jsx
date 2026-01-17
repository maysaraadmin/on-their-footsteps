import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { characters } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CategoryCard from '../components/common/CategoryCard';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [charactersByCategory, setCharactersByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryInfo = {
    'نبي': {
      description: 'أنبياء الله ورسله الذين أرسلوا لهداية البشرية',
      color: 'emerald',
      icon: 'star',
      count: 0
    },
    'صحابي': {
      description: 'أصحاب رسول الله صلى الله عليه وسلم الذين رافقوه ونصروا الإسلام',
      color: 'blue',
      icon: 'users',
      count: 0
    },
    'تابعي': {
      description: 'الذين لقوا الصحابة وآمنوا بالإسلام',
      color: 'purple',
      icon: 'user-check',
      count: 0
    },
    'عالم': {
      description: 'علماء المسلمين الذين خدموا الإسلام بالعلم والمعرفة',
      color: 'amber',
      icon: 'book',
      count: 0
    },
    'خليفة': {
      description: 'خلفاء المسلمين الذين حكموا بالعدل والإسلام',
      color: 'red',
      icon: 'crown',
      count: 0
    },
    'قائد': {
      description: 'قادة المسلمين العسكريون الذين نصروا الإسلام',
      color: 'green',
      icon: 'shield',
      count: 0
    },
    'فقيه': {
      description: 'فقهاء المسلمين الذين فقهوا في دين الله',
      color: 'indigo',
      icon: 'scale',
      count: 0
    },
    'محدث': {
      description: 'علماء الحديث الذين حفظوا سنة رسول الله',
      color: 'teal',
      icon: 'scroll',
      count: 0
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await characters.getCategories();
        const categoriesData = categoriesResponse.data || [];
        
        // Fetch character counts for each category
        const categoryCounts = {};
        const charactersData = {};
        
        for (const category of categoriesData) {
          try {
            const charactersResponse = await characters.getAll({ 
              category: category.name, 
              limit: 6 
            });
            categoryCounts[category.name] = charactersResponse.data?.total || 0;
            charactersData[category.name] = charactersResponse.data?.characters || [];
          } catch (err) {
            categoryCounts[category.name] = 0;
            charactersData[category.name] = [];
          }
        }
        
        // Merge category info with API data
        const mergedCategories = categoriesData.map(cat => ({
          ...cat,
          ...categoryInfo[cat.name],
          count: categoryCounts[cat.name] || 0
        }));
        
        setCategories(mergedCategories);
        setCharactersByCategory(charactersData);
      } catch (err) {
        setError('فشل في تحميل الفئات');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName === selectedCategory ? '' : categoryName);
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              فئات الشخصيات الإسلامية
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              استكشف الشخصيات الإسلامية حسب فئاتها وتعرف على دور كل فئة في تاريخ الإسلام
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id || category.name} className="space-y-4">
              <CategoryCard 
                category={category}
                onClick={() => handleCategorySelect(category.name)}
                isSelected={selectedCategory === category.name}
              />
              
              {/* Show sample characters when category is selected */}
              {selectedCategory === category.name && charactersByCategory[category.name]?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    نماذج من {category.arabic_name || category.name}
                  </h4>
                  <div className="space-y-2">
                    {charactersByCategory[category.name].slice(0, 3).map((character) => (
                      <Link
                        key={character.id}
                        to={`/characters/${character.id}`}
                        className="block p-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {character.profile_image ? (
                            <img
                              src={character.profile_image}
                              alt={character.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {character.name}
                            </p>
                            {character.title && (
                              <p className="text-xs text-gray-500 truncate">
                                {character.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link
                    to={`/characters?category=${category.name}`}
                    className="block w-full mt-3 text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    عرض الكل ({category.count})
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            إحصائيات الفئات
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <div key={category.id || category.name} className="text-center">
                <div className={`w-16 h-16 bg-${category.color}-100 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <svg className={`w-8 h-8 text-${category.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {category.icon === 'star' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    )}
                    {category.icon === 'users' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    )}
                    {category.icon === 'book' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    )}
                    {category.icon === 'crown' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    )}
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {category.arabic_name || category.name}
                </h3>
                <p className="text-2xl font-bold text-gray-700">
                  {category.count}
                </p>
                <p className="text-sm text-gray-500">
                  شخصية
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Content */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              كيف تستخدم الفئات؟
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-sm font-semibold">1</span>
                </div>
                <p>
                  اختر الفئة التي تهمك للتركيز على نوع معين من الشخصيات
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-sm font-semibold">2</span>
                </div>
                <p>
                  استعرض الشخصيات في كل فئة مع معلومات أساسية عن كل شخصية
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-sm font-semibold">3</span>
                </div>
                <p>
                  انقر على أي شخصية لقراءة قصتها الكاملة والتعرف على إنجازاتها
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              نصيحة للتعلم
            </h3>
            <p className="text-gray-700 mb-4">
              نوصي بالبدء بالأنبياء والرسل لفهم أسس الإسلام، ثم الانتقال إلى الصحابة 
              لمعرفة كيفية تطبيق الإسلام في الحياة، وبعدها استكشف العلماء والقادة 
              للتعرف على تطور الحضارة الإسلامية.
            </p>
            <Link
              to="/timeline"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              استكشف الخط الزمني
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;