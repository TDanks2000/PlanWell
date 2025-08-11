import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorCardProps {
	message?: string;
}

export function ErrorCard({ message }: ErrorCardProps) {
	const msg = message || "";
	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-12 text-center">
			<Card>
				<CardHeader>
					<CardTitle className="font-semibold text-lg">
						Unable to load meal planner
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">{msg}</p>
				</CardContent>
			</Card>
		</div>
	);
}

export default ErrorCard;
