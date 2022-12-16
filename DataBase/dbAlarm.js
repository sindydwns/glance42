import connection from "./utils.js";

export default {
  getAllLocationTable,
  getAllReservedAlarm,
  deleteReservedAlarm,
};

async function getAllLocationTable() {
  const [locations, ...other] = await connection.query(
    "select target_id, host from location_status"
  );
  const result = [];

  for (const location of locations) {
    result[location.target_id] = location.host;
  }
  return result;
}

async function getAllReservedAlarm(seekerId) {
  if (seekerId == null) {
    const [alarms, ...other] = await connection.query(
      "select alarm_id, seeker_id, target_id, notify_slack_id from alarm"
    );

    return alarms;
  }
  const [alarms, ...other] = await connection.query(
    "select seeker_id, target_id, notify_slack_id from alarm where seeker_id = ?",
    [seekerId]
  );

  return alarms;
}

async function deleteReservedAlarm(ids) {
  if (ids.length == 0) return;
  await connection.query("delete from alarm where alarm_id in (?)", [ids]);
}
