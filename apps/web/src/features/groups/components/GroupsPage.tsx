import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGroups } from "../hooks/useGroups";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { GroupCard } from "./GroupCard";
import { GroupHeader } from "./GroupHeader";
import { InvitationCard } from "./InvitationCard";

export function GroupsPage() {
	const { myGroups, myInvitations, respondToInvitation } = useGroups();
	const navigate = useNavigate();

	const [query, setQuery] = useState("");
	const [tab, setTab] = useState<"my-groups" | "invitations">("my-groups");
	const [sort, setSort] = useState<"recent" | "name">("recent");

	const myGroupsData = myGroups.data ?? [];
	const myInvitationsData = myInvitations.data ?? [];

	const filteredGroups = useMemo(() => {
		const q = query.trim().toLowerCase();
		let list = myGroupsData.slice();
		if (q) {
			list = list.filter((g) => {
				return (
					g.group.name.toLowerCase().includes(q) ||
					(g.group.description ?? "").toLowerCase().includes(q)
				);
			});
		}
		if (sort === "name") {
			list.sort((a, b) => a.group.name.localeCompare(b.group.name));
		} else {
			list.sort(
				(a, b) =>
					new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
			);
		}
		return list;
	}, [myGroupsData, query, sort]);

	const handleViewGroup = (groupId: string) => {
		navigate({ to: "/groups/$groupId", params: { groupId } });
	};

	const handleAcceptInvitation = async (invitationId: string) => {
		try {
			await respondToInvitation.mutateAsync({
				invitationId,
				action: "accept",
			});
			toast.success("Invitation accepted!");
		} catch {
			toast.error("Failed to accept invitation");
		}
	};

	const handleDeclineInvitation = async (invitationId: string) => {
		try {
			await respondToInvitation.mutateAsync({
				invitationId,
				action: "decline",
			});
			toast.success("Invitation declined");
		} catch {
			toast.error("Failed to decline invitation");
		}
	};

	if (myGroups.isLoading || myInvitations.isLoading) {
		return <Loader />;
	}

	return (
		<div className="container mx-auto max-w-6xl px-4 py-6">
			<GroupHeader
				name="Groups"
				description="Manage your groups and collaborate with others on meal planning."
			/>

			<Tabs
				defaultValue={tab}
				onValueChange={(v) => setTab(v as "my-groups" | "invitations")}
				className="space-y-6"
			>
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-3">
						<TabsList>
							<TabsTrigger value="my-groups">
								My Groups ({myGroupsData.length})
							</TabsTrigger>
							<TabsTrigger value="invitations">
								Invitations ({myInvitationsData.length})
							</TabsTrigger>
						</TabsList>
					</div>

					<div className="flex items-center gap-3">
						<div className="hidden items-center gap-3 md:flex">
							<Input
								aria-label="Search groups"
								placeholder="Search groups..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="min-w-[220px]"
							/>

							{/* Proper shadcn Select usage */}
							<Select
								value={sort}
								onValueChange={(v) => setSort(v as "recent" | "name")}
							>
								<SelectTrigger className="w-44">
									<SelectValue placeholder="Sort groups" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="recent">Recently joined</SelectItem>
									<SelectItem value="name">Name (A–Z)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-2">
							<CreateGroupDialog />
						</div>
					</div>
				</div>

				<TabsContent value="my-groups" className="space-y-4">
					{filteredGroups.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{filteredGroups.map((userGroup) => (
								<GroupCard
									key={userGroup.group.id}
									group={userGroup}
									onView={() => handleViewGroup(userGroup.group.id)}
								/>
							))}
						</div>
					) : (
						<div className="py-12 text-center">
							<div className="mx-auto max-w-xl">
								<h2 className="font-semibold text-xl">
									You don't have any groups yet
								</h2>
								<p className="mt-2 text-muted-foreground">
									Create your first group to invite others and start
									collaborating on meal plans.
								</p>
								<div className="mt-6 flex justify-center">
									<CreateGroupDialog />
								</div>
							</div>
						</div>
					)}
				</TabsContent>

				<TabsContent value="invitations" className="space-y-4">
					{myInvitationsData.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{myInvitationsData.map((invitation) => (
								<InvitationCard
									key={invitation.id}
									invitation={invitation}
									onAccept={() => handleAcceptInvitation(invitation.id)}
									onDecline={() => handleDeclineInvitation(invitation.id)}
								/>
							))}
						</div>
					) : (
						<div className="py-12 text-center">
							<div className="text-muted-foreground">
								No pending invitations.
							</div>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
