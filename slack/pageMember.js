import { getGls, getGroupId, getGroupUser } from "../DataBase/utils.js";
import { getSeekerId, createView } from "./utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons, BlockDivider, BlockList } from "./block.js";
import { createGroupManageView } from "./pageGroup.js";

export default (app) => {
	app.action("goBackGroupManage", async ({ack, body, client}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await createGroupManageView(seekerId)
			})
		}
	);

	app.action("manageMember", async ({ ack, body, client, logger }) => {
        try {
            await ack();
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await createMemberManageView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });
}

export async function createMemberManageView(groupId) {
	const memberList_ = await getGroupUser(groupId);
	const memberList = memberList_.map(x=>x.target_id);
	console.log(JSON.stringify(memberList));
	return createView([
		...BlockHeader("멤버 관리"),
		...BlockButtons([{text:"< back", value:"뒤로가기", actionId:"goBackGroupManage"}]),
		...BlockDivider(),
		...BlockHeader("등록된 멤버 리스트"),
		...BlockList(memberList),
		...BlockButtons([
			{text:"멤버 추가", value:"멤버 추가", actionId:"addMember"},
			{text:"멤버 삭제", value:"멤버 삭제", actionId:"delMember"},
		]),
	]);
}
