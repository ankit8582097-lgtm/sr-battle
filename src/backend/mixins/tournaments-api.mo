import Map "mo:core/Map";
import Types "../types/tournaments";
import TournamentsLib "../lib/tournaments";

mixin (
  tournaments : Map.Map<Nat, Types.Tournament>,
  state : { var nextTournamentId : Nat },
) {
  public shared func createTournament(input : Types.TournamentInput) : async Types.Tournament {
    TournamentsLib.createTournament(tournaments, state, input)
  };

  public query func listTournaments() : async [Types.Tournament] {
    TournamentsLib.listTournaments(tournaments)
  };

  public query func getTournament(id : Nat) : async ?Types.Tournament {
    TournamentsLib.getTournament(tournaments, id)
  };

  public shared func joinTournament(id : Nat, playerName : Text) : async Types.Tournament {
    TournamentsLib.joinTournament(tournaments, id, playerName)
  };

  public shared func updateTournament(id : Nat, creatorName : Text, input : Types.TournamentInput) : async Types.Tournament {
    TournamentsLib.updateTournament(tournaments, id, creatorName, input)
  };

  public shared func deleteTournament(id : Nat, creatorName : Text) : async Bool {
    TournamentsLib.deleteTournament(tournaments, id, creatorName)
  };
};
