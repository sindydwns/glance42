import { sequelize } from '../setting.js'
import * as userFuncs from "../DataBase/dbuser.js"; // ekwak
import { User, LocationStatus, Group, GroupMember } from "../models/index.js";

const strcmp = (str1, str2) => str1 < str2 ? -1 : str1 > str2 ? 1 : 0;
const sortByTargetId = (o1, o2) => strcmp(o1.targetId, o2.targetId);
await sequelize.sync({force: true});