import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';
import MemberCard from '../components/MemberCard';
import useSeo from '../hooks/useSeo';
import { TIERS } from '../services/leadsService';

const { FiCheckCircle, FiShield, FiArrowLeft, FiAlertCircle, FiLoader } = FiIcons;

const MembershipCardPage = () => {
  useSeo({
    path: '/membership-card',
    title: 'Your DoRight Membership Card',
    description: 'View and download your official DoRight Awareness Initiative virtual membership card.',
  });

  const [searchParams] = useSearchParams();
  const membershipIdParam = searchParams.get('id');
  const leadIdParam = searchParams.get('leadId');
  const emailParam = searchParams.get('email');

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMember();
  }, [membershipIdParam, leadIdParam, emailParam]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase.from('leads').select('*');

      if (membershipIdParam) {
        query = query.eq('membership_id', membershipIdParam.trim());
      } else if (leadIdParam) {
        query = query.eq('id', leadIdParam.trim());
      } else if (emailParam) {
        query = query.eq('email', emailParam.trim().toLowerCase());
      } else {
        // Sample demonstration mode if no params passed
        setMember({
          full_name: 'Jane Doe',
          membership_id: 'DRAI-2026-8841',
          tier: 'tier_1',
          source: 'website',
          created_at: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      const { data, error: fetchErr } = await query.maybeSingle();

      if (fetchErr) throw fetchErr;

      if (!data) {
        setError('No membership record found for the provided details.');
        setLoading(false);
        return;
      }

      // Generate signed URL if photo_url exists
      let signedUrl = null;
      if (data.photo_url) {
        try {
          const { data: signedData } = await supabase.storage
            .from('lead-photos')
            .createSignedUrl(data.photo_url, 3600);
          signedUrl = signedData?.signedUrl || null;
        } catch (e) {
          console.warn('Failed to load signed photo url', e);
        }
      }

      setMember({
        ...data,
        photo_url_signed: signedUrl
      });
    } catch (err) {
      console.error('Error loading member card:', err);
      setError('Could not load membership card details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tierConf = TIERS[member?.tier || 'tier_1'] || TIERS.tier_1;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            Back to DoRight Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <SafeIcon icon={FiShield} className="w-3.5 h-3.5" />
            Official Member Credential
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Virtual Membership Card
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Save or print your official DoRight Awareness Initiative membership card. Use your card for identification at community events and webinars.
          </p>
        </div>

        {/* Content Box */}
        {loading ? (
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-12 text-center flex flex-col items-center justify-center space-y-4">
            <SafeIcon icon={FiLoader} className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm text-slate-300">Retrieving your membership card...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-8 text-center space-y-4">
            <SafeIcon icon={FiAlertCircle} className="w-10 h-10 text-red-400 mx-auto" />
            <div className="text-lg font-bold text-red-200">{error}</div>
            <p className="text-xs text-red-300">
              Please check your confirmation email link or reach out to <a href="mailto:support@doright.ng" className="underline font-bold">support@doright.ng</a>.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* The Membership Card Render */}
            <div className="p-4 sm:p-8 bg-slate-800/60 border border-slate-700 rounded-3xl backdrop-blur shadow-2xl flex flex-col items-center">
              <MemberCard lead={member} />
            </div>

            {/* How to download & print instructions */}
            <div className="p-6 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <SafeIcon icon={FiShield} className="w-4 h-4" />
                How to Store & Print Your Advocate Card
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-white text-sm">1. Save to Device</div>
                  <p className="leading-relaxed text-slate-400">
                    Click <strong>Download Card</strong> to save a high-resolution PNG image directly to your phone gallery or mobile wallet.
                  </p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-white text-sm">2. Print Hard Copy</div>
                  <p className="leading-relaxed text-slate-400">
                    Click <strong>Print / PDF</strong> to print on cardstock or save as a printable PDF badge. Standard ID-1 card proportions.
                  </p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-white text-sm">3. 1-Year Validity</div>
                  <p className="leading-relaxed text-slate-400">
                    Your card is active and valid for 1 year. The embedded QR code enables instant physical & digital verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Member Details & Benefits summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Member Tier Card */}
              <div className="p-5 bg-slate-800/70 border border-slate-700 rounded-2xl space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Membership Tier</div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tierConf.color }} />
                  {tierConf.name}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tierConf.description}
                </p>
              </div>

              {/* Status Verification */}
              <div className="p-5 bg-slate-800/70 border border-slate-700 rounded-2xl space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Status</div>
                <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-emerald-400" />
                  Active & Verified
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your QR code directly links to our real-time verification registry for authenticity.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MembershipCardPage;
