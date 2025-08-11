import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { queryClient, trpc } from "@/utils/trpc";

function getErrorMessage(error: unknown): string {
	if (error instanceof Error && typeof error.message === "string") {
		return error.message;
	}
	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as { message?: unknown }).message === "string"
	) {
		return (error as { message: string }).message;
	}
	return "Failed to leave group";
}

export const useGroups = () => {
	const navigate = useNavigate();
	const myGroups = useQuery(trpc.group.getMyGroups.queryOptions());
	const myInvitations = useQuery(trpc.group.getMyInvitations.queryOptions());

	const createGroup = useMutation(
		trpc.group.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getMyGroups.queryKey(),
				});
				toast.success("Group created");
			},
		}),
	);

	const updateGroup = useMutation(
		trpc.group.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getMyGroups.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.group.getById.queryKey(),
				});
				toast.success("Group updated");
			},
		}),
	);

	const deleteGroup = useMutation(
		trpc.group.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getMyGroups.queryKey(),
				});
				toast.success("Group deleted");
			},
		}),
	);

	const leaveGroup = useMutation(
		trpc.group.leave.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				toast.success("You left the group");
				navigate({ to: "/groups" });
			},
			onError: (error) => {
				toast.error(getErrorMessage(error));
			},
		}),
	);

	const addMember = useMutation(
		trpc.group.addMember.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getById.queryKey(),
				});
				toast.success("Member added");
			},
		}),
	);

	const updateMemberRole = useMutation(
		trpc.group.updateMemberRole.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getById.queryKey(),
				});
				toast.success("Member role updated");
			},
		}),
	);

	const removeMember = useMutation(
		trpc.group.removeMember.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getById.queryKey(),
				});
				toast.success("Member removed");
			},
		}),
	);

	const createInvitation = useMutation(
		trpc.group.createInvitation.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getGroupInvitations.queryKey(),
				});
				toast.success("Invitation created");
			},
		}),
	);

	const respondToInvitation = useMutation(
		trpc.group.respondToInvitation.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getMyInvitations.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.group.getMyGroups.queryKey(),
				});
				toast.success("Invitation accepted");
			},
		}),
	);

	const cancelInvitation = useMutation(
		trpc.group.cancelInvitation.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getGroupInvitations.queryKey(),
				});
				toast.success("Invitation declined");
			},
		}),
	);

	return {
		// Queries
		myGroups,
		myInvitations,

		// Mutations
		createGroup,
		updateGroup,
		deleteGroup,
		leaveGroup,
		addMember,
		updateMemberRole,
		removeMember,
		createInvitation,
		respondToInvitation,
		cancelInvitation,
	};
};

export const useGroup = (groupId: string) => {
	const group = useQuery(
		trpc.group.getById.queryOptions(
			{ id: groupId },
			{
				staleTime: 5 * 60 * 1000,
				refetchOnWindowFocus: false,
			},
		),
	);

	// Determine permissions after group data loads
	const isAdminOrMod =
		group.data?.members?.some(
			(m) => m.role === "admin" || m.role === "moderator",
		) ?? false;

	const groupInvitations = useQuery(
		trpc.group.getGroupInvitations.queryOptions(
			{ groupId },
			{
				enabled: !!group.data && isAdminOrMod,
				retry: false,
				refetchOnWindowFocus: false,
			},
		),
	);

	return {
		group, // main data for rendering
		groupInvitations, // optional data for admins/mods
	};
};
