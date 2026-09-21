import React, { useMemo } from 'react';
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
import { DEFAULT_CORE_SERVICE_CATEGORIES, getCoreServiceCategories } from '../data/coreServiceCategories';

const iconMap = {
  nannies: Baby,
  'house-girls': Sparkles,
  'house-boys': UserCheck,
  caretakers: Wrench,
  gardeners: Leaf,
  drivers: Car,
  chefs: ChefHat,
  'house-managers': Home
} as const;

export const CoreServiceCategories: React.FC = () => {
  const serviceCategories = useMemo(() => {
    const saved = getCoreServiceCategories();
    return saved.map((category) => ({
      ...category,
      icon: iconMap[category.id as keyof typeof iconMap] || Home
    }));
  }, []);

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
                <img src={image} alt={`${title} in Nairobi`} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" />
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
