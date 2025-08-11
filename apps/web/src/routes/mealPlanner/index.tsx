import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/mealPlanner/")({
	component: () => (
		<div className="mx-auto w-full max-w-3xl px-3 py-10">
			<h1 className="mb-2 font-semibold text-2xl">Meal Planner</h1>
			<p className="text-muted-foreground text-sm">
				Select a group to view or create its meal plans.
			</p>
			<div className="mt-4 text-sm">
				Go to <Link to="/groups">Groups</Link> and choose a group.
			</div>
		</div>
	),
});
