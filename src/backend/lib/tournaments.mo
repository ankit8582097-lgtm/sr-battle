import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/tournaments";

module {
  public func createTournament(
    tournaments : Map.Map<Nat, Types.Tournament>,
    state : { var nextTournamentId : Nat },
    input : Types.TournamentInput,
  ) : Types.Tournament {
    let id = state.nextTournamentId;
    state.nextTournamentId += 1;
    let tournament : Types.Tournament = {
      id;
      name = input.name;
      game = input.game;
      mode = input.mode;
      roomId = input.roomId;
      roomPassword = input.roomPassword;
      map = input.map;
      maxPlayers = input.maxPlayers;
      entryFee = input.entryFee;
      currentPlayers = 0;
      status = #open;
      creatorName = input.creatorName;
      createdAt = Time.now();
      players = [];
    };
    tournaments.add(id, tournament);
    tournament
  };

  public func listTournaments(tournaments : Map.Map<Nat, Types.Tournament>) : [Types.Tournament] {
    tournaments.values().toArray()
  };

  public func getTournament(tournaments : Map.Map<Nat, Types.Tournament>, id : Nat) : ?Types.Tournament {
    tournaments.get(id)
  };

  public func joinTournament(
    tournaments : Map.Map<Nat, Types.Tournament>,
    id : Nat,
    playerName : Text,
  ) : Types.Tournament {
    let tournament = tournaments.get(id) ?? Runtime.trap("Tournament not found");
    switch (tournament.status) {
      case (#full) { Runtime.trap("Tournament is full") };
      case (#closed) { Runtime.trap("Tournament is closed") };
      case (#open) {};
    };
    let newCount = tournament.currentPlayers + 1;
    let status = if (newCount >= tournament.maxPlayers) { #full } else { #open };
    let updated : Types.Tournament = {
      tournament with
      currentPlayers = newCount;
      status;
      players = tournament.players.concat([playerName]);
    };
    tournaments.add(id, updated);
    updated
  };

  public func updateTournament(
    tournaments : Map.Map<Nat, Types.Tournament>,
    id : Nat,
    creatorName : Text,
    input : Types.TournamentInput,
  ) : Types.Tournament {
    let tournament = tournaments.get(id) ?? Runtime.trap("Tournament not found");
    if (tournament.creatorName != creatorName) {
      Runtime.trap("Not authorized to update this tournament");
    };
    let updated : Types.Tournament = {
      tournament with
      name = input.name;
      game = input.game;
      mode = input.mode;
      roomId = input.roomId;
      roomPassword = input.roomPassword;
      map = input.map;
      maxPlayers = input.maxPlayers;
      entryFee = input.entryFee;
      creatorName = input.creatorName;
    };
    tournaments.add(id, updated);
    updated
  };

  public func deleteTournament(tournaments : Map.Map<Nat, Types.Tournament>, id : Nat, creatorName : Text) : Bool {
    switch (tournaments.get(id)) {
      case (?tournament) {
        if (tournament.creatorName != creatorName) {
          Runtime.trap("Not authorized to delete this tournament");
        };
        tournaments.remove(id);
        true
      };
      case null { false };
    };
  };
};
