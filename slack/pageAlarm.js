import { getGls, getGroupId, getGroupUser, getAlarmList } from "../DataBase/utils.js";
import { getSeekerId, createView } from "./utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons, BlockDivider, BlockList } from "./block.js";
import { createHomeView } from "./pageHome.js";

export default (app) => {
	app.action("goBackHome", async ({ack, body, client}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await createHomeView(seekerId)
			})
		}
	);
}

export async function createAlarmManageView(seekerId) {
	const alarmList_ = await getAlarmList(seekerId);
	const alarmList = alarmList_.map(x=>x.target_id);
	return createView([
		...BlockHeader("알람 설정"),
		...BlockButtons([{text:"< back", value:"뒤로가기", actionId:"goBackHome"}]),
		...BlockDivider(),
		...BlockHeader("등록된 알람 리스트"),
		...BlockList(alarmList),
		...BlockButtons([
			{text:"알람 추가", value:"알람 추가", actionId:"addAlarm"},
			{text:"알람 삭제", value:"알람 삭제", actionId:"delAlarm"},
		]),
	]);
}
