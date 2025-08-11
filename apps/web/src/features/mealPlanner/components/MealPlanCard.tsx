import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddMealDialog from "./AddMealDialog";
import CalendarGrid, { type MealEntry } from "./CalendarGrid";
import MonthNavigator from "./MonthNavigator";

interface MealPlanCardProps {
	title: string;
	meals: MealEntry[];
	currentMonth: Date;
	onPrevMonth: () => void;
	onNextMonth: () => void;
	onToday: () => void;
	onAddMealAtDate: (dateKey: string) => void;
	activePlanId: string | null;
	createMeal: {
		isPending: boolean;
		mutateAsync: (args: {
			mealPlanId: string;
			name: string;
			plannedDate?: string;
			mealType?: "breakfast" | "lunch" | "dinner" | "snack";
		}) => Promise<unknown>;
	};
	createIngredient?: {
		isPending: boolean;
		mutateAsync: (args: {
			name: string;
			description?: string;
			category?: string;
			unit?: string;
			caloriesPerUnit?: number;
			proteinPerUnit?: number;
			carbsPerUnit?: number;
			fatPerUnit?: number;
		}) => Promise<any>;
	};
	addMealIngredient?: {
		isPending: boolean;
		mutateAsync: (args: {
			mealId: string;
			ingredientId: string;
			quantity: number;
			unit?: string;
			notes?: string;
		}) => Promise<unknown>;
	};
	getIngredients?: {
		data?: {
			ingredient: any;
			creator: { id: string; name: string; image?: string };
		}[];
		isLoading: boolean;
	};
	addMealOpen: boolean;
	setAddMealOpen: (open: boolean) => void;
	defaultAddDate?: string;
}

export function MealPlanCard({
	title,
	meals,
	currentMonth,
	onPrevMonth,
	onNextMonth,
	onToday,
	onAddMealAtDate,
	activePlanId,
	createMeal,
	createIngredient,
	addMealIngredient,
	getIngredients,
	addMealOpen,
	setAddMealOpen,
	defaultAddDate,
}: MealPlanCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<CardTitle className="font-semibold text-lg">{title}</CardTitle>
				<AddMealDialog
					activePlanId={activePlanId}
					createMeal={createMeal}
					createIngredient={createIngredient}
					addMealIngredient={addMealIngredient}
					getIngredients={getIngredients}
					open={addMealOpen}
					onOpenChange={setAddMealOpen}
					defaultDate={defaultAddDate}
				/>
			</CardHeader>
			<CardContent>
				<MonthNavigator
					currentMonth={currentMonth}
					onPrev={onPrevMonth}
					onNext={onNextMonth}
					onToday={onToday}
				/>
				<CalendarGrid
					currentMonth={currentMonth}
					meals={meals}
					onAddMealAtDate={onAddMealAtDate}
				/>
			</CardContent>
		</Card>
	);
}

export default MealPlanCard;
