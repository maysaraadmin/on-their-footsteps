import React from 'react';
import { Link } from 'react-router-dom';
import { navigationLinks } from '../routes';

const About = () => {
  const teamMembers = [
    {
      name: 'أحمد محمد',
      role: 'مؤسس ومطور رئيسي',
      description: 'مطور ويب متخصص في بناء المنصات التعليمية',
      image: null
    },
    {
      name: 'فاطمة علي',
      role: 'باحثة تاريخ إسلامي',
      description: 'متخصصة في التاريخ الإسلامي والسيرة النبوية',
      image: null
    },
    {
      name: 'عبدالله خالد',
      role: 'مصمم تجربة المستخدم',
      description: 'مصمم يركز على تسهيل تجربة التعلم الرقمي',
      image: null
    }
  ];

  const features = [
    {
      title: 'محتوى موثوق',
      description: 'جميع المحتويات مراجعة من قبل متخصصين في التاريخ الإسلامي',
      icon: 'shield-check'
    },
    {
      title: 'تعلم تفاعلي',
      description: 'تجربة تعليمية غنية بالوسائط المتعددة والتفاعلية',
      icon: 'sparkles'
    },
    {
      title: 'تتبع التقدم',
      description: 'تابع تقدمك التعليمي واحصل على إحصائيات مفصلة',
      icon: 'chart-line'
    },
    {
      title: 'وصول سهل',
      description: 'منصة متاحة من أي جهاز وفي أي وقت',
      icon: 'devices'
    }
  ];

  const stats = [
    { number: '500+', label: 'شخصية إسلامية' },
    { number: '50+', label: 'عصر تاريخي' },
    { number: '1000+', label: 'حدث تاريخي' },
    { number: '10K+', label: 'مستخدم نشط' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              عن منصة "على خطاهم"
            </h1>
            <p className="text-xl leading-relaxed text-primary-100">
              منصة تعليمية رائدة مخصصة لتعليم التاريخ الإسلامي بطريقة عصرية وممتعة.
              نهدف إلى ربط الأجيال بتاريخهم العظيم من خلال قصص وحياة أعظم الشخصيات الإسلامية.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                رسالتنا
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                نسعى لتقديم محتوى تاريخي إسلامي عالي الجودة بطريقة سهلة وممتعة،
                مما يساعد على فهم deeper للتاريخ الإسلامي واستخلاص الدروس والعبر منه.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                نؤمن بأهمية معرفة التاريخ كأساس لبناء المستقبل، ونعمل على جعل
                هذا التاريخ في متناول الجميع بغض النظر عن أعمارهم أو خلفياتهم.
              </p>
            </div>
            <div className="bg-primary-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-primary-900 mb-6">
                قيمنا
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900">الدقة والموثوقية</h4>
                    <p className="text-primary-700">نحرص على دقة المعلومات التاريخية ومراجعتها من قبل المتخصصين</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900">السهولة والوضوح</h4>
                    <p className="text-primary-700">نقدم المحتوى بطريقة مبسطة وسهلة الفهم للجميع</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900">الابتكار</h4>
                    <p className="text-primary-700">نستخدم أحدث التقنيات لتقديم تجربة تعليمية فريدة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ما يميزنا
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نقدم مجموعة من المميزات الفريدة التي تجعل تجربة التعلم ممتعة وفعالة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon === 'shield-check' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    )}
                    {feature.icon === 'sparkles' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    )}
                    {feature.icon === 'chart-line' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    )}
                    {feature.icon === 'devices' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    )}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-primary-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              فريق العمل
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              فريق من المتخصصين الملتزمين بتقديم أفضل محتوى تعليمي
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            انضم إلينا في رحلة التعلم
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            ابدأ الآن واستكشف عالم التاريخ الإسلامي الغني بالقصص والدروس والعبر
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/characters"
              className="inline-flex items-center px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              استكشف الشخصيات
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <Link 
              to="/dashboard"
              className="inline-flex items-center px-8 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              لوحة التحكم
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                تواصل معنا
              </h2>
              <p className="text-gray-600">
                نحن هنا للإجابة على استفساراتك ومساعدتك
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">البريد الإلكتروني</h3>
                <p className="text-gray-600">info@ontheirfootsteps.com</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">الدعم الفني</h3>
                <p className="text-gray-600">support@ontheirfootsteps.com</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">الأسئلة الشائعة</h3>
                <Link to="/faq" className="text-primary-600 hover:text-primary-700">
                  عرض الأسئلة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;