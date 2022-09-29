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
			view: createHomeView(seekerId)
			})
		}
	);
}

export async function createMemberManageView(seekerId, groupId) {
	// let memberList = await getGroupUser(groupId);
	return createView([
		...BlockHeader("멤버 관리"),
		...BlockButtons([{text:"< back", value:"뒤로가기", actionId:"goBackHome"}]),
		...BlockDivider(),
		...BlockHeader("등록된 멤버 리스트"),
		...BlockList(["a","b","c","n"]),
		...BlockButtons([
			{text:"멤버 추가", value:"멤버 추가", actionId:"addMember"},
			{text:"멤버 삭제", value:"멤버 삭제", actionId:"delMember"},
		]),
	]);
}
