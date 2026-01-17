import React from 'react'

const Privacy = () => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">سياسة الخصوصية</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4 text-gray-600">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">مقدمة</h2>
          <p className="mb-4">
            في تطبيق "على خطاهم"، نحن نلتزم بحماية خصوصيتك. هذه السياسة توضح كيف نجمع ونستخدم ونحمي معلوماتك عند استخدامك لتطبيقنا.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">المعلومات التي نجمعها</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>المعلومات الشخصية: الاسم، البريد الإلكتروني عند التسجيل</li>
            <li>بيانات الاستخدام: الصفحات التي تزورها، الوقت الذي تقضيه في التطبيق</li>
            <li>بيانات التعلم: التقدم في الدروس، الشخصيات التي تدرسها</li>
            <li>بيانات الجهاز: نوع الجهاز، نظام التشغيل، معرف الجهاز الفريد</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">كيف نستخدم معلوماتك</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>توفير تجربة تعليمية مخصصة</li>
            <li>تتبع تقدمك التعليمي</li>
            <li>تحسين محتوى التطبيق ووظائفه</li>
            <li>التواصل معك حول التحديثات والميزات الجديدة</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">حماية البيانات</h2>
          <p className="mb-4">
            نستخدم تشفير SSL لنقل البيانات بشكل آمن. يتم تخزين بياناتك على خوادم آمنة ومحمية بجدار حماية.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">حقوقك</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>الحق في الوصول إلى بياناتك</li>
            <li>الحق في تصحيح بياناتك</li>
            <li>الحق في حذف حسابك وبياناتك</li>
            <li>الحق في إلغاء الاشتراك في الرسائل التسويقية</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">ملفات تعريف الارتباط (Cookies)</h2>
          <p className="mb-4">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر تفضيلاتك. يمكنك تعطيل ملفات تعريف الارتباط في إعدادات المتصفح.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">التغييرات على هذه السياسة</h2>
          <p className="mb-4">
            قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم إعلامك بأي تغييرات مهمة عبر التطبيق أو البريد الإلكتروني.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">اتصل بنا</h2>
          <p className="mb-4">
            إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:
            <br />
            البريد الإلكتروني: privacy@ontheirfootsteps.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default Privacy
