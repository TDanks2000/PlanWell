import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthNavigatorProps {
	currentMonth: Date;
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
}

export function MonthNavigator({
	currentMonth,
	onPrev,
	onNext,
	onToday,
}: MonthNavigatorProps) {
	return (
		<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="font-medium text-sm">
				{currentMonth.toLocaleString(undefined, {
					month: "long",
					year: "numeric",
				})}
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					onClick={onPrev}
					aria-label="Previous month"
					title="Previous month"
				>
					<ChevronLeft className="h-4 w-4" aria-hidden="true" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={onNext}
					aria-label="Next month"
					title="Next month"
				>
					<ChevronRight className="h-4 w-4" aria-hidden="true" />
				</Button>
				<Button
					variant="outline"
					onClick={onToday}
					aria-label="Go to current month"
				>
					Today
				</Button>
			</div>
		</div>
	);
}

export default MonthNavigator;
