import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroupHeaderProps {
	name: string;
	description?: string | null;
	onBack?: () => void;
	showBack?: boolean;
}

export function GroupHeader({
	name,
	description,
	onBack,
	showBack = true,
}: GroupHeaderProps) {
	return (
		<div className="mb-6 flex flex-col gap-2">
			{showBack && (
				<Button
					variant="ghost"
					onClick={onBack}
					className="mb-2 w-fit text-muted-foreground hover:text-primary"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Groups
				</Button>
			)}
			<h1 className="font-bold text-3xl text-primary drop-shadow-sm md:text-4xl">
				{name}
			</h1>
			{description && (
				<p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
			)}
		</div>
	);
}
