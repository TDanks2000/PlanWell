import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { groupRouter } from "./routes/group";
import { mealPlannerRouter } from "./routes/mealPlanner";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	group: groupRouter,
	mealPlanner: mealPlannerRouter,
});
export type AppRouter = typeof appRouter;
