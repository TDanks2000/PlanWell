import { Button } from "@/components/ui/button";

interface StateScreenProps {
	title: string;
	message?: string;
	onBack: () => void;
	icon?: React.ReactNode;
}

export function StateScreen({
	title,
	message,
	onBack,
	icon,
}: StateScreenProps) {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-center">
			{icon && <div className="mb-4 text-primary/80">{icon}</div>}
			<h1 className="mb-2 font-bold text-3xl text-primary drop-shadow-sm md:text-4xl">
				{title}
			</h1>
			{message && (
				<p className="mx-auto mb-4 max-w-xl text-lg text-muted-foreground">
					{message}
				</p>
			)}
			<Button onClick={onBack} className="mt-2" variant="outline">
				Back to Groups
			</Button>
		</div>
	);
}
