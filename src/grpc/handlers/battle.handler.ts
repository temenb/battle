import * as grpc from '@grpc/grpc-js';
import * as battleGrpc from '../generated/battle';
import * as profileGrpc from '../generated/profile';
import * as battleService from '../../services/battle.service';
import {callbackError} from './callback.error';
import {battleToGrpc} from '../../lib/grpc-prisma-converters/battle';
import logger from "@shared/logger";
import {BattleModel} from "../../models/battle.model";


export async function upsertBattle(
  call: grpc.ServerUnaryCall<profileGrpc.ProfileIdRequest, battleGrpc.BattleObject>,
  callback: grpc.sendUnaryData<battleGrpc.BattleObject>
) {
  const {profileId} = call.request;

  try {
    const battle = await battleService.upsertBattle(profileId);

    logger.log(battle);
    if (!battle) {
      throw new Error("Battle not found");
    }

    callback(null, battleToGrpc(battle));

  } catch (err: any) {
    logger.log(err);
    callbackError(callback, err);
  }
}

export async function joinBattle(
  call: grpc.ServerUnaryCall<battleGrpc.StartBattleRequest, battleGrpc.BattleObject>,
  callback: grpc.sendUnaryData<battleGrpc.BattleObject>
) {
  const {profileId, battleId} = call.request;

  try {

    const battle = await battleService.joinBattle(profileId, battleId);

    if (!battle) {
      throw new Error(`Cannot join profile ${profileId} to battle ${battleId}.`);
    }

    callback(null, battleToGrpc(battle));

  } catch (err: any) {
    logger.log(err);
    callbackError(callback, err);
  }
}

export const getBattle = async (
  call: grpc.ServerUnaryCall<battleGrpc.BattleIdRequest, battleGrpc.BattleObject>,
  callback: grpc.sendUnaryData<battleGrpc.BattleObject>
) => {
  const {battleId} = call.request;

  try {
    const result = await BattleModel.getBattle(battleId);

    if (!result) {
      throw new Error("Battle not found");
    }

    callback(null, battleToGrpc(result));

  } catch (err: any) {
    logger.log(err);
    callbackError(callback, err);
  }
};


