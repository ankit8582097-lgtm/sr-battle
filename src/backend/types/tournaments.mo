import Common "../types/common";

module {
  public type Game = { #freeFire; #brCs };
  public type Mode = { #loneWolf };
  public type Status = { #open; #full; #closed };

  public type TournamentInput = {
    name : Text;
    game : Game;
    mode : Mode;
    roomId : Text;
    roomPassword : Text;
    map : Text;
    maxPlayers : Nat;
    entryFee : Nat;
    creatorName : Text;
  };

  public type Tournament = {
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
    createdAt : Common.Timestamp;
    players : [Text];
    entryFee : Nat;
  };
};
