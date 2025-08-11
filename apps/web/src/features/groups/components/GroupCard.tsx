import { Calendar, Settings, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserGroup } from "../types";

interface GroupCardProps {
	group: UserGroup;
	onView?: () => void;
	onSettings?: () => void;
	className?: string;
}

export function GroupCard({
	group,
	onView,
	onSettings,
	className,
}: GroupCardProps) {
	const roleClasses: Record<UserGroup["memberRole"], string> = {
		admin: "bg-primary/10 text-primary border-primary/20",
		moderator: "bg-secondary/60 text-secondary-foreground border-secondary/20",
		member: "bg-muted text-muted-foreground border-transparent",
	};

	const getInitials = (name: string) => {
		const parts = name.trim().split(/\s+/).slice(0, 2);
		return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
	};

	const handleCardClick = () => {
		if (onView) onView();
	};

	return (
		<Card
			role={onView ? "button" : undefined}
			tabIndex={onView ? 0 : -1}
			onClick={onView ? handleCardClick : undefined}
			className={cn(
				"group relative overflow-hidden border bg-card/60 backdrop-blur-sm transition-all",
				"hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
				className,
			)}
		>
			<CardHeader className="pb-0">
				<div className="flex items-start gap-4">
					<Avatar className="h-10 w-10">
						<AvatarFallback className="bg-primary/10 font-semibold text-primary">
							{getInitials(group.group.name)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<CardTitle className="truncate font-semibold text-base md:text-lg">
							{group.group.name}
						</CardTitle>
						{group.group.description ? (
							<CardDescription className="truncate text-muted-foreground text-sm">
								{group.group.description}
							</CardDescription>
						) : null}
					</div>
					<Badge
						variant="outline"
						className={cn("capitalize", roleClasses[group.memberRole])}
					>
						{group.memberRole}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
						<div className="flex items-center gap-1.5">
							<Calendar className="h-4 w-4" />
							<span>
								Joined {new Date(group.joinedAt).toLocaleDateString()}
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Users className="h-4 w-4" />
							<span>
								Your role:{" "}
								<span className="capitalize">{group.memberRole}</span>
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{onView && (
							<Button
								aria-label="Open group"
								variant="default"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									onView();
								}}
							>
								Open
							</Button>
						)}
						{onSettings && group.memberRole === "admin" && (
							<Button
								aria-label="Group settings"
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									onSettings();
								}}
							>
								<Settings className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
