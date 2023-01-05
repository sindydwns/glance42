import { Alarm, Group, GroupMember, ErrorLog, StatisticsHost } from "./models/index.js";
import { sequelize } from "./setting.js";

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

export async function selectDuplicatedAlarm(intraId, alarms)
{
	alarms = Array.isArray(alarms) ? alarms : [alarms];
	const res_ = await Alarm.findAll({
		where: {
			intraId,
			targetId : alarms,
		}
	});
	const res = res_.map(x => x.dataValues);
	return (res);
}
