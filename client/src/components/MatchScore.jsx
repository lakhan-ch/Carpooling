import { motion } from 'framer-motion';

export default function MatchScore({ score = 0, size = 'md' }) {
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#2563eb' : score >= 40 ? '#ca8a04' : '#dc2626';
  const label = score >= 80 ? 'Excellent match' : score >= 60 ? 'Good match' : score >= 40 ? 'Fair match' : 'Low match';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-700" style={{ color: 'var(--ink-60)', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
          Route match
        </span>
        <span className="text-xs font-800" style={{ color }}>
          {score}% · {label}
        </span>
      </div>
      <div className="match-track">
        <motion.div className="match-fill" style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
