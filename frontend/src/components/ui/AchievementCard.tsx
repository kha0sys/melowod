interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export function AchievementCard({ title, description, icon, unlockedAt }: AchievementCardProps) {
  return (
    <div 
      className={`p-4 rounded-lg border ${unlockedAt ? 'bg-background' : 'bg-secondary/50 opacity-50'}`}
      role="article"
      aria-label={`Logro: ${title}`}
    >
      <div className="text-4xl mb-2" aria-hidden="true">{icon}</div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
      {unlockedAt && (
        <p className="text-xs text-primary mt-2" aria-label={`Desbloqueado el ${unlockedAt.toLocaleDateString()}`}>
          Desbloqueado el {unlockedAt.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
