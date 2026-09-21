import React from 'react';
import {
  ArrowRight,
  Baby,
  Car,
  ChefHat,
  Home,
  Leaf,
  Sparkles,
  UserCheck,
  Wrench
} from 'lucide-react';

const serviceCategories = [
  {
    title: 'Nannies and Caregivers',
    description: "Compassionate, trained caregivers providing safe, nurturing support for your children's growth.",
    action: 'Find a Nanny',
    icon: Baby,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=900&auto=format&fit=crop',
    href: '/nannies?role=nanny'
  },
  {
    title: 'House Girls and Housekeepers',
    description: 'Reliable household professionals providing cleaning, laundry, organization, and daily home support.',
    action: 'Find a Housekeeper',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=900&auto=format&fit=crop',
    href: '/nannies?role=house-girl'
  },
  {
    title: 'House Boys and Domestic Stewards',
    description: 'Dependable domestic stewards supporting cleaning, errands, hospitality, maintenance, and household routines.',
    action: 'Find a House Boy',
    icon: UserCheck,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=900&auto=format&fit=crop',
    href: '/nannies?role=house-boy'
  },
  {
    title: 'Compound Caretakers and Custodians',
    description: 'Vetted property custodians supporting gate access, compound upkeep, security routines, and maintenance.',
    action: 'Find a Caretaker',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop',
    href: '/nannies?role=caretaker'
  },
  {
    title: 'Gardeners and Groundskeepers',
    description: 'Experienced gardeners maintaining healthy, beautiful outdoor spaces through expert routine care.',
    action: 'Find a Gardener',
    icon: Leaf,
    image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=900&auto=format&fit=crop',
    href: '/nannies?role=shamba-boy'
  },
  {
    title: 'Home and Family Drivers',
    description: 'Professional drivers supporting safe school runs, family errands, appointments, and household logistics.',
    action: 'Find a Driver',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=900&auto=format&fit=crop',
    href: '/nannies?role=home-driver'
  },
  {
    title: 'Private Chefs and Culinary Experts',
    description: "Skilled culinary experts crafting personalized meals tailored to your family's tastes daily.",
    action: 'Find a Chef',
    icon: ChefHat,
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=900&auto=format&fit=crop',
    href: '/nannies?role=chef'
  },
  {
    title: 'House Managers for Expatriates',
    description: 'House managers bring their expertise and passion to enhance home operations for busy families.',
    action: 'Find a House Manager',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=900&auto=format&fit=crop',
    href: '/nannies?role=house-manager'
  }
];

export const CoreServiceCategories: React.FC = () => {
  return (
    <section className="border-b border-[#E8DFD3] bg-[#FCFAF7] py-12 sm:py-16" aria-labelledby="core-services-title">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mx-auto mb-3 flex max-w-xs items-center gap-3 text-[#B82958]" aria-hidden="true">
            <span className="h-px flex-1 bg-[#B82958]/50" />
            <span className="text-sm">✦</span>
            <span className="h-px flex-1 bg-[#B82958]/50" />
          </div>
          <h2 id="core-services-title" className="font-['Outfit'] text-2xl font-extrabold uppercase tracking-wide text-[#31513E] sm:text-3xl">
            Core Service Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.map(({ title, description, action, icon: Icon, image, href }) => (
            <article key={title} className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E8DFD3] bg-white shadow-sm transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F2EDE4]">
                <img src={image} alt={`${title} in Nairobi`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute left-3 top-3 rounded-full bg-white/95 p-2 text-[#B82958] shadow-sm">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-['Outfit'] text-base font-bold text-[#B82958]">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#635E59]">{description}</p>
                <a href={href} className="mt-4 inline-flex w-fit items-center gap-1 rounded-md bg-[#B82958] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#922044]">
                  {action}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
