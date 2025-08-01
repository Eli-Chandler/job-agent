import type {CandidateDTO} from "@/api/models";
import {useGetMeMeGet} from "@/api/me/me.ts";

export function useUser(): {
    user?: CandidateDTO;
    isLoading: boolean;
    error?: string;
    refreshUser: () => Promise<void>;
} {
    const {data, isLoading, error, refetch} = useGetMeMeGet();

    return {
        user: data?.data,
        isLoading,
        error: error ? error.message : undefined,
        refreshUser: async () => {
            await refetch();
        },
    };
}