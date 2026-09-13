import { createActor } from "@/backend";
import type { Tournament, TournamentInput } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useListTournaments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      if (!actor) return [] as Tournament[];
      return actor.listTournaments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTournament(id: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getTournament(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useCreateTournament() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TournamentInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createTournament(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useJoinTournament() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      playerName,
    }: { id: bigint; playerName: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.joinTournament(id, playerName);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useUpdateTournament() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      creatorName,
      input,
    }: { id: bigint; creatorName: string; input: TournamentInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateTournament(id, creatorName, input);
    },
    onSuccess: (tournament) => {
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      void queryClient.invalidateQueries({
        queryKey: ["tournament", tournament.id],
      });
    },
  });
}

export function useDeleteTournament() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      creatorName,
    }: { id: bigint; creatorName: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteTournament(id, creatorName);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}
