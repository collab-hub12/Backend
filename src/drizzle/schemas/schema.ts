import * as userschema from './users.schema';
import * as orgschema from './organizations.schema';
import * as taskschema from './tasks.schema';
import * as teamschema from './teams.schema';
import * as boardSchema from './boards.schema';
import * as notificationSchema from './notification.schema';
import * as refreshTokenSchema from './refreshtoken';


export type schema = typeof userschema &
  typeof orgschema &
  typeof taskschema &
  typeof teamschema &
  typeof boardSchema &
  typeof notificationSchema &
  typeof refreshTokenSchema;
