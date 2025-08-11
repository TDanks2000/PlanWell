import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Plus, Users, UtensilsCrossed } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateGroupDialog } from "@/features/groups/components/CreateGroupDialog";
import { GroupCard } from "@/features/groups/components/GroupCard";
import { InvitationCard } from "@/features/groups/components/InvitationCard";
import { useGroups } from "@/features/groups/hooks/useGroups";
import type { MealEntry } from "@/features/mealPlanner/components/CalendarGrid";
import { useGroupMealPlan } from "@/features/mealPlanner/hooks/useMealPlanner";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const navigate = useNavigate();
	const { session } = useSession();
	const { myGroups, myInvitations, respondToInvitation } = useGroups();

	const name = session?.user?.name ?? session?.user?.email ?? "there";

	const stats = useMemo(() => {
		const groups = myGroups.data?.length ?? 0;
		const invitations = myInvitations.data?.length ?? 0;
		return { groups, invitations };
	}, [myGroups.data, myInvitations.data]);

	return (
		<div className="container mx-auto w-full max-w-6xl px-4 py-8">
			{/* Hero */}
			<div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-balance font-semibold text-2xl md:text-3xl">
							Welcome back, {name} 👋
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							Plan meals with your groups and keep everyone on the same page.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button asChild variant="outline">
							<Link to="/groups">Manage Groups</Link>
						</Button>
						<Button asChild>
							<Link to="/mealPlanner">Open Meal Planner</Link>
						</Button>
					</div>
				</div>
				{/* Quick stats */}
				<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
					<Card className="bg-card/60">
						<CardHeader className="pb-1">
							<CardTitle className="flex items-center gap-2 text-base">
								<Users className="h-4 w-4" /> Groups
							</CardTitle>
							<CardDescription>Your active groups</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="font-semibold text-2xl">{stats.groups}</div>
						</CardContent>
					</Card>
					<Card className="bg-card/60">
						<CardHeader className="pb-1">
							<CardTitle className="flex items-center gap-2 text-base">
								<Calendar className="h-4 w-4" /> Invitations
							</CardTitle>
							<CardDescription>Pending requests</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="font-semibold text-2xl">{stats.invitations}</div>
						</CardContent>
					</Card>
					<Card className="bg-card/60">
						<CardHeader className="pb-1">
							<CardTitle className="flex items-center gap-2 text-base">
								<UtensilsCrossed className="h-4 w-4" /> Meal Planner
							</CardTitle>
							<CardDescription>Plan and track meals</CardDescription>
						</CardHeader>
						<CardContent className="flex items-center gap-2">
							<Button asChild variant="outline" size="sm">
								<Link to="/mealPlanner">Go to planner</Link>
							</Button>
							<CreateGroupDialog />
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Groups */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-lg">Your Groups</CardTitle>
						<CardDescription>Collaborate on meal plans</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Button asChild variant="outline" size="sm">
							<Link to="/groups">View all</Link>
						</Button>
						<CreateGroupDialog />
					</div>
				</CardHeader>
				<CardContent>
					{myGroups.isLoading ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{["s1", "s2", "s3"].map((k) => (
								<Skeleton key={k} className="h-36 w-full" />
							))}
						</div>
					) : myGroups.data && myGroups.data.length > 0 ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{myGroups.data.map((g) => (
								<GroupCard
									key={g.group.id}
									group={g}
									onView={() =>
										navigate({
											to: "/groups/$groupId",
											params: { groupId: g.group.id },
										})
									}
								/>
							))}
						</div>
					) : (
						<EmptyGroups />
					)}
				</CardContent>
			</Card>

			{/* Invitations */}
			<div className="mt-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Invitations</CardTitle>
						<CardDescription>Respond to join requests</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{myInvitations.isLoading ? (
							["i1", "i2"].map((k) => (
								<Skeleton key={k} className="h-28 w-full" />
							))
						) : myInvitations.data && myInvitations.data.length > 0 ? (
							myInvitations.data.slice(0, 5).map((inv) => (
								<InvitationCard
									key={inv.id}
									invitation={inv}
									onAccept={() =>
										respondToInvitation.mutate({
											invitationId: inv.id,
											action: "accept",
										})
									}
									onDecline={() =>
										respondToInvitation.mutate({
											invitationId: inv.id,
											action: "decline",
										})
									}
								/>
							))
						) : (
							<p className="text-muted-foreground text-sm">
								No pending invitations
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Upcoming meals across groups */}
			<div className="mt-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="text-lg">Upcoming Meals</CardTitle>
							<CardDescription>What’s coming up next</CardDescription>
						</div>
						<Button asChild variant="outline" size="sm">
							<Link to="/mealPlanner">Open planner</Link>
						</Button>
					</CardHeader>
					<CardContent>
						{myGroups.isLoading ? (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								{["u1", "u2", "u3"].map((k) => (
									<Skeleton key={k} className="h-40 w-full" />
								))}
							</div>
						) : myGroups.data && myGroups.data.length > 0 ? (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
								{myGroups.data.slice(0, 3).map((g) => (
									<UpcomingMealsForGroup
										key={g.group.id}
										groupId={g.group.id}
										groupName={g.group.name}
									/>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-sm">
								Create a group to start planning meals.
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function EmptyGroups() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted/10 p-8 text-center">
			<div className="rounded-full border p-3">
				<Users className="h-5 w-5" />
			</div>
			<div>
				<div className="font-semibold text-lg">No groups yet</div>
				<p className="mt-1 text-muted-foreground text-sm">
					Create your first group and invite others to collaborate.
				</p>
			</div>
			<div className="flex items-center gap-2">
				<CreateGroupDialog />
				<Button asChild variant="outline">
					<Link to="/groups">
						<Plus className="mr-2 h-4 w-4" /> Explore Groups
					</Link>
				</Button>
			</div>
		</div>
	);
}

function UpcomingMealsForGroup({
	groupId,
	groupName,
}: {
	groupId: string;
	groupName: string;
}) {
	const navigate = useNavigate();
	const { mealPlan } = useGroupMealPlan(groupId);

	const upcoming: Array<{
		id: string;
		name: string;
		date: Date;
		mealType?: string | null;
	}> = useMemo(() => {
		const now = new Date();
		const entries: MealEntry[] = mealPlan.data?.meals ?? [];
		const parsed = entries
			.map((e) => {
				const date = e.meal.plannedDate
					? new Date(String(e.meal.plannedDate))
					: undefined;
				return {
					id: e.meal.id,
					name: e.meal.name,
					date,
					mealType: e.meal.mealType ?? null,
				} as {
					id: string;
					name: string;
					date: Date | undefined;
					mealType?: string | null;
				};
			})
			.filter(
				(
					e,
				): e is {
					id: string;
					name: string;
					date: Date;
					mealType?: string | null;
				} => {
					if (!e.date || Number.isNaN(e.date.getTime())) return false;
					return e.date >= now;
				},
			)
			.sort((a, b) => a.date.getTime() - b.date.getTime())
			.slice(0, 4);
		return parsed;
	}, [mealPlan.data]);

	return (
		<Card className="h-full">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center justify-between text-base">
					<span className="truncate">{groupName}</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							navigate({ to: "/mealPlanner/$groupId", params: { groupId } })
						}
					>
						View
					</Button>
				</CardTitle>
				<CardDescription>Next up for this group</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				{mealPlan.isLoading ? (
					<>
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
					</>
				) : upcoming.length > 0 ? (
					<ul className="space-y-2">
						{upcoming.map((m) => (
							<li
								key={m.id}
								className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
							>
								<div className="min-w-0">
									<div className="truncate font-medium">{m.name}</div>
									<div className="text-muted-foreground text-xs">
										{m.mealType ? `${m.mealType} • ` : ""}
										{m.date.toLocaleDateString()}
									</div>
								</div>
							</li>
						))}
					</ul>
				) : (
					<p className="text-muted-foreground text-sm">No upcoming meals</p>
				)}
			</CardContent>
		</Card>
	);
}
