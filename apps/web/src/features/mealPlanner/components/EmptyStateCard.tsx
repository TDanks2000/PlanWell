import { Calendar, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateCardProps {
	onCreate: () => void;
}

export function EmptyStateCard({ onCreate }: EmptyStateCardProps) {
	return (
		<Card className="border-dashed">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Calendar className="h-5 w-5" aria-hidden="true" /> No meal plans yet
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="mb-4 text-muted-foreground text-sm">
					Create the first meal plan for this group to start planning meals and
					generating shopping lists.
				</p>
				<Button onClick={onCreate} className="gap-2">
					<PlusCircle className="h-4 w-4" aria-hidden="true" /> Create Meal Plan
				</Button>
			</CardContent>
		</Card>
	);
}

export default EmptyStateCard;
