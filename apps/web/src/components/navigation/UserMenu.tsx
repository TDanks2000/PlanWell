import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/useSession";
import { authClient } from "@/lib/auth-client";

export function UserMenu() {
	const { session } = useSession();
	const initials =
		session?.user?.name
			?.split(" ")
			.map((p) => p[0])
			.join("")
			.slice(0, 2)
			.toUpperCase() || "U";

	async function handleSignOut() {
		// better-auth react client exposes .signOut on the main client
		try {
			await authClient.signOut();
			// page state will refresh via session hook
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-9 px-2">
					<div className="flex items-center gap-2">
						<Avatar className="h-6 w-6">
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<span className="hidden text-sm sm:inline">
							{session?.user?.name || session?.user?.email || "Account"}
						</span>
						<ChevronDown className="h-4 w-4 opacity-70" />
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="truncate">
					{session?.user?.username ?? session?.user?.email}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to="/profile">
						<User className="mr-2 h-4 w-4" /> Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleSignOut}
					className="text-destructive focus:text-destructive"
				>
					<LogOut className="mr-2 h-4 w-4" /> Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
