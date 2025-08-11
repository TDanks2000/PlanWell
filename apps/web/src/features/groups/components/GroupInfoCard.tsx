import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupInfoCardProps {
	createdAt: string;
	updatedAt?: string;
}

export function GroupInfoCard({ createdAt, updatedAt }: GroupInfoCardProps) {
	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5 text-primary" />
					Group Info
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div>
						<p className="font-medium text-muted-foreground text-sm">Created</p>
						<p className="text-sm">
							{new Date(createdAt).toLocaleDateString()}
						</p>
					</div>
					{updatedAt && (
						<div>
							<p className="font-medium text-muted-foreground text-sm">
								Last Updated
							</p>
							<p className="text-sm">
								{new Date(updatedAt).toLocaleDateString()}
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
