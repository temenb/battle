import {BattleService} from './generated/battle';
import * as grpc from '@grpc/grpc-js';
import * as battleHandler from "./handlers/battle.handler";
import * as healthHandler from "./handlers/health.handler";

const server = new grpc.Server();

server.addService(BattleService, {
  // upsert: battleHandler.upsert,
  // viewBattleByUser: battleHandler.viewBattleByUser,

  health: healthHandler.health,
  status: healthHandler.status,
  livez: healthHandler.livez,
  readyz: healthHandler.readyz,

  upsertBattle: battleHandler.upsertBattle,
  joinBattle: battleHandler.joinBattle,
});

export default server;

