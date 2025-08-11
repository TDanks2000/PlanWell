import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateMealPlanDialog from "./CreateMealPlanDialog";

interface HeaderProps {
	hasPlans: boolean;
	groupId: string;
	createMealPlan: {
		isPending: boolean;
		mutateAsync: (args: {
			groupId: string;
			name: string;
			description?: string;
		}) => Promise<unknown>;
	};
	onOpenCreate: () => void;
}

export function Header({
	hasPlans,
	groupId,
	createMealPlan,
	onOpenCreate,
}: HeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="space-y-1">
				<h1 className="font-bold text-3xl tracking-tight">Meal Planner</h1>
				<p className="text-muted-foreground text-sm">
					Plan meals, keep everyone aligned, and build shopping lists
					effortlessly.
				</p>
			</div>

			{!hasPlans && (
				<CreateMealPlanDialog
					groupId={groupId}
					createMealPlan={createMealPlan}
					trigger={
						<Button className="gap-2" onClick={onOpenCreate}>
							<PlusCircle className="h-4 w-4" aria-hidden="true" /> New Meal
							Plan
						</Button>
					}
				/>
			)}
		</div>
	);
}

export default Header;
