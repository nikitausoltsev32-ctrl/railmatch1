/**
 * Score Gauge Component
 * Displays a visual representation of match score (0-100)
 */

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
  // Determine color based on score
  let bgColor = 'bg-red-500';
  let textColor = 'text-red-600';

  if (score >= 80) {
    bgColor = 'bg-green-500';
    textColor = 'text-green-600';
  } else if (score >= 60) {
    bgColor = 'bg-yellow-500';
    textColor = 'text-yellow-600';
  } else if (score >= 40) {
    bgColor = 'bg-orange-500';
    textColor = 'text-orange-600';
  }

  // Determine size
  let containerSize = 'w-20 h-20';
  let fontSize = 'text-xl';
  let labelSize = 'text-xs';

  if (size === 'sm') {
    containerSize = 'w-16 h-16';
    fontSize = 'text-lg';
    labelSize = 'text-xs';
  } else if (size === 'lg') {
    containerSize = 'w-28 h-28';
    fontSize = 'text-3xl';
    labelSize = 'text-sm';
  }

  return (
    <div className={`relative ${containerSize} flex items-center justify-center`}>
      {/* Background circle */}
      <div className={`absolute inset-0 rounded-full bg-neutral-200`} />

      {/* Progress circle (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full transform -rotate-90"
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))' }}
      >
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-neutral-200"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className={bgColor}
          strokeDasharray={`${(score / 100) * 2 * Math.PI * 45} ${2 * Math.PI * 45}`}
          strokeLinecap="round"
        />
      </svg>

      {/* Score text */}
      <div className="relative flex flex-col items-center justify-center">
        <div className={`${fontSize} font-bold ${textColor}`}>{Math.round(score)}</div>
        <div className={`${labelSize} text-neutral-600 font-medium`}>/ 100</div>
      </div>
    </div>
  );
}
