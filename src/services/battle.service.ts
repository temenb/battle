import {Battle} from "@prisma/client";
import {BattleModel} from "../models/battle.model";
import logger from "@shared/logger";

// import {enqueueEventTx} from "@shared/pg-boss/src/enqueueEvent";
// import {kafkaProducersConfig} from "../config/kafka.config";
// import {battleToGrpc} from "../lib/battle-grpc-prisma-converters";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function upsertBattle(profileId: string): Promise<Battle> {
  const existingMyBattle = await BattleModel.findBattleByProfile(profileId);

  // logger.log('upsert battle for profile: ', profileId);

  if (existingMyBattle) {
    return existingMyBattle;
  }

  let attempts = 3;

  while (attempts > 0) {
    const existingSomebodiesBattle = await BattleModel.findAvailableBattle(profileId);

    if (existingSomebodiesBattle) {
      try {

        return await BattleModel.joinBattle(existingSomebodiesBattle.id, profileId);
      } catch (e) {
        logger.log(e);
        // await enqueueEventTx(kafkaProducersConfig.topicBattleStarted, battleToGrpc(battle), tx);

        // export const makeMove = (move: engineGrpc.BattleMoveRequest): Promise<emptyGrpc.Empty | null> => {
        //   return engineManager.call((client, cb) => client.battleMove(move, cb));
        // };
      }
      attempts--;
      continue;
    }


    return BattleModel.createBattle(profileId);
  }

  return BattleModel.createBattle(profileId);
}

export async function joinBattle(profileId: string, battleId: string): Promise<Battle | null> {
  const battle = await BattleModel.getBattle(battleId);

  if (!battle) {
    throw new Error(`Battle ${battleId} not found.`);
  }

  if (battle.players.includes(profileId)) {
    return battle;
  }


  try {
    return await BattleModel.joinBattle(battleId, profileId);
  } catch (e) {
    logger.log(e);
  }

  return await BattleModel.getBattle(battleId);
}

