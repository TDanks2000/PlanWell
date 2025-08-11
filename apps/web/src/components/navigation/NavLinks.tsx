import { Link } from "@tanstack/react-router";

type NavLinksProps = {
	orientation?: "horizontal" | "vertical";
	onNavigate?: () => void;
};

export function NavLinks({
	orientation = "horizontal",
	onNavigate,
}: NavLinksProps) {
	const baseClass =
		orientation === "horizontal"
			? "flex items-center gap-1 sm:gap-2"
			: "flex flex-col items-stretch gap-1";

	const linkClass =
		"rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 transition data-[status=active]:text-foreground data-[status=active]:bg-accent/60";

	return (
		<nav className={baseClass}>
			<Link
				to="/"
				className={linkClass}
				activeProps={{ className: "bg-accent/60 text-foreground" }}
				onClick={onNavigate}
			>
				Home
			</Link>
			<Link
				to="/groups"
				className={linkClass}
				activeProps={{ className: "bg-accent/60 text-foreground" }}
				onClick={onNavigate}
			>
				Groups
			</Link>
			<Link
				to="/mealPlanner"
				className={linkClass}
				activeProps={{ className: "bg-accent/60 text-foreground" }}
				onClick={onNavigate}
			>
				Meal Planner
			</Link>
		</nav>
	);
}
