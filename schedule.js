import _schedule from "node-schedule";
import api42 from "./api42.js";
import { postDM2User } from "./apiSlack.js";
import { setAllLocationTable, getAllReservedAlarm, deleteReservedAlarm, insertStatisticHost } from "./DataBase/utils.js";

const campusId = 29;
export const schedule = {
    loadLocations: (delay) => {
		if (delay == null)
			return ;
        _schedule.scheduleJob(`*/${+delay} * * * * *`, async () => {
			try {
				console.log(`${new Date()} | upsert location_status`);
				const total = await getLocation(campusId);
				const locationTable = total.reduce((acc, cur) => {
					acc[cur.user.login] = cur.host;
					return acc;
				}, {});
				await setAllLocationTable(locationTable);
				console.log(`${new Date()} | upsert location_status [${Object.keys(locationTable).length}] items`);
				const alarms = await getAllReservedAlarm();
				const alarmMap = alarms.reduce((acc, cur) => {
					acc[cur.target_id] = cur;
					return acc;
				}, {});
				const done = [];
				for (let user in locationTable)
					if (alarmMap[user])
						done.push(alarmMap[user]);
				console.log("todo alarm", done);
				for (let id in done)
					if (done[id].notify_slack_id)
						postDM2User(done[id].notify_slack_id, `${done[id].target_id} is online`);
				await deleteReservedAlarm(done.map(x => x.alarm_id));
			} catch(e) {
				console.error(e);
			}
        });
    },
	statisticHost: (delay) => {
		if (delay == null)
			return;
		_schedule.scheduleJob(`45 59 */${+delay} * * *`, async () => {
			try {
				console.log(`${new Date()} | statisticHost`);
				const total = await getLocation(campusId);
				const studentCount = total.reduce((acc, cur) => {
					const cluster = /c(\d+)r\d+s\d+/.exec(cur.host)[1];
					if (cluster == null)
						return acc;
					acc[cluster] = acc[cluster] == null ? 1 : acc[cluster] + 1;
					return acc;
				}, {});
				const maxCluster = 10;
				const statisticHost = [...Array(maxCluster).keys()]
					.map((x, i) => [i + 1, studentCount[i + 1] ?? 0]);
				await insertStatisticHost(statisticHost);
			} catch(e) {
				console.error(e);
			}
		});
	}
};

async function getLocation(campusId) {
	const path = `/v2/campus/${campusId}/locations`;
	let total = [];
	for (let i = 0; i < 99; i++) {
		const config = {params:{
			"page[size]": "100",
			"page[number]": i + 1,
			"filter[active]": true,
			"filter[primary]": true,
			"range[host]": "c10,c9r9s9"
		}};
		const data = await api42("GET", path, config);
		if (data.length == 0)
			break;
		total = [...total, ...data];
	}
	return total;
}
