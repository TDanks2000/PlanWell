import { useMutation, useQueries } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/features/groups/components/GroupCard";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { CreateMealPlanDialog } from "@/features/mealPlanner/components/CreateMealPlanDialog";
import { queryClient, trpc } from "@/utils/trpc";

export const Route = createFileRoute("/mealPlanner/")({
	component: MealPlannerIndex,
});

function MealPlannerIndex() {
	const navigate = useNavigate();
	const { myGroups } = useGroups();

	const manageableGroups = useMemo(
		() =>
			(myGroups.data ?? []).filter(
				(g) => g.memberRole === "admin" || g.memberRole === "moderator",
			),
		[myGroups.data],
	);

	const [createOpen, setCreateOpen] = useState(false);
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

	const createMealPlan = useMutation(
		trpc.mealPlanner.createMealPlan.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.mealPlanner.getMealPlansByGroup.queryKey(),
				});
				toast.success("Meal plan created");
			},
			onError: (error: unknown) => {
				const message =
					error instanceof Error && error.message
						? error.message
						: "Failed to create meal plan";
				toast.error(message);
			},
		}),
	);

	// For manageable groups, fetch whether they already have meal plans
	const mealPlanQueries = useQueries({
		queries: manageableGroups.map((g) =>
			trpc.mealPlanner.getMealPlansByGroup.queryOptions(
				{ groupId: g.group.id },
				{ enabled: true, refetchOnWindowFocus: false },
			),
		),
	});

	const groupIdToMealPlans = useMemo(() => {
		const map = new Map<string, (typeof mealPlanQueries)[number]>();
		manageableGroups.forEach((g, idx) => {
			map.set(g.group.id, mealPlanQueries[idx]);
		});
		return map;
	}, [manageableGroups, mealPlanQueries]);

	function hasPlans(groupId: string): boolean {
		const q = groupIdToMealPlans.get(groupId);
		return (q?.data?.length ?? 0) > 0 === true;
	}

	if (myGroups.isLoading) return <Loader />;

	if (myGroups.error) {
		return (
			<div className="mx-auto w-full max-w-3xl px-3 py-10">
				<h1 className="mb-2 font-semibold text-2xl">Meal Planner</h1>
				<p className="text-destructive text-sm">{myGroups.error.message}</p>
			</div>
		);
	}

	const allGroups = myGroups.data ?? [];
	const hasManageable = manageableGroups.length > 0;

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-8">
			<div className="mb-6">
				<h1 className="font-semibold text-2xl">Meal Planner</h1>
				<p className="text-muted-foreground text-sm">
					Choose a group to open its planner. You can create a meal plan for
					groups where you are admin or moderator.
				</p>
			</div>

			{hasManageable ? (
				<section className="space-y-3">
					<h2 className="font-medium text-base">Groups you can manage</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{[...manageableGroups]
							.sort(
								(a, b) =>
									Number(hasPlans(b.group.id)) - Number(hasPlans(a.group.id)),
							)
							.map((g) => (
								<div key={g.group.id} className="space-y-2">
									<GroupCard
										group={g}
										onView={() =>
											navigate({
												to: "/mealPlanner/$groupId",
												params: { groupId: g.group.id },
											})
										}
									/>
									<div className="flex items-center gap-2">
										{(() => {
											const q = groupIdToMealPlans.get(g.group.id);
											const showCreate =
												q?.isSuccess && (q.data?.length ?? 0) === 0;
											return showCreate ? (
												<Button
													size="sm"
													onClick={() => {
														setSelectedGroupId(g.group.id);
														setCreateOpen(true);
													}}
												>
													Create meal plan
												</Button>
											) : null;
										})()}
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												navigate({
													to: "/mealPlanner/$groupId",
													params: { groupId: g.group.id },
												})
											}
										>
											Open planner
										</Button>
									</div>
								</div>
							))}
					</div>
				</section>
			) : null}

			<section className="mt-8 space-y-3">
				<h2 className="font-medium text-base">All your groups</h2>
				{allGroups.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						You are not in any groups yet.
					</p>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{allGroups.map((g) => (
							<GroupCard
								key={g.group.id}
								group={g}
								onView={() =>
									navigate({
										to: "/mealPlanner/$groupId",
										params: { groupId: g.group.id },
									})
								}
							/>
						))}
					</div>
				)}
			</section>

			<CreateMealPlanDialog
				groupId={selectedGroupId ?? ""}
				createMealPlan={{
					isPending: createMealPlan.isPending,
					mutateAsync: async ({ groupId, name, description }) =>
						createMealPlan.mutateAsync({ groupId, name, description }),
				}}
				open={createOpen}
				onOpenChange={setCreateOpen}
			/>
		</div>
	);
}
