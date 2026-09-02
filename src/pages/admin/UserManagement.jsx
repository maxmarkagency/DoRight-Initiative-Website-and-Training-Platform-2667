import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import MemberAvatar from '../../common/MemberAvatar';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiSearch, FiFilter, FiPlus, FiMoreVertical, FiUserCheck, FiMail, FiPhone } = FiIcons;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First try fetching from leads (members)
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) {
        console.warn('Error fetching leads for user management:', leadsError);
      }

      // Try fetching from users table if present
      let usersData = [];
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data) {
          usersData = data;
        }
      } catch (e) {
        // Optional
      }

      // Merge / format list
      const combined = (leadsData || []).map((lead) => ({
        id: lead.id,
        name: lead.full_name || 'Member',
        email: lead.email || '',
        phone: lead.phone || '',
        role: lead.tier === 'tier_3' ? 'Strategic Leader' : lead.tier === 'tier_2' ? 'Movement Champion' : 'Advocate',
        status: lead.status || 'active',
        created_at: lead.created_at,
        photo_url: lead.photo_url,
        membership_id: lead.membership_id,
        lead: lead,
      }));

      setUsers(combined);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchTerm === '' ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.membership_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role?.toLowerCase().includes(roleFilter.toLowerCase());

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const getRoleBadge = (role = '') => {
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
    if (r.includes('strategic') || r.includes('leader')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    if (r.includes('champion')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">User &amp; Member Directory</h1>
          <p className="text-sm text-gray-500 mt-1">View registered platform users, advocates, and members.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:max-w-sm">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiFilter} className="w-4 h-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-neutral-50 dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">All Roles &amp; Tiers</option>
                <option value="advocate">Advocates</option>
                <option value="champion">Movement Champions</option>
                <option value="leader">Strategic Leaders</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="font-medium text-gray-700 dark:text-gray-300">No users found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 dark:bg-gray-700/50 text-neutral-500 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                      <th className="p-4">Member / User</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Role / Tier</th>
                      <th className="p-4">Membership ID</th>
                      <th className="p-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-gray-700">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-4 font-medium text-neutral-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <MemberAvatar
                              lead={u.lead}
                              name={u.name}
                              size="md"
                              className="ring-2 ring-gray-100 dark:ring-gray-700"
                            />
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-600 dark:text-gray-300">
                          <div className="space-y-0.5 text-xs">
                            <div className="font-medium text-gray-900 dark:text-gray-200">{u.email}</div>
                            <div className="text-gray-500">{u.phone || 'No phone'}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${getRoleBadge(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs font-bold text-amber-500">
                          {u.membership_id || 'ID Pending'}
                        </td>
                        <td className="p-4 text-neutral-600 dark:text-gray-400 text-xs">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="bg-neutral-50 dark:bg-gray-700/60 rounded-xl p-4 border border-neutral-200 dark:border-gray-600 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <MemberAvatar lead={u.lead} name={u.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{u.name}</div>
                        <div className="text-xs text-gray-500 truncate">{u.email}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 dark:border-gray-600 pt-2 font-mono">
                      <span>ID: {u.membership_id || 'Pending'}</span>
                      <span>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserManagement;