export const config = {
  port: process.env.GRPC_PORT || 50051,
  serviceEngineUrl: process.env.SERVICE_ENGINE_URL || 'engine:50051',
};

export default config;