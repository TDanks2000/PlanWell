import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert, XCircle } from "lucide-react";
import Loader from "@/components/loader";
import { StateScreen } from "@/features/groups/components/StateScreen";
import { useGroup } from "@/features/groups/hooks/useGroups";
import { MealPlannerPage } from "@/features/mealPlanner/components/MealPlannerPage";

export const Route = createFileRoute("/mealPlanner/$groupId")({
	component: MealPlannerRouteComponent,
});

function MealPlannerRouteComponent() {
	const { groupId } = Route.useParams();
	const navigate = useNavigate();
	const { group } = useGroup(groupId);

	if (group.isLoading) return <Loader />;

	if (group.error) {
		const msg = group.error.message || "";
		if (msg.includes("FORBIDDEN") || msg.includes("not a member")) {
			return (
				<StateScreen
					title="Access Denied"
					message="You must be a member of this group to use the meal planner."
					onBack={() => navigate({ to: "/groups" })}
					icon={<ShieldAlert className="mx-auto h-12 w-12 text-destructive" />}
				/>
			);
		}
		return (
			<StateScreen
				title="Error"
				message={msg || "Something went wrong"}
				onBack={() => navigate({ to: "/groups" })}
				icon={<XCircle className="mx-auto h-12 w-12 text-destructive" />}
			/>
		);
	}

	if (!group.data) {
		return (
			<StateScreen
				title="Group not found"
				onBack={() => navigate({ to: "/groups" })}
				icon={<XCircle className="mx-auto h-12 w-12 text-muted-foreground" />}
			/>
		);
	}

	return <MealPlannerPage groupId={groupId} />;
}
