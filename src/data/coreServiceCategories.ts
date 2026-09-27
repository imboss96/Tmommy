export type CoreServiceCategory = {
  id: string;
  title: string;
  description: string;
  action: string;
  href: string;
  image: string;
};

export const CORE_SERVICE_CATEGORY_STORAGE_KEY = 'mommycare_core_service_categories';

export const DEFAULT_CORE_SERVICE_CATEGORIES: CoreServiceCategory[] = [
  {
    id: 'nannies',
    title: 'Nannies and Caregivers',
    description: "Compassionate, trained caregivers providing safe, nurturing support for your children's growth.",
    action: 'Find a Nanny',
    image: '',
    href: '/nannies?role=nanny'
  },
  {
    id: 'house-girls',
    title: 'House Girls and Housekeepers',
    description: 'Reliable household professionals providing cleaning, laundry, organization, and daily home support.',
    action: 'Find a Housekeeper',
    image: '',
    href: '/nannies?role=house-girl'
  },
  {
    id: 'house-boys',
    title: 'House Boys and Domestic Stewards',
    description: 'Dependable domestic stewards supporting cleaning, errands, hospitality, maintenance, and household routines.',
    action: 'Find a House Boy',
    image: '',
    href: '/nannies?role=house-boy'
  },
  {
    id: 'caretakers',
    title: 'Compound Caretakers and Custodians',
    description: 'Vetted property custodians supporting gate access, compound upkeep, security routines, and maintenance.',
    action: 'Find a Caretaker',
    image: '',
    href: '/nannies?role=caretaker'
  },
  {
    id: 'gardeners',
    title: 'Gardeners and Groundskeepers',
    description: 'Experienced gardeners maintaining healthy, beautiful outdoor spaces through expert routine care.',
    action: 'Find a Gardener',
    image: '',
    href: '/nannies?role=shamba-boy'
  },
  {
    id: 'drivers',
    title: 'Home and Family Drivers',
    description: 'Professional drivers supporting safe school runs, family errands, appointments, and household logistics.',
    action: 'Find a Driver',
    image: '',
    href: '/nannies?role=home-driver'
  },
  {
    id: 'chefs',
    title: 'Private Chefs and Culinary Experts',
    description: "Skilled culinary experts crafting personalized meals tailored to your family's tastes daily.",
    action: 'Find a Chef',
    image: '',
    href: '/nannies?role=chef'
  },
  {
    id: 'house-managers',
    title: 'House Managers for Expatriates',
    description: 'House managers bring their expertise and passion to enhance home operations for busy families.',
    action: 'Find a House Manager',
    image: '',
    href: '/nannies?role=house-manager'
  }
];

export function getCoreServiceCategories(): CoreServiceCategory[] {
  if (typeof window === 'undefined') {
    return DEFAULT_CORE_SERVICE_CATEGORIES;
  }

  try {
    const raw = window.localStorage.getItem(CORE_SERVICE_CATEGORY_STORAGE_KEY);
    if (!raw) return DEFAULT_CORE_SERVICE_CATEGORIES;

    const parsed = JSON.parse(raw) as CoreServiceCategory[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CORE_SERVICE_CATEGORIES;

    return parsed.map((item, index) => ({
      ...DEFAULT_CORE_SERVICE_CATEGORIES[index % DEFAULT_CORE_SERVICE_CATEGORIES.length],
      ...item,
      id: item.id || DEFAULT_CORE_SERVICE_CATEGORIES[index % DEFAULT_CORE_SERVICE_CATEGORIES.length].id,
      image: typeof item.image === 'string' && item.image.trim().length > 0 && !item.image.startsWith('data:')
        ? item.image
        : DEFAULT_CORE_SERVICE_CATEGORIES[index % DEFAULT_CORE_SERVICE_CATEGORIES.length].image
    }));
  } catch (error) {
    console.warn('Could not read core service categories from localStorage.', error);
    return DEFAULT_CORE_SERVICE_CATEGORIES;
  }
}

export function saveCoreServiceCategories(categories: CoreServiceCategory[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CORE_SERVICE_CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}
