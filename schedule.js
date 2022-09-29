import _schedule from "node-schedule";
import api42 from "./api42.js";
import { setAllLocationTable } from "./DataBase/utils.js";

export const schedule = {
    loadLocations: (delay) => {
		if (delay == null)
			return ;
        _schedule.scheduleJob(`*/${+delay} * * * * *`, async () => {
			const campusId = 29;
			const path = `/v2/campus/${campusId}/locations`;
			try {
				console.log(`upsert location_status | ${new Date()}`);
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
				console.log(`upsert location_status [${Object.keys(total).length}] items | ${new Date()}`);
			} catch(e) {
				console.error(e);
			}
        });
    }
};
