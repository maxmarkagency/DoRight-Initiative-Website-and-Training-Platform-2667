import {
  FiUsers, FiTarget, FiTrendingUp, FiShield, FiHeart, FiAward, FiBookOpen, FiGlobe, FiStar, FiCheckCircle, FiEye, FiCalendar, FiZap,
} from 'react-icons/fi';

export const ICONS = {
  FiUsers, FiTarget, FiTrendingUp, FiShield, FiHeart, FiAward, FiBookOpen, FiGlobe, FiStar, FiCheckCircle, FiEye, FiCalendar, FiZap,
};

export const iconField = (label) => ({
  type: 'select',
  label,
  options: Object.keys(ICONS).map((key) => ({ label: key.slice(2), value: key })),
});
