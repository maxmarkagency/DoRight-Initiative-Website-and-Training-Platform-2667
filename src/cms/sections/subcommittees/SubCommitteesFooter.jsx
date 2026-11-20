import React from 'react';

// Operational contact numbers are code constants, not page content.
const ADMIN_PHONE = { label: '+234 912 339 9968', href: 'tel:+2349123399968' };
const DIRECTOR_PHONE = { label: '+234 802 329 8260', href: 'tel:+2348023298260' };

const PhoneLink = ({ phone }) => (
  <a href={phone.href} className="text-amber-400 font-semibold underline">
    {phone.label}
  </a>
);

const SubCommitteesFooter = ({ heading, textBeforeAdmin, textBeforeDirector }) => (
  <section className="pt-12 sm:pt-16 pb-16 sm:pb-24 bg-slate-900">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
        <h3 className="text-lg sm:text-xl font-bold text-amber-400 font-heading">{heading}</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          {textBeforeAdmin} <PhoneLink phone={ADMIN_PHONE} /> {textBeforeDirector} <PhoneLink phone={DIRECTOR_PHONE} />.
        </p>
      </div>
    </div>
  </section>
);

export default SubCommitteesFooter;
