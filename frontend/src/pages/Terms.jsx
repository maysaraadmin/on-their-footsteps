import React from 'react'

const Terms = () => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">شروط الخدمة</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4 text-gray-600">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">قبول الشروط</h2>
          <p className="mb-4">
            باستخدامك لتطبيق "على خطاهم"، فإنك توافق على الالتزام بهذه الشروط والأحكام.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">وصف الخدمة</h2>
          <p className="mb-4">
            "على خطاهم" هو تطبيق تعليمي يهدف إلى توفير محتوى عن سير الصحابة والتابعين بطريقة تفاعلية ومبسطة.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">شروط الاستخدام</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>يجب أن تكون عمر 13 سنة على الأقل لاستخدام التطبيق</li>
            <li>يجب تقديم معلومات دقيقة وحديثة عند التسجيل</li>
            <li>يُحظر استخدام التطبيق لأي أغراض غير قانونية</li>
            <li>يُحظر نسخ أو توزيع المحتوى دون إذن كتابي</li>
            <li>يجب احترام المستخدمين الآخرين وعدم مضايقتهم</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">المحتوى</h2>
          <p className="mb-4">
            نقوم ببذل جهود معقولة لضمان دقة المحتوى التاريخي، ولكن لا نضمن خلو المحتوى من الأخطاء.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">حقوق الملكية الفكرية</h2>
          <p className="mb-4">
            جميع المحتوى في التطبيق محمي بحقوق الطبع والنشر. يظل المحتوى ملكاً لـ"على خطاهم" أو لمزودي المحتوى المعتمدين.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">الخصوصية</h2>
          <p className="mb-4">
            نلتزم بحماية خصوصيتك وفقاً لسياسة الخصوصية الخاصة بنا.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">المدفوعات</h2>
          <p className="mb-4">
            بعض الميزات في التطبيق قد تتطلب دفع رسوم. جميع المدفوعات غير قابلة للاسترداد إلا كما هو موضح في سياسة الإرجاع.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">تحديد المسؤولية</h2>
          <p className="mb-4">
            لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة تنشأ عن استخدامك للتطبيق.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">إنهاء الخدمة</h2>
          <p className="mb-4">
            نحتفظ بالحق في تعديل أو إيقاف الخدمة مؤقتاً أو دائماً دون إشعار مسبق.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">تغييرات الشروط</h2>
          <p className="mb-4">
            نحتفظ بالحق في تعديل هذه الشروط من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">قانون النطاق</h2>
          <p className="mb-4">
            تخضع هذه الشروط وتفسر بموجب قوانين المملكة العربية السعودية.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">اتصل بنا</h2>
          <p className="mb-4">
            إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا عبر:
            <br />
            البريد الإلكتروني: terms@ontheirfootsteps.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default Terms
