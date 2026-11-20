import React from 'react';

// "+234 912 339 9968" -> "tel:+2349123399968"; anything that isn't a phone number gets no link.
const telHref = (phone) => {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  return /^\+?\d{6,15}$/.test(digits) ? `tel:${digits}` : null;
};

const PhoneLink = ({ phone }) => {
  const href = telHref(phone);
  return href ? (
    <a href={href} className="text-amber-400 font-semibold underline">
      {phone}
    </a>
  ) : (
    <span className="text-amber-400 font-semibold">{phone}</span>
  );
};

const SubCommitteesFooter = ({ heading, textBeforeAdmin, adminPhone, textBeforeDirector, directorPhone }) => (
  <section className="pb-16 sm:pb-24 bg-slate-900">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
        <h3 className="text-lg sm:text-xl font-bold text-amber-400 font-heading">{heading}</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          {textBeforeAdmin} <PhoneLink phone={adminPhone} /> {textBeforeDirector} <PhoneLink phone={directorPhone} />.
        </p>
      </div>
    </div>
  </section>
);

export default SubCommitteesFooter;
