import React from 'react';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight, FiMail, FiPhone, FiMapPin, FiUsers } from 'react-icons/fi';
import { usePageActions } from '../../pageActions';

// Copy around the signup form (the form itself is the modal on the Join page).
// Email/phone/address come from site_settings via the page actions; volunteer@ stays in code.
const JoinFormIntro = ({
  badge = 'Have Questions?',
  heading = 'Connect With Our Team',
  text = 'Want to learn more before applying or need assistance with your application? Reach out to us directly or visit our office.',
  emailHeading = 'Email Us',
  callHeading = 'Call Us',
  visitHeading = 'Visit Us',
  cardHeading = 'Ready to Make an Impact?',
  cardText = 'Fill out our brief form and our team will get back to you promptly.',
  cardButtonLabel = 'Open Application Form',
}) => {
  const { selectWay, contactSettings } = usePageActions();
  const settings = contactSettings || {};
  const phone = settings.contact_phone || '+234 912 339 9968';

  return (
    <section className="py-20 bg-white">
      <div className="max-w-container mx-auto px-5">
        <div className="bg-neutral-50 rounded-2xl p-8 sm:p-12 border border-neutral-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                {badge}
              </span>
              <h3 className="text-h2 font-heading font-bold text-neutral-900 mb-4">{heading}</h3>
              <p className="text-neutral-700 text-lg mb-6 leading-relaxed">{text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <SafeIcon icon={FiMail} className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-0.5">{emailHeading}</h4>
                    <p className="text-neutral-700 text-sm">{settings.contact_email || 'info@doright.ng'}</p>
                    <p className="text-neutral-700 text-sm">volunteer@doright.ng</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <SafeIcon icon={FiPhone} className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-0.5">{callHeading}</h4>
                    <p className="text-neutral-700 text-sm">
                      <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">
                        {phone}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start sm:col-span-2">
                  <SafeIcon icon={FiMapPin} className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-0.5">{visitHeading}</h4>
                    <p className="text-neutral-700 text-sm">
                      {settings.contact_address || '28b, Olaminuyun street, Parkview, Ikoyi, Lagos, Nigeria 101233'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-neutral-200 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <SafeIcon icon={FiUsers} className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-heading font-bold text-neutral-900 mb-2">{cardHeading}</h4>
              <p className="text-neutral-600 text-sm mb-6">{cardText}</p>
              <button
                onClick={() => selectWay('Volunteering')}
                className="w-full bg-primary text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center justify-center shadow-md hover:shadow-lg"
              >
                {cardButtonLabel}
                <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinFormIntro;
