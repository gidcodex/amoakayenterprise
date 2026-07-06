import { Target } from "lucide-react";

export default function RevenueGoalCard({
  revenue = 0,
  currency = "$",
  monthlyGoal = 5000,
}) {
  const currentRevenue = Number(revenue || 0);
  const goal = Number(monthlyGoal || 5000);
  const percent = Math.min(Math.round((currentRevenue / goal) * 100), 100);

  return (
    <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-3xl shadow-xl shadow-green-200/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-100 text-sm font-semibold">
            Monthly Revenue Goal
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {currency}
            {currentRevenue.toFixed(2)}
          </h2>

          <p className="text-green-100 mt-1">
            of {currency}
            {goal.toFixed(2)}
          </p>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center">
          <Target size={32} />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span>{percent}% completed</span>
          <span>{100 - percent}% remaining</span>
        </div>

        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}