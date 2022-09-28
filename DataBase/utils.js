import pool from "../apiDataBase.js";

export async function getGroupId(seekerId, groupName) {
    const connection = await pool.getConnection(async (conn) => conn);
    const [groupId, ...other] = await connection.query("select gl.group_id from group_list gl where 1=1 and gl.seeker_id = ? and gl.group_name = ?;", [
        seekerId,
        groupName,
    ]);
    if (groupId.length === 0)
        return null;
    const returnVal = groupId[0].group_id;
    console.log(returnVal);
    return returnVal;
}

export async function getGls(seekerId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const [groupName, ...other] = await connection.query("select gl.group_name from group_list gl where 1=1 and gl.seeker_id = ?", [seekerId]);
    const returnVal = groupName.map((v) => v.group_name);
    console.log(returnVal);
    return returnVal;
}

export async function getGroupUser(groupId) {
    const connection = await pool.getConnection(async conn => conn);
    const [groupUser, ...other] = await connection.query("select gm.target_id from group_list gl inner join group_member gm on gl.group_id = gm.group_id where 1=1 and gl.group_id = ?", [groupId]);

    console.log(groupUser);
    return(groupUser);
}