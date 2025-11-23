// components/StatsCard.jsx
'use client';

/**
 * Reusable stats card component for displaying metrics
 * @param {object} props
 * @param {object} props.stat - Stat configuration object
 * @param {string} props.stat.label - Stat label
 * @param {string|number} props.stat.value - Main stat value
 * @param {string} [props.stat.subValue] - Optional secondary value
 * @param {React.Component} props.stat.icon - Lucide icon component
 * @param {string} props.stat.bgColor - Background color class for icon container
 * @param {string} props.stat.iconColor - Icon color class
 * @param {boolean} [props.darkMode] - Dark mode flag
 * @param {Function} [props.onClick] - Optional click handler
 */
export default function StatsCard({ stat, darkMode = false, onClick }) {
  const Icon = stat.icon;
  
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl p-6 border-2 transition-all duration-300 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${
        darkMode
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg'
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg'
      }`}
    >
      {/* Large background icon */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <Icon className={`w-full h-full ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon container */}
        <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2} />
        </div>
        
        {/* Label */}
        <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {stat.label}
        </p>
        
        {/* Main value */}
        <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {stat.value}
        </p>
        
        {/* Optional sub-value */}
        {stat.subValue && (
          <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {stat.subValue}
          </p>
        )}
      </div>
    </div>
  );
}