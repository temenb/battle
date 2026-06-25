import {
  BattleCellValue as GrpcBattleCellValue,
  BattleObject,
  BattleStatus as GrpcBattleStatus
} from "../../grpc/generated/battle";
import {Battle, BattleCellValue, BattleStatus} from "@prisma/client";

const battleStatusMap: Record<BattleStatus, GrpcBattleStatus> = {
  [BattleStatus.New]: GrpcBattleStatus.NEW,
  [BattleStatus.Active]: GrpcBattleStatus.ACTIVE,
  [BattleStatus.Finished]: GrpcBattleStatus.FINISHED,
};

// Мапа для клеток
const battleCellValueMap: Record<BattleCellValue, GrpcBattleCellValue> = {
  [BattleCellValue.X]: GrpcBattleCellValue.CELL_X,
  [BattleCellValue.O]: GrpcBattleCellValue.CELL_O,
  [BattleCellValue.EMPTY]: GrpcBattleCellValue.CELL_EMPTY,
};

export function battleStatusToGrpc(status: BattleStatus): GrpcBattleStatus {
  const mapped = battleStatusMap[status];
  if (mapped === undefined) throw new Error(`Unknown BattleStatus: ${status}`);
  return mapped;
}

function flip<T extends string | number, U extends string | number>(
  obj: Record<T, U>
): Record<U, T> {
  const flipped: any = {};
  for (const [key, value] of Object.entries(obj)) {
    flipped[value as any] = key;
  }
  return flipped;
}

export function battleStatusToPrisma(status: GrpcBattleStatus): BattleStatus {
  const grpcToBattleStatusMap = flip(battleStatusMap);
  const mapped = grpcToBattleStatusMap[status];
  if (mapped === undefined) throw new Error(`Unknown GrpcBattleStatus: ${status}`);
  return mapped as BattleStatus;
}

export function battleCellValueToGrpc(cell: BattleCellValue): GrpcBattleCellValue {
  const mapped = battleCellValueMap[cell];
  if (mapped === undefined) throw new Error(`Unknown BattleCellValue: ${cell}`);
  return mapped;
}

export function battleCellValueToPrisma(cell: GrpcBattleCellValue): BattleCellValue {
  const grpcToBattleCellValueMap = flip(battleCellValueMap);
  const mapped = grpcToBattleCellValueMap[cell];
  if (mapped === undefined) throw new Error(`Unknown GrpcBattleCellValue: ${cell}`);
  return mapped as BattleCellValue;
}

export function battleToGrpc(battle: Battle): BattleObject {
  const grpcCells: GrpcBattleCellValue[] = (battle.cells).map(battleCellValueToGrpc);
  const status: GrpcBattleStatus = battleStatusToGrpc(battle.status);
  const players: string[] = battle.players;

  return {
    id: battle.id,
    cells: grpcCells,
    players: players,
    status: status,
    winner: battle.winner ?? "",
    createdAt: battle.createdAt.getTime(),
    updatedAt: battle.updatedAt.getTime(),
  };
}

export function battleToPrisma(battle: BattleObject) {
  const cells: BattleCellValue[] = (battle.cells).map(battleCellValueToPrisma);
  const status: BattleStatus = battleStatusToPrisma(battle.status);
  const players: string[] = battle.players;

  return {
    id: battle.id,
    cells: cells,
    players: players,
    status: status,
    winner: battle.winner ?? "",
    createdAt: new Date(battle.createdAt),
    updatedAt: new Date(battle.updatedAt),
  };
}
