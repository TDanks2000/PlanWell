import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, trpc } from "@/utils/trpc";
import type { Group, User } from "../types";

interface InviteUserBarProps {
	group: Group;
	onInvited?: () => void;
}

export function InviteUserBar({ group, onInvited }: InviteUserBarProps) {
	const [query, setQuery] = useState("");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [open, setOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [debouncedQuery, setDebouncedQuery] = useState("");

	// Debounce search
	useEffect(() => {
		const handler = window.setTimeout(
			() => setDebouncedQuery(query.trim()),
			300,
		);
		return () => window.clearTimeout(handler);
	}, [query]);

	const search = useQuery(
		trpc.group.searchUsers.queryOptions(
			{ query: debouncedQuery, groupId: group.id, limit: 8 },
			{ enabled: debouncedQuery.length > 0 },
		),
	);

	const createInvitation = useMutation(
		trpc.group.createInvitation.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.group.getGroupInvitations.queryKey(),
				});
			},
		}),
	);

	const handleSelect = (user: User) => {
		setSelectedUser(user);
		setOpen(true);
		setDropdownOpen(false);
	};

	const handleInvite = async () => {
		if (!selectedUser) return;
		try {
			await createInvitation.mutateAsync({
				groupId: group.id,
				invitedUserId: selectedUser.id,
				role: "member",
			});
			toast.success(`Invitation sent to @${selectedUser.username}`);
			setSelectedUser(null);
			setQuery("");
			if (onInvited) onInvited();
		} catch (e) {
			const message =
				e instanceof Error ? e.message : "Failed to send invitation";
			toast.error(message);
		} finally {
			setOpen(false);
		}
	};

	return (
		<div className="relative mb-6">
			<Label htmlFor="invite-user" className="mb-2">
				Invite user to group
			</Label>
			<Input
				id="invite-user"
				ref={inputRef}
				placeholder="Search users by name or username..."
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setDropdownOpen(true);
				}}
				autoComplete="off"
				onFocus={() => setDropdownOpen(true)}
				onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
			/>
			{dropdownOpen && debouncedQuery && (
				<Card className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto border bg-background shadow-lg">
					<CardHeader>
						<CardTitle>Search results</CardTitle>
						<CardDescription>Which user do you want to invite?</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						{search.isLoading ? (
							<div className="p-3">
								<Skeleton className="mb-2 h-6 w-full" />
								<Skeleton className="h-6 w-2/3" />
							</div>
						) : search.data && search.data.length > 0 ? (
							<>
								<div>{search.data.length} results</div>
								{search.data.map((user: User) => (
									<button
										type="button"
										key={user.id}
										className="w-full overflow-hidden rounded-md px-4 py-2 text-left hover:bg-accent focus:bg-accent focus:outline-none"
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => handleSelect(user)}
									>
										<span className="font-semibold">@{user.username}</span>
										{user.name && (
											<span className="ml-2 text-muted-foreground">
												{user.name}
											</span>
										)}
									</button>
								))}
							</>
						) : (
							<div className="p-3 text-muted-foreground text-sm">
								No users found
							</div>
						)}
					</CardContent>
				</Card>
			)}
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Invitation</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to add <b>@{selectedUser?.username}</b> to{" "}
							<b>{group.name}</b>?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleInvite}
							disabled={createInvitation.isPending}
						>
							{createInvitation.isPending ? "Inviting..." : "Confirm"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
