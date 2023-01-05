import pool from "../apiDataBase.js";

export const connection = await pool.getConnection(async (conn) => conn);

export async function isRegisteredGroupName(seekerId, groupName) {
	const [exist, ...other] = await connection.query(
        "select exists(select * from group_list where seeker_id=? and group_name=?) as registered;",
        [seekerId, groupName]
    );
	return (exist[0]["registered"])
}

export async function selectDuplicatedGroupMember(groupId, groupMembers) {
	const res = await connection.query(
        "select * from group_member where group_id=? and target_id in (?)",
        [groupId, groupMembers]
    );
	return (res[0]);
}

export async function selectDuplicatedAlarm(seekerId, alarms) {
	const res = await connection.query(
        "select * from alarm where seeker_id=? and target_id in (?)",
        [seekerId, alarms]
    );
	return (res[0]);
}
