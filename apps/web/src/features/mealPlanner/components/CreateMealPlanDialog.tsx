import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CreateMealPlanMutation = {
	isPending: boolean;
	mutateAsync: (args: {
		groupId: string;
		name: string;
		description?: string;
	}) => Promise<unknown>;
};

interface CreateMealPlanDialogProps {
	groupId: string;
	createMealPlan: CreateMealPlanMutation;
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function CreateMealPlanDialog({
	groupId,
	createMealPlan,
	trigger,
	open: controlledOpen,
	onOpenChange,
}: CreateMealPlanDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = typeof controlledOpen === "boolean";
	const open = isControlled ? (controlledOpen as boolean) : internalOpen;

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [triedCreate, setTriedCreate] = useState(false);

	const createNameError = useMemo(() => {
		if (!triedCreate) return "";
		if (name.trim().length === 0)
			return "Please enter a name for your meal plan.";
		return "";
	}, [triedCreate, name]);

	function resetForm() {
		setTriedCreate(false);
		setName("");
		setDescription("");
	}

	function handleOpenChange(val: boolean) {
		if (isControlled) {
			onOpenChange?.(val);
		} else {
			setInternalOpen(val);
		}
		if (!val) resetForm();
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Meal Plan (one per group)</DialogTitle>
					<p className="text-muted-foreground text-sm">
						Give your plan a clear name. You can update details later.
					</p>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. August Family Plan"
							autoComplete="off"
							autoFocus
							aria-invalid={!!createNameError}
							aria-describedby={
								createNameError ? "create-name-error" : undefined
							}
						/>
						{createNameError && (
							<p id="create-name-error" className="text-destructive text-xs">
								{createNameError}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Optional details"
							autoComplete="off"
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Cancel</Button>
					</DialogClose>
					<Button
						aria-busy={createMealPlan.isPending}
						disabled={createMealPlan.isPending || name.trim().length === 0}
						onClick={async () => {
							setTriedCreate(true);
							if (name.trim().length === 0) return;
							await createMealPlan.mutateAsync({
								groupId,
								name: name.trim(),
								description: description.trim() || undefined,
							});
							handleOpenChange(false);
							resetForm();
						}}
					>
						{createMealPlan.isPending ? "Creating…" : "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CreateMealPlanDialog;
