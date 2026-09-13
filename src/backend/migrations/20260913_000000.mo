import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type Game = { #freeFire; #brCs };
  type Mode = { #loneWolf };
  type Status = { #open; #full; #closed };
  type Tournament = {
    id : Nat;
    name : Text;
    game : Game;
    mode : Mode;
    roomId : Text;
    roomPassword : Text;
    map : Text;
    maxPlayers : Nat;
    currentPlayers : Nat;
    status : Status;
    creatorName : Text;
    createdAt : Int;
    players : [Text];
    entryFee : Nat;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    tournaments : Map.Map<Nat, Tournament>;
    state : { var nextTournamentId : Nat };
  };

  public func migration(_old : {}) : NewActor {
    {
      accessControlState = AccessControl.initState();
      tournaments = Map.empty();
      state = { var nextTournamentId = 0 };
    };
  };
};
