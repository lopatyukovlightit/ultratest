import { entities } from '@entities/index';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { Game } from '@entities/game.entity';
import { Publisher } from '@entities/publisher.entity';
import { Discount } from '@entities/discount.entity';

export function getTypeOrmConfig(env) {
  const migrationsDist = env.NODE_ENV === 'production' ? './dist/src/database/migrations/*.js' : './src/database/migrations/*.ts';
  return {
    type: 'postgres',
    host: env.PGSQL_HOST,
    port: Number.parseInt(env.PGSQL_PORT, 10),
    username: env.PGSQL_USER,
    password: env.PGSQL_USER_PASS,
    database: env.PGSQL_DB_NAME,
    entities,
    migrationsTableName: 'migrations',
    migrations: [
      migrationsDist,
    ],

    cli: {
      migrationsDir: '/src/database/migrations',
    },
    logging: true,
  };
}

export enum DatabaseToken {
  CONNECTION = 'DbConnectionToken',
  GAME = 'GameRepositoryToken',
  PUBLISHER = 'PublisherRepositoryToken',
  DISCOUNT = 'DiscountRepositoryToken',
}

export const databaseProviders = [
  {
    provide: DatabaseToken.CONNECTION,
    useFactory: async (configService: ConfigService) => {
      const options = getTypeOrmConfig(configService.envConfig);
      return await createConnection(<ConnectionOptions>options);
    },
    inject: [ ConfigService ],
  },
  {
    provide: DatabaseToken.GAME,
    useFactory: (connection: Connection) => connection.getRepository(Game),
    inject: [ DatabaseToken.CONNECTION ],
  },
  {
    provide: DatabaseToken.PUBLISHER,
    useFactory: (connection: Connection) => connection.getRepository(Publisher),
    inject: [ DatabaseToken.CONNECTION ],
  },
  {
    provide: DatabaseToken.DISCOUNT,
    useFactory: (connection: Connection) => connection.getRepository(Discount),
    inject: [ DatabaseToken.CONNECTION ],
  },
];
