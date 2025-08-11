import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
	AddMealIngredientMutation,
	CreateIngredientMutation,
	CreateMealMutation,
	GetIngredientsQuery,
} from "@/types/mealPlanner";
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
	createMeal: CreateMealMutation;
	createIngredient?: CreateIngredientMutation;
	addMealIngredient?: AddMealIngredientMutation;
	getIngredients?: GetIngredientsQuery;
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
