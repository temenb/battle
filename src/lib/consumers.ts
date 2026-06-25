import logger from "@shared/logger";
import {BattleObject} from "../grpc/generated/battle";
import {BattleModel} from "../models/battle.model";


export async function battleUpdated(topic: string, partition: number, message: any): Promise<void> {
  try {
    // logger.log('battleUpdated');
    // logger.log(message);
    await BattleModel.updateBattle(message as BattleObject);
  } catch (error) {
    logger.error(`[Kafka] Failed to process message`, {
      rawValue: message.userId,
      error,
    });
  }
}
