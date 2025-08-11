import { authClient } from "@/lib/auth-client";

export const useSession = () => {
	const {
		data: session,
		error: sessionError,
		isPending: isSessionPending,
		refetch: refetchSession,
	} = authClient.useSession();

	return {
		session,
		sessionError,
		isSessionPending,
		refetchSession,
	};
};
