import { Plus } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MealEntry = {
	meal: {
		id: string;
		name: string;
		plannedDate?: string | Date | null;
		mealType?: string | null;
	};
};

interface CalendarGridProps {
	currentMonth: Date;
	meals: MealEntry[];
	onAddMealAtDate: (dateKey: string) => void;
}

function pad2(n: number) {
	return n < 10 ? `0${n}` : `${n}`;
}
function toLocalDateKey(date: Date) {
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
function parsePlannedDate(value: unknown): Date | null {
	if (!value) return null;
	if (value instanceof Date) return value;
	const parsed = new Date(String(value));
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function CalendarGrid({
	currentMonth,
	meals,
	onAddMealAtDate,
}: CalendarGridProps) {
	const firstDayOfMonth = new Date(
		currentMonth.getFullYear(),
		currentMonth.getMonth(),
		1,
	);
	const daysInMonth = new Date(
		currentMonth.getFullYear(),
		currentMonth.getMonth() + 1,
		0,
	).getDate();
	const startWeekday = firstDayOfMonth.getDay();

	const mealsByDate = new Map<string, MealEntry[]>();
	for (const entry of meals) {
		const d = parsePlannedDate(entry.meal.plannedDate);
		if (!d) continue;
		const key = toLocalDateKey(d);
		const list = mealsByDate.get(key) ?? [];
		list.push(entry);
		mealsByDate.set(key, list);
	}

	const todayKey = toLocalDateKey(new Date());
	const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const cells: React.ReactNode[] = [];
	for (let i = 0; i < startWeekday; i++) {
		cells.push(
			<div
				key={`empty-${i}`}
				className="h-28 rounded-md border border-muted bg-muted/20"
			/>,
		);
	}
	for (let day = 1; day <= daysInMonth; day++) {
		const dateObj = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth(),
			day,
		);
		const key = toLocalDateKey(dateObj);
		const dayMeals = mealsByDate.get(key) ?? [];
		const isToday = key === todayKey;
		cells.push(
			<div
				key={key}
				className={cn(
					"flex h-28 flex-col rounded-md border p-2 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:bg-accent hover:text-accent-foreground",
					isToday && "border-primary",
				)}
			>
				<div className="mb-2 flex items-center justify-between">
					<div
						className={cn(
							"text-sm",
							isToday ? "font-semibold text-primary" : "text-muted-foreground",
						)}
					>
						{day}
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={() => onAddMealAtDate(key)}
						title="Add meal to this day"
						aria-label={`Add meal on ${key}`}
					>
						<Plus className="h-3 w-3" aria-hidden="true" />
					</Button>
				</div>
				<div className="flex flex-1 flex-col gap-1 overflow-hidden">
					{dayMeals.length === 0 ? (
						<div className="text-muted-foreground text-xs">No meals</div>
					) : (
						dayMeals.slice(0, 3).map((m) => (
							<div
								key={m.meal.id}
								className="flex items-center justify-between rounded bg-muted px-2 py-1 text-xs"
							>
								<div className="truncate font-medium">{m.meal.name}</div>
								{m.meal.mealType && (
									<Badge
										className="ml-2 px-1 py-0 text-[10px]"
										variant="secondary"
									>
										{m.meal.mealType}
									</Badge>
								)}
							</div>
						))
					)}
					{dayMeals.length > 3 && (
						<div className="mt-auto text-[10px] text-muted-foreground">
							+{dayMeals.length - 3} more
						</div>
					)}
				</div>
			</div>,
		);
	}

	return (
		<div className="space-y-2">
			<div className="hidden grid-cols-7 gap-2 text-muted-foreground text-xs sm:grid">
				{weekdayLabels.map((w) => (
					<div key={w} className="px-2 py-1 text-center font-medium">
						{w}
					</div>
				))}
			</div>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-7">{cells}</div>
		</div>
	);
}

export default CalendarGrid;
