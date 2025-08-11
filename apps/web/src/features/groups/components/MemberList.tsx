import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Member {
	id: string;
	role: string;
	user?: {
		name?: string;
		email?: string;
	};
}

interface MemberListProps {
	members: Member[];
}

export function MemberList({ members }: MemberListProps) {
	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5 text-primary" />
					Members{" "}
					<span className="font-normal text-muted-foreground">
						({members.length})
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{members.map((member) => (
						<div
							key={member.id}
							className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
						>
							<div className="flex items-center space-x-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
									{member.user?.name?.charAt(0) || "?"}
								</div>
								<div>
									<p className="font-medium text-base">{member.user?.name}</p>
									<p className="text-muted-foreground text-xs">
										{member.user?.email}
									</p>
								</div>
							</div>
							<Badge variant="outline" className="capitalize">
								{member.role}
							</Badge>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
