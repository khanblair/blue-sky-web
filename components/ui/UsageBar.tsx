"use client";

export function UsageBar({
    label,
    current,
    limit,
    unit = "",
    className = "",
}: {
    label: string;
    current: number;
    limit: number;
    unit?: string;
    className?: string;
}) {
    const isUnlimited = limit === Infinity;
    const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
    const isNearLimit = !isUnlimited && percentage >= 80;
    const isAtLimit = !isUnlimited && percentage >= 100;

    const barColor = isAtLimit
        ? "bg-danger"
        : isNearLimit
            ? "bg-warning"
            : "bg-primary";

    const textColor = isAtLimit
        ? "text-danger"
        : isNearLimit
            ? "text-warning"
            : "text-default-400";

    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-default-400">{label}</p>
                <p className={`text-[10px] font-bold ${textColor}`}>
                    {current}{unit} / {isUnlimited ? "∞" : `${limit}${unit}`}
                </p>
            </div>
            <div className="w-full h-1.5 bg-default-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${isUnlimited ? 8 : Math.min(percentage, 100)}%` }}
                />
            </div>
            {isAtLimit && (
                <p className="text-[9px] font-bold text-danger uppercase tracking-widest">
                    Limit reached — upgrade for more
                </p>
            )}
        </div>
    );
}