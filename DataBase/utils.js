import pool from "../apiDataBase.js";

export const connection = await pool.getConnection(async (conn) => conn);

export async function replaceLocationStatus(table) {
	if (table == null)
		return (false);
	const keys = Object.keys(table);
	if (keys.length == 0)
		return (true);
	try {
		await connection.query("replace into location_status(target_id, host) values ?", [
			keys.map(x => [x, table[x]])
		]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

export async function deleteAllLocationTable() {
	try {
		await connection.query("delete from location_status");
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * @param {Array<string>} targets intra ids. if null delete all.
 * @returns 
 */
export async function deleteLocationTable(targets) {
	if (targets == null)
		return (false);
	if (targets.length == 0)
		return (true);
	try {
		await connection.query("delete from location_status where target_id in (?)", [
			targets
		]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

// export async function insertAlarm(seekerId, targetId, slackId) {
//     await connection.query("insert into alarm(seeker_id, target_id, slack_id) values(?, ?, ?)", [seekerId, targetId, slackId]);
// }

// export async function deleteAlarm(seekerId, targetId) {
//     await connection.query("delete from alarm where seeker_id = ? and target_id = ?", seekerId, targetId);
// }

export async function getSelectedGroupId(seekerId) {
    const [groupId, ...other] = await connection.query(
        "select gl.group_id from group_list gl where 1=1 and gl.seeker_id = ? and gl.selected = true;",
        [seekerId]
    );
    if (groupId.length === 0) return null;
    const returnVal = groupId[0].group_id;
    return returnVal;
}

export async function getGroupId(seekerId, groupName) {
    const [groupId, ...other] = await connection.query(
        "select gl.group_id from group_list gl where 1=1 and gl.seeker_id = ? and gl.group_name = ?",
        [seekerId, groupName]
    );
    if (groupId.length === 0) return null;
    const returnVal = groupId[0].group_id;
    return returnVal;
}

export async function getGroupList(seekerId) {
    const [groupName, ...other] = await connection.query(
        "select gl.group_id, gl.group_name, gl.selected from group_list gl where 1=1 and gl.seeker_id = ?",
        seekerId
    );
    return groupName;
}

export async function getMemberList(groupId) {
    const [groupUser, ...other] = await connection.query(
        "select gm.target_id from group_list gl inner join group_member gm on gl.group_id = gm.group_id where 1=1 and gl.group_id = ?",
        [groupId]
    );
    return groupUser;
}

export async function getAlarmList(seekerId) {
	const [alarmList, ...other] = await connection.query("select target_id from alarm where seeker_id=?", [seekerId]);
	return alarmList;
}

export async function getUsersLocationInfo(targetIds) {
	let locationInfo = [];
	for (const targetId of targetIds) {
		const [host, ...other] = await connection.query("select target_id, host from location_status where target_id=?", [targetId]);
		if (host[0] != null) // targetId가 유효하지 않은 경우는 제외 (나중에는 이미 앞에서 거르므로 이 부분은 지우면 됨)
			locationInfo.push(host[0]);
	}
    return locationInfo;
}

export async function getGroupLocationInfo(seekerId, groupId) {
    const [locationInfo, ...other] = await connection.query(
        "select gm.target_id, ls.host from group_list gl inner join group_member gm on gl.group_id = gm.group_id left join location_status ls on gm.target_id = ls.target_id where 1=1 and gl.seeker_id=? and gl.group_id=?",
        [seekerId, groupId]
    );
    return locationInfo;
}

export async function reflectWhetherSelected(seekerId, selectedGroupId) {
    await connection.query("update group_list set selected=false where seeker_id=?", [seekerId]);
    if (selectedGroupId != null)
		await connection.query("update group_list set selected=true where group_id=?", [selectedGroupId]);
}

export async function insertGroup(seekerId, groupName) {
	groupName = typeof(groupName) == "string" ? [groupName] : groupName;
	const values = groupName.map(x => [seekerId, x, 0]);
	try {
		await connection.query("insert into group_list(seeker_id, group_name, selected) values ?;", [values]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

export async function deleteGroup(seekerId, groupId) {
    try {
		await connection.query("delete from group_list where seeker_id=? and group_id=?;", [seekerId, groupId]);
		await connection.query("delete from group_member where group_id=?;", [groupId]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}	
}

/**
 * @param {string} groupId
 * @param {string|Array<string>} targetId 
 * @returns 
 */
export async function insertMember(groupId, targetId) {
	targetId = typeof(targetId) == "string" ? [targetId] : targetId;
	const values = targetId.map(x => [groupId, x]);
	try {
		await connection.query("insert into group_member(group_id, target_id) values ?;", [values]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

export async function deleteMember(groupId, targetId) {
	try {
		await connection.query("delete from group_member where group_id=? and target_id=?;", [groupId, targetId]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * @param {string} seekerId 
 * @param {string|Array<string>} targetId 
 * @param {string} notifySlackId
 * @returns 
 */
export async function insertAlarm(seekerId, targetId, notifySlackId) {
	targetId = typeof(targetId) == "string" ? [targetId] : targetId;
	const values = targetId.map(x => [seekerId, x, notifySlackId]);
	try {
		await connection.query("insert into alarm(seeker_id, target_id, notify_slack_id) values ?;", [values]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

export async function deleteAlarm(seekerId, targetId) {
	try {
		await connection.query("delete from alarm where seeker_id=? and target_id=?;", [seekerId, targetId]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

export async function insertStatisticHost(data) {
	try {
		await connection.query("insert into statistic_host(cluster, student_count) values ?", [data]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

export async function getAllLocationTable() {
	const [locations, ...other] = await connection.query("select target_id, host from location_status");
	const result = [];
	for (let location of locations) {
		result[location.target_id] = location.host;
	}
	return result;
}

export async function getAllReservedAlarm(seekerId) {
    if (seekerId == null) {
        const [alarms, ...other] = await connection.query("select alarm_id, seeker_id, target_id, u.slack_id as notify_slack_id from alarm a inner join user_list u on a.seeker_id = u.intra_id");
        return alarms;
    }
    const [alarms, ...other] = await connection.query("select alarm_id, seeker_id, target_id, u.slack_id as notify_slack_id from alarm a inner join user_list u on a.seeker_id = u.intra_id where a.seeker_id = ?", [seekerId]);
    return alarms;
}

export async function deleteReservedAlarm(ids) {
    if (ids.length == 0)
        return ;
    await connection.query("delete from alarm where alarm_id in (?)", [ids]);
}

export async function insertErrorLog(message) {
	try {
		await connection.query("insert into error_log(message) values(?)", [message]);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

export async function isExistSlackId(clientSlackId) {
	const [exist, ...other] = await connection.query(
        "select exists(select * from user_list where slack_id=?) as registered;",
        [clientSlackId]
    );
	return (exist[0]["registered"])
}

// registerNewClient 혹은 쿼리명 그대로 따라가서 updateSlackId
export async function registerNewClient(clientIntraId, clientSlackId) {
	await connection.query("insert into user_list(user_id, blackhole, slack_id) values(?, 0, ?)", [clientIntraId, clientSlackId]);
	// 이미 해당 intraId에 slackId값이 있거나, 해당 slackId가 다른 레코드에 이미 있는 경우 예외처리 필요
}
