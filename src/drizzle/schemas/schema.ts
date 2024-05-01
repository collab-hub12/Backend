
import * as userschema from "./users.schema"
import * as orgschema from "./organizations.schema"
import * as taskschema from "./tasks.schema"
import * as teamschema from "./teams.schema"
import * as roomschema from "./room.schema"

export type schema = typeof userschema & typeof orgschema & typeof taskschema & typeof teamschema & typeof roomschema