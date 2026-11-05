export type AppRoute =
  | { page: 'home' }
  | { page: 'category'; categoryId: string; submenuId?: string }
  | { page: 'item'; itemId: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'admin' };

export function parseHash(hash: string): AppRoute {
  const clean = hash.replace(/^#\/?/, '');
  if (!clean) return { page: 'home' };

  const [path, queryString] = clean.split('?');
  const params = new URLSearchParams(queryString || '');
  const parts = path.split('/').filter(Boolean);

  if (parts[0] === 'category') {
    const categoryId = parts[1] || 'athletics';
    const submenuId = parts[2] || params.get('sub') || undefined;
    return { page: 'category', categoryId, submenuId };
  }

  if (parts[0] === 'item' && parts[1]) {
    return { page: 'item', itemId: parts[1] };
  }

  if (parts[0] === 'about') {
    return { page: 'about' };
  }

  if (parts[0] === 'contact') {
    return { page: 'contact' };
  }

  if (parts[0] === 'admin') {
    return { page: 'admin' };
  }

  return { page: 'home' };
}

export function routeToHash(route: AppRoute): string {
  switch (route.page) {
    case 'home':
      return '#/';
    case 'category':
      if (route.submenuId) {
        return `#/category/${route.categoryId}/${route.submenuId}`;
      }
      return `#/category/${route.categoryId}`;
    case 'item':
      return `#/item/${route.itemId}`;
    case 'about':
      return '#/about';
    case 'contact':
      return '#/contact';
    case 'admin':
      return '#/admin';
    default:
      return '#/';
  }
}

export function navigateTo(route: AppRoute) {
  const hash = routeToHash(route);
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}
