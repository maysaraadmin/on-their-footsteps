import React from 'react'
import { Link } from 'react-router-dom'

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/categories/${category.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 block"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
            <span className="text-2xl">{category.icon || '📚'}</span>
          </div>
          <div className="mr-4">
            <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
            <p className="text-gray-600 text-sm">{category.count || 0} شخصية</p>
          </div>
        </div>
        <p className="mt-4 text-gray-600">{category.description}</p>
      </div>
    </Link>
  )
}

export default CategoryCard
