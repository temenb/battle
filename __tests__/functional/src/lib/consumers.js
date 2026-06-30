"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const battleUpdated_1 = require("../services/battleUpdated");
const client_1 = require("@prisma/client");
let userId1;
beforeEach(async () => {
    userId1 = crypto_1.default.randomUUID();
    await prisma_1.prisma.battle.deleteMany();
});
afterAll(async () => {
    await prisma_1.prisma.$disconnect();
});
test("успешно обновляет баттл", async () => {
    // создаём баттл
    const battle = await prisma_1.prisma.battle.create({
        data: {
            players: [userId1],
            playersCount: 1,
            status: client_1.BattleStatus.Active,
        },
    });
    // сообщение для обновления
    const message = {
        id: battle.id,
        cells: [client_1.BattleCellValue.CELL_X, client_1.BattleCellValue.CELL_O],
        status: client_1.BattleStatus.Finished,
        winner: userId1,
    };
    await (0, battleUpdated_1.battleUpdated)("battle.updated", 0, message);
    const updated = await prisma_1.prisma.battle.findUnique({ where: { id: battle.id } });
    expect(updated?.status).toBe(client_1.BattleStatus.Finished);
    expect(updated?.winner).toBe(userId1);
    expect(updated?.cells).toEqual(["X", "O"]);
});
test("ошибка при обновлении не ломает процесс", async () => {
    // сообщение с несуществующим id
    const message = {
        id: crypto_1.default.randomUUID(),
        cells: [],
        status: client_1.BattleStatus.Active,
        winner: null,
        userId: userId1,
    };
    await expect((0, battleUpdated_1.battleUpdated)("battle.updated", 0, message)).resolves.not.toThrow();
    // проверяем, что в базе ничего не появилось
    const battles = await prisma_1.prisma.battle.findMany();
    expect(battles.length).toBe(0);
});
