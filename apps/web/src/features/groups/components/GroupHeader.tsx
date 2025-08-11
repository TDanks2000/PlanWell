import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DefaultProps {
	name: string;
	description?: string | null;
}

type GroupHeaderProps = DefaultProps &
	(
		| {
				showBack: true;
				onBack: () => void;
				backText?: string;
		  }
		| {
				showBack: false;
				onBack?: never;
				backText?: never;
		  }
	);

export function GroupHeader({
	name,
	description,
	onBack,
	showBack = true,
	backText = "Back to Groups",
}: GroupHeaderProps) {
	return (
		<div className="mb-6 flex flex-col gap-2">
			{showBack && (
				<Button
					variant="ghost"
					onClick={onBack}
					className="mb-2 w-fit text-muted-foreground hover:text-primary"
				>
					<ArrowLeft />
					{backText}
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
