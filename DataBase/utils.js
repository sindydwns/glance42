import pool from "../apiDataBase.js";

const connection = await pool.getConnection(async (conn) => conn);
export async function getGroupId(seekerId) {
    const [groupId, ...other] = await connection.query(
        "select gl.group_id from group_list gl where 1=1 and gl.seeker_id = ? and gl.selected = true;",
        [seekerId]
    );
    if (groupId.length === 0) return null;
    const returnVal = groupId[0].group_id;
    console.log(returnVal);
    return returnVal;
}

export async function getGls(seekerId) {
    const [groupName, ...other] = await connection.query(
        "select gl.group_id, gl.group_name, gl.selected from group_list gl where 1=1 and gl.seeker_id = ?",
        seekerId
    );
    return groupName;
}

export async function getGroupUser(groupId) {
    const [groupUser, ...other] = await connection.query(
        "select gm.target_id from group_list gl inner join group_member gm on gl.group_id = gm.group_id where 1=1 and gl.group_id = ?",
        [groupId]
    );

    return groupUser;
}

export async function getGroupLocationInfo(seekerId, groupId) {
    const [locationInfo, ...other] = await connection.query(
        "select gm.target_id, ls.host from group_list gl inner join group_member gm on gl.group_id = gm.group_id left join location_status ls on gm.target_id = ls.target_id where 1=1 and gl.seeker_id=? and gl.group_id=?",
        [seekerId, groupId]
    );

    return locationInfo;
}

export async function unSelectGroup(seekerId, groupName) {
    await connection.query("update group_list set selected=false where seeker_id=? and group_name=?", [seekerId, groupName]);
}

export async function SelectGroup(seekerId, groupName) {
    await connection.query("update group_list set selected=true where seeker_id=? and group_name=?", [seekerId, groupName]);
}
