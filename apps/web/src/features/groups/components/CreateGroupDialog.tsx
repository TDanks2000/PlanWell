import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGroups } from "../hooks/useGroups";

export function CreateGroupDialog() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const nameRef = useRef<HTMLInputElement | null>(null);

	const { createGroup } = useGroups();

	useEffect(() => {
		if (open) {
			// autofocus name field when dialog opens
			setTimeout(() => nameRef.current?.focus(), 50);
		}
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Group name is required");
			return;
		}

		try {
			await createGroup.mutateAsync({
				name: name.trim(),
				description: description.trim() || undefined,
			});

			toast.success("Group created successfully!");
			setOpen(false);
			setName("");
			setDescription("");
		} catch (_error) {
			toast.error("Failed to create group");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button aria-label="Create group">
					<Plus className="mr-2 h-4 w-4" />
					Create Group
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Create New Group</DialogTitle>
					<DialogDescription>
						Create a new group to collaborate with others on meal planning.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-4"
					aria-label="Create group form"
				>
					<div className="space-y-2">
						<Label htmlFor="name">Group Name</Label>
						<Input
							id="name"
							ref={nameRef}
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Monday Meal Crew"
							maxLength={100}
							required
						/>
						{!name.trim() && (
							<p className="mt-1 text-muted-foreground text-xs">
								A descriptive name helps others find your group.
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description (Optional)</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Short description (what the group is for)"
							maxLength={500}
							rows={3}
						/>
						{description.length > 250 && (
							<p className="mt-1 text-muted-foreground text-xs">
								Consider keeping descriptions brief for readability.
							</p>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={createGroup.isPending}
							aria-disabled={createGroup.isPending}
						>
							Cancel
						</Button>

						<Button
							type="submit"
							disabled={createGroup.isPending}
							aria-disabled={createGroup.isPending}
						>
							{createGroup.isPending ? "Creating..." : "Create Group"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
