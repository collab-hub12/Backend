
import * as userschema from "./users.schema"
import * as orgschema from "./organizations.schema"
import * as taskschema from "./tasks.schema"
import * as teasmschema from "./teams.schema"

export type schema = typeof userschema & typeof orgschema & typeof taskschema & typeof teasmschema