import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';
import useSeo from '../hooks/useSeo';
import { TIERS } from '../services/leadsService';

const { FiCheckCircle, FiShield, FiArrowLeft, FiAlertCircle, FiLoader, FiUser, FiCalendar } = FiIcons;

const VerifyMemberPage = () => {
  useSeo({
    path: '/verify-member',
    title: 'Verify Membership — DoRight Awareness Initiative',
    description: 'Real-time credential verification registry for DoRight Awareness Initiative members.',
  });

  const [searchParams] = useSearchParams();
  const membershipId = searchParams.get('id');

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!membershipId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    supabase
      .from('leads')
      .select('full_name, membership_id, tier, created_at, source')
      .eq('membership_id', membershipId.trim())
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setMember(data);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [membershipId]);

  const tierConf = TIERS[member?.tier || 'tier_1'] || TIERS.tier_1;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* DoRight Initiative Branding Header */}
        <div className="space-y-1">
          <div className="text-amber-400 font-extrabold text-sm uppercase tracking-wider">
            Doing Right Awareness Initiative
          </div>
          <div className="text-xs text-slate-400">
            Official Credential Verification Registry
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <SafeIcon icon={FiLoader} className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-slate-300">Verifying credential against registry...</p>
          </div>
        ) : notFound ? (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <SafeIcon icon={FiAlertCircle} className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-red-300">Invalid or Unverified ID</h2>
            <p className="text-xs text-slate-400">
              No active membership record was found matching ID: <span className="font-mono text-amber-400">{membershipId || 'N/A'}</span>.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Verified Green Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
              <SafeIcon icon={FiCheckCircle} className="w-9 h-9" />
            </div>

            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                VERIFIED ACTIVE MEMBER
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                {member.full_name}
              </h2>
              <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
                ID: {member.membership_id}
              </div>
            </div>

            {/* Credential Attributes */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/80 space-y-3 text-left text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <SafeIcon icon={FiShield} className="w-3.5 h-3.5 text-amber-400" />
                  Membership Level:
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${tierConf.badgeClass}`}>
                  {tierConf.label}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <SafeIcon icon={FiCalendar} className="w-3.5 h-3.5 text-blue-400" />
                  Registered Date:
                </span>
                <span className="text-white font-medium">
                  {new Date(member.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <SafeIcon icon={FiUser} className="w-3.5 h-3.5 text-emerald-400" />
                  Status:
                </span>
                <span className="text-emerald-400 font-bold">Good Standing</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="pt-2 border-t border-slate-700">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            Go to DoRight Initiative Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyMemberPage;
