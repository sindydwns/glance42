import _schedule from "node-schedule";
import api42 from "./api42.js";
import { postDM2User } from "./apiSlack.js";
import { setAllLocationTable, getAllReservedAlarm, deleteReservedAlarm } from "./DataBase/utils.js";

export const schedule = {
    loadLocations: (delay) => {
		if (delay == null)
			return ;
        _schedule.scheduleJob(`*/${+delay} * * * * *`, async () => {
			const campusId = 29;
			const path = `/v2/campus/${campusId}/locations`;
			try {
				console.log(`${new Date()} | upsert location_status`);
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
				total = total.reduce((acc, cur) => {
					acc[cur.user.login] = cur.host;
					return acc;
				}, {});
				setAllLocationTable(total);
				console.log(`${new Date()} | upsert location_status [${Object.keys(total).length}] items`);
				const alarms = await getAllReservedAlarm();
				const alarmMap = alarms.reduce((acc, cur) => {
					acc[cur.target_id] = cur;
					return acc;
				}, {});
				const done = [];
				for (let user in total)
					if (alarmMap[user])
						done.push(alarmMap[user]);
				console.log("todo alarm", done);
				for (let id in done)
					if (done[id].slack_id)
						postDM2User(done[id].slack_id, `${done[id].target_id} is online`);
				await deleteReservedAlarm(done.map(x => x.alarm_id));
			} catch(e) {
				console.error(e);
			}
        });
    },
};
