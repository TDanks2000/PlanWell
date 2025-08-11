import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert, XCircle } from "lucide-react";
import Loader from "@/components/loader";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InviteUserBar } from "@/features/groups/components";
import { GroupHeader } from "@/features/groups/components/GroupHeader";
import { GroupInfoCard } from "@/features/groups/components/GroupInfoCard";
import { MemberList } from "@/features/groups/components/MemberList";
import { StateScreen } from "@/features/groups/components/StateScreen";
import { useGroup, useGroups } from "@/features/groups/hooks/useGroups";

export const Route = createFileRoute("/groups/$groupId")({
	component: GroupDetailComponent,
});

function GroupDetailComponent() {
	const { groupId } = Route.useParams();
	const { group, groupInvitations } = useGroup(groupId);
	const { leaveGroup, deleteGroup } = useGroups();
	const navigate = useNavigate();

	if (group.isLoading) return <Loader />;

	if (group.error) {
		const msg = group.error.message || "";
		if (msg.includes("FORBIDDEN") || msg.includes("not a member")) {
			return (
				<StateScreen
					title="Access Denied"
					message="You don't have permission to view this group."
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

	const groupData = group.data;
	const isAdminOrMod = groupData.members.some(
		(m) => m.role === "admin" || m.role === "moderator",
	);
	const isAdmin = groupData.members.some((m) => m.role === "admin");

	return (
		<div className="mx-auto w-full max-w-5xl px-2 py-8">
			<GroupHeader
				name={groupData.name}
				description={groupData.description}
				showBack
				onBack={() => {
					void navigate({ to: "/groups" });
				}}
			/>

			<div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
				{isAdminOrMod ? (
					<div className="sm:flex-1">
						<InviteUserBar
							group={groupData}
							onInvited={() => groupInvitations.refetch()}
						/>
					</div>
				) : (
					<div />
				)}

				<div className="flex gap-2 self-end sm:self-auto">
					<Button
						onClick={() =>
							navigate({ to: "/mealPlanner/$groupId", params: { groupId } })
						}
						className="self-end sm:self-auto"
					>
						Open Meal Planner
					</Button>
					{isAdmin && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="destructive"
									className="self-end sm:self-auto"
									disabled={deleteGroup.isPending}
								>
									{deleteGroup.isPending ? "Deleting…" : "Delete Group"}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete this group?</AlertDialogTitle>
									<AlertDialogDescription>
										This action is permanent and will remove the group and its
										memberships. You cannot undo this.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel disabled={deleteGroup.isPending}>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={async () => {
											await deleteGroup.mutateAsync({ id: groupId });
											navigate({ to: "/groups" });
										}}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										disabled={deleteGroup.isPending}
									>
										Confirm Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="destructive"
								className="self-end sm:self-auto"
								disabled={leaveGroup.isPending}
							>
								{leaveGroup.isPending ? "Leaving…" : "Leave Group"}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Leave this group?</AlertDialogTitle>
								<AlertDialogDescription>
									You will lose access to this group's members and content. If
									you are the only admin, you must transfer admin rights or
									delete the group first.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={leaveGroup.isPending}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={async () => {
										await leaveGroup.mutateAsync({ groupId });
									}}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									disabled={leaveGroup.isPending}
								>
									Confirm Leave
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			<div className="mt-8 grid gap-8 md:grid-cols-2">
				<MemberList members={groupData.members} />
				<GroupInfoCard
					createdAt={groupData.createdAt}
					updatedAt={groupData.updatedAt}
				/>
			</div>
		</div>
	);
}
