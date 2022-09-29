import { getGls, getGroupId, getGroupUser } from "../DataBase/utils.js";
import { getSeekerId, createView } from "./utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons, BlockDivider, BlockList } from "./block.js";
import { createHomeView } from "./pageHome.js";

export default (app) => {
	app.action("goBackHome", async ({ack, body, client, logger }) => {
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

export async function createGroupManageView(seekerId) {
	const gls_ = await getGls(seekerId);
	const gls = gls_.map(x=>x.group_name);
	return (createView([
		...BlockHeader("그룹 관리"),
		...BlockButtons([{text:"< back", value:"뒤로가기", actionId:"goBackHome"}]),
		...BlockDivider(),
		...BlockHeader("등록된 그룹 리스트"),
		...BlockList(gls),
		...BlockButtons([
			{text:"그룹 추가", value:"그룹 추가", actionId:"addGroup"},
			{text:"그룹 삭제", value:"그룹 삭제", actionId:"delGroup"},
			{text:"멤버 관리", value:"멤버 관리", actionId:"selectGroup"}
		]),
	]));
}
