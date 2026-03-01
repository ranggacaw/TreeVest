interface Props {
  status: 'healthy' | 'attention' | 'warning' | 'critical' | 'unknown';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function HealthStatusIndicator({ status, showLabel = true, size = 'md' }: Props) {
  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          color: 'bg-green-500',
          bgColor: 'bg-green-50',
          label: 'Healthy',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'attention':
        return {
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          label: 'Needs Attention',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'warning':
        return {
          color: 'bg-orange-500',
          bgColor: 'bg-orange-50',
          label: 'Warning',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'critical':
        return {
          color: 'bg-red-500',
          bgColor: 'bg-red-50',
          label: 'Critical',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        };
      default:
        return {
          color: 'bg-gray-400',
          bgColor: 'bg-gray-50',
          label: 'Unknown',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          ),
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${config.bgColor} px-3 py-1.5 rounded-full`}>
      <span className={`${config.color} text-white rounded-full p-1 ${sizeClasses[size]}`}>
        {config.icon}
      </span>
      {showLabel && (
        <span className={`font-medium text-${status === 'unknown' ? 'gray' : status === 'healthy' ? 'green' : status === 'critical' ? 'red' : 'yellow'}-700`}>
          {config.label}
        </span>
      )}
    </div>
  );
}
