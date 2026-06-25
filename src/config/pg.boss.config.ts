const pgBossConfig = {
  max: Number(process.env.PG_BOSS_MAX) || 5,
  newConnectionTimeoutSeconds: Number(process.env.PG_BOSS_NEW_CONNECTION_TIMEOUT_SECONDS) || 30,
  maintenanceIntervalSeconds: Number(process.env.PG_BOSS_MAINTENANCE_INTERVAL_SECONDS) || 60,
  applicationName: process.env.PG_BOSS_APPLICATION_NAME || 'battle-pgboss',
};

export default pgBossConfig;