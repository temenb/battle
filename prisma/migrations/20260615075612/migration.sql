-- CreateEnum
CREATE TYPE "BattleCellValue" AS ENUM ('X', 'O', 'EMPTY');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('New', 'Active', 'Finished');

-- CreateTable
CREATE TABLE "Battle"
(
    "id"         TEXT           NOT NULL,
    "players"    TEXT[],
    "cells"      "BattleCellValue"[],
    "status"     "BattleStatus" NOT NULL,
    "winner"     TEXT,
    "lastMoveAt" TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"  TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3)   NOT NULL,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);
