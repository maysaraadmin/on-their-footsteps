import React from 'react'

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-600 text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">حدث خطأ ما</h3>
      <p className="text-red-600 mb-4">
        {error?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  )
}

export default ErrorDisplay
