import { useState } from "react";
import Loader from "@/components/loader";
import { useGroupMealPlan, useMealPlanner } from "../hooks/useMealPlanner";
import { CreateMealPlanDialog } from "./CreateMealPlanDialog";
import { EmptyStateCard } from "./EmptyStateCard";
import { ErrorCard } from "./Errors";
import { Header } from "./Header";
import { MealPlanCard } from "./MealPlanCard";

interface MealPlannerPageProps {
	groupId: string;
}

export function MealPlannerPage({ groupId }: MealPlannerPageProps) {
	const {
		mealPlans,
		createMealPlan,
		createMeal,
		createIngredient,
		addMealIngredient,
		getIngredients,
	} = useMealPlanner(groupId);
	const { mealPlan, activePlanId } = useGroupMealPlan(groupId);

	const [createOpen, setCreateOpen] = useState(false);
	const [addMealOpen, setAddMealOpen] = useState(false);
	const [defaultAddDate, setDefaultAddDate] = useState<string | undefined>();

	const [currentMonth, setCurrentMonth] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});

	function goToPrevMonth() {
		setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
	}
	function goToNextMonth() {
		setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
	}
	function goToToday() {
		const now = new Date();
		setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
	}

	if (mealPlans.isLoading || mealPlan.isLoading) return <Loader />;

	if (mealPlans.error) return <ErrorCard message={mealPlans.error.message} />;

	const plans = mealPlans.data ?? [];

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
			<Header
				hasPlans={plans.length > 0}
				groupId={groupId}
				createMealPlan={createMealPlan}
				onOpenCreate={() => setCreateOpen(true)}
			/>

			{plans.length === 0 ? (
				<EmptyStateCard onCreate={() => setCreateOpen(true)} />
			) : (
				<div className="space-y-4">
					<MealPlanCard
						title={mealPlan.data?.mealPlan?.name ?? plans[0]?.mealPlan.name}
						meals={mealPlan.data?.meals ?? []}
						currentMonth={currentMonth}
						onPrevMonth={goToPrevMonth}
						onNextMonth={goToNextMonth}
						onToday={goToToday}
						onAddMealAtDate={(dateKey) => {
							setDefaultAddDate(dateKey);
							setAddMealOpen(true);
						}}
						activePlanId={activePlanId}
						createMeal={createMeal}
						createIngredient={createIngredient}
						addMealIngredient={addMealIngredient}
						getIngredients={getIngredients}
						addMealOpen={addMealOpen}
						setAddMealOpen={setAddMealOpen}
						defaultAddDate={defaultAddDate}
					/>
				</div>
			)}
			<CreateMealPlanDialog
				groupId={groupId}
				createMealPlan={createMealPlan}
				open={createOpen}
				onOpenChange={setCreateOpen}
			/>
		</div>
	);
}
