import {Battle, BattleCellValue, BattleStatus} from "@prisma/client";
import prisma from "../lib/prisma";
import {BattleObject} from "../grpc/generated/battle";
import {battleToPrisma} from "../lib/grpc-prisma-converters/battle";
import {NotFoundError} from "../services/battle.service";

export class BattleModel {
  static async findBattleByProfile(profileId: string): Promise<Battle | null> {
    return prisma.battle.findFirst({
      where: {
        players: {has: profileId},
        status: {not: BattleStatus.Finished},
      },
    });
  }


  static async findAvailableBattle(profileId: string): Promise<Battle | null> {
    return prisma.battle.findFirst({
      where: {
        status: BattleStatus.New,
        NOT: {players: {has: profileId}},
      },
    });
  }

  static async joinBattle(
    battleId: string
    , profileId: string
  ): Promise<Battle> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.battle.updateMany({
        where: {
          id: battleId,
          status: BattleStatus.New,
        },
        data: {
          players: {push: profileId},
          status: BattleStatus.Active,
        },
      });


      if (updated.count === 0) {
        throw new Error("Battle already full or finished");
      }

      const battle = await tx.battle.findUnique({
        where: {id: battleId},
      });

      if (!battle) {
        throw new NotFoundError("Unknown error");
      }

      // logger.log('battle started');
      // logger.log(battle);

      return battle;
    });
  }

  static async getBattle(battleId: string): Promise<Battle | null> {
    return await prisma.battle.findUnique({
      where: {id: battleId}
    });
  }

  static async createBattle(profileId: string): Promise<Battle> {


    // logger.log('create battle for profile', profileId);
    return prisma.battle.create({
      data: {
        players: [profileId],
        cells: Array(9).fill(BattleCellValue.EMPTY),
        status: BattleStatus.New,
      },
    });
  }

  static async updateBattle(battleObj: BattleObject): Promise<Battle> {
    const battle = battleToPrisma(battleObj);
    const updated = await prisma.battle.update({
      where: {id: battle.id},
      data: {
        cells: battle.cells,
        status: battle.status,
        winner: battle.winner ?? null,
        lastMoveAt: new Date(),
      },
    });

    // logger.log("battle updated");
    // logger.log(updated);
    return updated;
  }
}
