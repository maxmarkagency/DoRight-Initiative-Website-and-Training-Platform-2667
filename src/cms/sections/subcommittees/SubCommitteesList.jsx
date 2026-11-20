import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { SUB_COMMITTEES_DATA } from '../../../pages/subCommitteesData';
import { mergeByKey } from '../../fields/fixedList';
import { usePageActions } from '../../pageActions';

const EDITABLE_FIELDS = ['name', 'shortName', 'description', 'responsibilities'];

// Ids, numbers, icons, colours and WhatsApp links come from code; stored content only supplies copy.
const SubCommitteesList = ({ committees, rolesHeading, requirementText, joinLabel, selectPrefix }) => {
  const { openCommittee } = usePageActions();
  const merged = mergeByKey(SUB_COMMITTEES_DATA, committees, 'id', EDITABLE_FIELDS);

  return (
    <section className="py-16 sm:py-24 bg-slate-900 [&:has(+section)]:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {merged.map((committee, idx) => {
          const IconComponent = committee.icon;
          return (
            <motion.div
              key={committee.id}
              id={committee.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-slate-800/90 rounded-3xl border border-slate-700/80 overflow-hidden shadow-2xl transition-all hover:border-slate-600 group"
            >
              {/* Committee Header Banner */}
              <div className="p-6 sm:p-8 border-b border-slate-700/70 bg-gradient-to-r from-slate-800 to-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md text-white"
                    style={{ backgroundColor: committee.accentColor }}
                  >
                    <SafeIcon icon={IconComponent} className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
                      Sub-Committee {committee.number}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                      {committee.name}
                    </h2>
                  </div>
                </div>

                {/* Join Sub-Committee Button */}
                <button
                  type="button"
                  onClick={() => openCommittee(committee)}
                  className="self-start md:self-center px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-400/20 active:scale-95 inline-flex items-center gap-2"
                >
                  <span>{joinLabel}</span>
                  <SafeIcon icon={FiArrowRight} className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Overview Description */}
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
                  {committee.description}
                </p>

                {/* Responsibilities Grid */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {rolesHeading}
                  </h3>
                  <div className="grid grid-cols-1 gap-3.5">
                    {committee.responsibilities.map((resp, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-start gap-3.5 hover:bg-slate-900/90 transition-colors"
                      >
                        <div className="mt-1 w-5 h-5 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                          <SafeIcon icon={FiCheck} className="w-3 h-3 text-amber-400 stroke-[3]" />
                        </div>
                        <div className="text-sm text-slate-300 leading-relaxed">
                          <strong className="text-white font-semibold">{resp.title}:</strong> {resp.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer for Mobile & Fast Access */}
                <div className="pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">{requirementText}</span>
                  <button
                    type="button"
                    onClick={() => openCommittee(committee)}
                    className="text-amber-400 hover:text-amber-300 font-bold text-sm inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>{selectPrefix} {committee.shortName}</span>
                    <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default SubCommitteesList;
