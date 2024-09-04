import {drizzle} from 'drizzle-orm/libsql';
import {createClient} from '@libsql/client';
import * as users_schema from './schemas/users.schema';
import * as orgs_schema from './schemas/organizations.schema';
import * as teams_schema from './schemas/teams.schema';
import * as tasks_schema from './schemas/tasks.schema';
import * as boards_schema from './schemas/boards.schema';
import * as notification_schema from "./schemas/notification.schema"

export const DrizzleAsyncProvider = 'drizzleProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    useFactory: async () => {
      const client = createClient({
        url: process.env.TURSO_CONNECTION_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      });
      const db = drizzle(client, {
        schema: {
          ...boards_schema,
          ...orgs_schema,
          ...users_schema,
          ...teams_schema,
          ...tasks_schema,
          ...notification_schema
        },
      });

      return db;
    },
    exports: [DrizzleAsyncProvider],
  },
];
