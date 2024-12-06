import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as users_schema from './schemas/users.schema';
import * as orgs_schema from './schemas/organizations.schema';
import * as teams_schema from './schemas/teams.schema';
import * as tasks_schema from './schemas/tasks.schema';
import * as boards_schema from './schemas/boards.schema';
import * as notification_schema from './schemas/notification.schema';
import * as refreshToken_schema from './schemas/refreshtoken';
import {Logger} from '@nestjs/common';
import {sql} from 'drizzle-orm';

export const DrizzleAsyncProvider = 'drizzleProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    useFactory: async () => {
      try {
        const pool = new Pool({
          connectionString: process.env.POSTGRES_CONNECTION_STRING!,
        });
        const db = drizzle(pool, {
          schema: {
            ...boards_schema,
            ...orgs_schema,
            ...users_schema,
            ...teams_schema,
            ...tasks_schema,
            ...notification_schema,
            ...refreshToken_schema,
          },
        });
        await db.execute(sql`SELECT 1`);

        Logger.log('Connected to database');


        return db;

      } catch (error) {
        Logger.error('Error connecting to database', error);
      }

    },
    exports: [DrizzleAsyncProvider],
  },
];
