import { Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import type { GroupInvitation } from "../types";

interface InvitationCardProps {
	invitation: GroupInvitation;
	onAccept?: () => void;
	onDecline?: () => void;
	className?: string;
}

function formatRelativeExpiry(expiresAt: string) {
	const now = Date.now();
	const expires = new Date(expiresAt).getTime();
	const diff = Math.round((expires - now) / 1000); // seconds

	if (diff <= 0) return "Expired";
	if (diff < 60) return `in ${diff}s`;
	if (diff < 3600) return `in ${Math.round(diff / 60)}m`;
	if (diff < 86400) return `in ${Math.round(diff / 3600)}h`;
	return `on ${new Date(expiresAt).toLocaleDateString()}`;
}

export function InvitationCard({
	invitation,
	onAccept,
	onDecline,
	className,
}: InvitationCardProps) {
	const roleClasses: Record<GroupInvitation["role"], string> = {
		admin: "border-destructive/20 bg-destructive/10 text-destructive",
		moderator: "border-secondary/20 bg-secondary/60 text-secondary-foreground",
		member: "border-transparent bg-muted text-muted-foreground",
	} as const;

	const [confirmDecline, setConfirmDecline] = useState(false);
	const isExpired = useMemo(
		() => new Date(invitation.expiresAt) < new Date(),
		[invitation.expiresAt],
	);
	const [relativeExpiry, setRelativeExpiry] = useState(() =>
		formatRelativeExpiry(invitation.expiresAt),
	);

	useEffect(() => {
		const id = setInterval(
			() => setRelativeExpiry(formatRelativeExpiry(invitation.expiresAt)),
			1000 * 30,
		);
		return () => clearInterval(id);
	}, [invitation.expiresAt]);

	useEffect(() => {
		let timer: number | undefined;
		if (confirmDecline) {
			timer = window.setTimeout(() => setConfirmDecline(false), 4000);
		}
		return () => {
			if (typeof timer !== "undefined") clearTimeout(timer);
		};
	}, [confirmDecline]);

	const getInitials = (name?: string | null) => {
		if (!name) return "?";
		const parts = name.trim().split(/\s+/).slice(0, 2);
		return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
	};

	return (
		<Card
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
							{getInitials(invitation.invitedByUser?.name)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<CardTitle className="truncate font-semibold text-base md:text-lg">
							Invitation to {invitation.group?.name}
						</CardTitle>
						<CardDescription className="truncate text-muted-foreground text-sm">
							Invited by {invitation.invitedByUser?.name ?? "someone"}
						</CardDescription>
					</div>
					<Badge
						variant="outline"
						className={cn("capitalize", roleClasses[invitation.role])}
					>
						{invitation.role}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="pt-4">
				{invitation.message && (
					<p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
						“{invitation.message}”
					</p>
				)}

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
						<div className="flex items-center gap-1.5">
							<Calendar className="h-4 w-4" />
							<span>{isExpired ? "Expired" : `Expires ${relativeExpiry}`}</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span>
								Role: <span className="capitalize">{invitation.role}</span>
							</span>
						</div>
					</div>

					{!isExpired ? (
						<div className="flex items-center gap-2">
							<Button
								aria-label={`Decline invitation to ${invitation.group?.name}`}
								variant="outline"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									if (confirmDecline) {
										onDecline?.();
									} else {
										setConfirmDecline(true);
									}
								}}
								onDoubleClick={(e) => e.preventDefault()}
							>
								{confirmDecline ? "Confirm Decline" : "Decline"}
							</Button>

							<Button
								aria-label={`Accept invitation to ${invitation.group?.name}`}
								variant="default"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									onAccept?.();
								}}
							>
								Accept
							</Button>
						</div>
					) : (
						<div className="text-muted-foreground text-xs italic">
							This invitation has expired
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
