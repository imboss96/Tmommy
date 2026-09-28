import React from 'react';

interface InfoPageProps {
  title: string;
  kicker: string;
  intro: string;
  items?: string[];
}

export const InfoPage: React.FC<InfoPageProps> = ({ title, kicker, intro, items = [] }) => {
  return (
    <main className="bg-[#FAF7F2] px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#E8DFD3] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#FAF0EB] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D96B43]">
          <span>{kicker}</span>
        </div>

        <h1 className="font-['Outfit'] text-3xl font-extrabold text-[#1A201C] sm:text-4xl">
          {title}
        </h1>

        <p className="mt-4 text-base leading-relaxed text-[#4A453F] sm:text-lg">
          {intro}
        </p>

        {items.length > 0 && (
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] px-4 py-3 text-sm leading-relaxed text-[#1A201C]"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
