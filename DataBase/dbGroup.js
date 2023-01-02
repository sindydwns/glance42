import Sequelize from "sequelize";
import sequelize from "../setting.js";
import LocationStatus from "../models/locationStatus.js";
import User from "../models/user.js";
import GroupMember from "../models/groupMember.js";
import Group from "../models/group.js";

export async function insertGroup(intraId, name) {
    try {
        await Group.create({
          intraId: intraId,
          name: name,
          selected: 0
    });
    return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }