import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import Expose "mo:caffeineai-oql/Expose";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import IntValue "mo:caffeineai-oql/IntValue";
import Types "types/tournaments";
import TournamentsApi "mixins/tournaments-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let tournaments : Map.Map<Nat, Types.Tournament>;
  let state : { var nextTournamentId : Nat };

  include MixinAuthorization(accessControlState, null);
  include TournamentsApi(tournaments, state);
  include ApiDocMixin();

  include Expose({
    entities = [
      OQL.Entity.manual<Types.Tournament>(
        "tournament",
        func () = tournaments.values(),
        "Tournament",
        "id",
      )
        .sample({
          id = 0;
          name = "";
          game = #freeFire;
          mode = #loneWolf;
          roomId = "";
          roomPassword = "";
          map = "";
          maxPlayers = 0;
          currentPlayers = 0;
          status = #open;
          creatorName = "";
          createdAt = 0;
          players = [];
          entryFee = 0;
        })
        .payload("id", func t = t.id)
        .payload("name", func t = t.name)
        .payload("game", func t = switch (t.game) { case (#freeFire) "freeFire"; case (#brCs) "brCs" })
        .payload("mode", func t = switch (t.mode) { case (#loneWolf) "loneWolf" })
        .payload("roomId", func t = t.roomId)
        .payload("map", func t = t.map)
        .payload("maxPlayers", func t = t.maxPlayers)
        .payload("currentPlayers", func t = t.currentPlayers)
        .payload("status", func t = switch (t.status) { case (#open) "open"; case (#full) "full"; case (#closed) "closed" })
        .payload("creatorName", func t = t.creatorName)
        .payload("createdAt", func t = t.createdAt)
        .payload("playerCount", func t = t.players.size())
        .payload("entryFee", func t = t.entryFee)
        .public_()
        .build(),
    ];
  });
};
