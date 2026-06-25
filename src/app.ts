import grpcServer from './grpc/server';
import * as grpc from '@grpc/grpc-js';
import logger from '@shared/logger';
import kafkaConfig, {kafkaConsumersConfig, kafkaProducersConfig} from "./config/kafka.config";
import {createConsumer} from '@shared/kafka';
// import {startBattleNewWorker} from "./lib/consumers";
import {initBoss, startKafkaWorker} from "@shared/pg-boss";
import pgBossConfig from "./config/pg.boss.config";

const GRPC_PORT = process.env.GRPC_PORT ?? '50051';

async function startGrpc() {
  return new Promise<void>((resolve, reject) => {
    grpcServer.bindAsync(
      `0.0.0.0:${GRPC_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          logger.error('❌ Failed to start gRPC:', err);
          return reject(err);
        }
        logger.info(`🟢 gRPC server started on port ${port}`);
        resolve();
      }
    );
  });
}

async function startPgBoss() {
  await initBoss(pgBossConfig, async () => {
    for (const topicConfig of Object.values(kafkaProducersConfig)) {
      await startKafkaWorker(kafkaConfig, topicConfig);
    }
  });
}

async function createKafkaConsumers() {
  const configs = Object.values(kafkaConsumersConfig);

  await Promise.all(
    configs.map(async ({topic, handler}) => {
      await createConsumer(kafkaConfig, {topic, handler});
    })
  );
}

async function bootstrap() {
  try {
    await Promise.all([startGrpc(), startPgBoss(), createKafkaConsumers()]);
  } catch (err) {
    logger.error('💥 Failed to start Battle:', err);
    process.exit(1);
  }

  process.on('SIGINT', () => {
    logger.info('🛑 Shutting down...');
    grpcServer.forceShutdown();
    process.exit(0);
  });

}

bootstrap();




