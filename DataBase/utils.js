import pool from "../apiDataBase.js";

export const connection = await pool.getConnection(async (conn) => conn);

export async function updateGroupName(GroupId, newGroupName) {
    await connection.query("update `group` set `name`=? where groupId=?", [newGroupName, GroupId]);
	return (true);
}

export async function isRegisteredGroupName(seekerId, groupName) {
	const [exist, ...other] = await connection.query(
        "select exists(select * from `group` where intraId=? and `name`=?) as registered;",
        [seekerId, groupName]
    );
	return (exist[0]["registered"])
}

export async function selectDuplicatedGroupMember(groupId, groupMembers) {
	const res = await connection.query(
        "select * from groupMember where groupId=? and targetId in (?)",
        [groupId, groupMembers]
    );
	return (res[0]);
}

export async function selectDuplicatedAlarm(seekerId, alarms) {
	const res = await connection.query(
        "select * from alarm where intraId=? and targetId in (?)",
        [seekerId, alarms]
    );
	return (res[0]);
}
