export const routes = {
  home: '/',
  characters: '/characters',
  characterDetail: '/characters/:id',
  categories: '/categories',
  timeline: '/timeline',
  dashboard: '/dashboard',
  about: '/about',
  login: '/login',
  register: '/register',
  profile: '/profile',
  settings: '/settings',
};

export const navigationLinks = [
  { path: routes.home, label: 'الرئيسية', icon: 'home' },
  { path: routes.characters, label: 'الشخصيات', icon: 'users' },
  { path: routes.categories, label: 'الفئات', icon: 'categories' },
  { path: routes.timeline, label: 'الخط الزمني', icon: 'timeline' },
  { path: routes.dashboard, label: 'لوحة التحكم', icon: 'dashboard' },
  { path: routes.about, label: 'حول', icon: 'info' },
];

export const getCharacterDetailPath = (id) => `/characters/${id}`;
export const getCategoryPath = (category) => `/categories?category=${category}`;