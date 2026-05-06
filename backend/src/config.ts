export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  mongodb: {
    host: process.env.MONGO_HOST ?? 'mongodb',
    port: parseInt(process.env.MONGO_PORT ?? '27017', 10),
    database: process.env.MONGO_DB ?? 'jg_sinaptor',
    username: process.env.MONGO_USER ?? 'sinaptor',
    password: process.env.MONGO_PASS ?? 'sinaptor123',
    get uri() {
      return `mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}?authSource=admin`;
    },
  },

  kafka: {
    brokers: (process.env.KAFKA_BROKERS ?? 'kafka:9092').split(','),
    clientId: 'jg-sinaptor',
    groupId: 'jg-sinaptor-group',
    topics: (process.env.KAFKA_TOPICS ?? 'botellas-events,tunnels-events,dlq-events').split(','),
  },

  gateway: {
    wsUrl: process.env.GATEWAY_WS_URL ?? null,
    internalSecret: process.env.ETER_INTERNAL_SECRET ?? '',
  },
});
