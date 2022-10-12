import _schedule from "node-schedule";
import api42 from "./api42.js";
import { postDM2User } from "./apiSlack.js";
import { replaceLocationStatus, deleteAllLocationTable, deleteLocationTable, getAllReservedAlarm, deleteReservedAlarm, insertStatisticHost } from "./DataBase/utils.js";

const campusId = 29;
export const schedule = {
    loadLocations: (delay) => {
		let last = 0;
		if (delay == null)
			return ;
        _schedule.scheduleJob(`*/${+delay} * * * * *`, async () => {
			try {
				// update location
				const now = new Date();
				const total = last == 0 ?
					await getAllActiveLocation(campusId) :
					await getChangedLocation(campusId, last, now);
				const deleteTargets = total.reduce((acc, cur) => {
					if (cur.end_at != null)
						acc.push(cur.user.login);
					return acc;
				}, []);
				if (last == 0)
					deleteAllLocationTable();
				else
					deleteLocationTable(deleteTargets);
				const locationTable = total.reduce((acc, cur) => {
					if (cur.end_at == null)
						acc[cur.user.login] = cur.host;
					return acc;
				}, {});
				await replaceLocationStatus(locationTable);
				last = now;

				// alarm
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
				const total = await getAllActiveLocation(campusId);
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

async function getAllActiveLocation(campusId) {
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

async function getChangedLocation(campusId, past, now) {
	const path = `/v2/campus/${campusId}/locations`;
	let total = [];
	for (let i = 0; i < 99; i++) {
		const config = {params:{
			"page[size]": "100",
			"page[number]": i + 1,
			"filter[active]": true,
			"filter[primary]": true,
			"range[begin_at]": `${new Date(past).toISOString()},${(new Date(now)).toISOString()}`,
			"range[host]": "c10,c9r9s9"
		}};
		const data = await api42("GET", path, config);
		if (data.length == 0)
			break;
		total = [...total, ...data];
	}
	for (let i = 0; i < 99; i++) {
		const config = {params:{
			"page[size]": "100",
			"page[number]": i + 1,
			"filter[primary]": true,
			"range[begin_at]": `${new Date(0).toISOString()},${(new Date(past)).toISOString()}`,
			"range[end_at]": `${new Date(past).toISOString()},${(new Date(now)).toISOString()}`,
			"range[host]": "c10,c9r9s9"
		}};
		const data = await api42("GET", path, config);
		if (data.length == 0)
			break;
		total = [...total, ...data];
	}
	return total;
}
