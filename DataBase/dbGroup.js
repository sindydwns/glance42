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

export async function updateGroupName(GroupId, newGroupName) {
    await Group.update({ name: newGroupName }, { where: { groupId: GroupId } });
    return true;
  }

export async function isRegisteredGroupName(intraId, groupName) {
  const group = await Group.findOne({
    where: {
    intraId,
    name: groupName
    }
  });
  return (group !== null);
}

export async function selectDuplicatedGroupMember(groupId, groupMembers) {
  groupMembers = Array.isArray(groupMembers) ? groupMembers : [groupMembers];
  const res_ = await GroupMember.findAll({
    where: {
      groupId,
      targetId : groupMembers,
    }
  });
  const res = res_.map(x => x.dataValues);
  return (res);
}
