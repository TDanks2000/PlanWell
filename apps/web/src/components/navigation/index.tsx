import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";

export default function NavigationBar() {
	return (
		<header className="sticky top-0 z-40 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<div className="flex items-center gap-3">
					<MobileNav />
					<Link to="/" className="font-semibold tracking-tight">
						PlanWell
					</Link>
				</div>

				<div className="hidden md:block">
					<NavLinks />
				</div>

				<div className="flex items-center gap-2">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}

function MobileNav() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="md:hidden">
					<Menu className="h-5 w-5" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>PlanWell</DialogTitle>
				</DialogHeader>
				<div className="mt-2">
					<NavLinks orientation="vertical" />
				</div>
			</DialogContent>
		</Dialog>
	);
}
