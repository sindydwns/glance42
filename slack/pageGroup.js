import { getGls, getGroupId, getGroupUser } from "../DataBase/utils.js";
import { getSeekerId, createView } from "./utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons, BlockDivider, BlockList, ModalTemplate } from "./block.js";
import { createHomeView } from "./pageHome.js";
import { createMemberManageView } from "./pageMember.js";

export default (app) => {
	app.action("goBackHome", async ({ack, body, client, logger}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await createHomeView(seekerId)
			})
		}
	);

    app.action("addGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);
        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: ModalTemplate(
                    "그룹 추가",
                    "추가할 그룹을 입력해주세요",
                    null,
                    "modalAddGroup"
                ),
            });
            // logger.info(result);
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("delGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);
        const gls = await getGls(seekerId);
        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: ModalTemplate(
                    "그룹 삭제",
                    "삭제할 그룹을 선택해주세요.",
                    gls.map((v) => ({ title: v.group_name, value: v.group_id, selected: v.selected })),
                    "modalDelGroup"
                ),
            });
            // logger.info(result);
        } catch (error) {
            logger.error(error);
        }
    })

    app.action("modalAddGroup", async ({ ack, body, client, logger }) => {
        await ack();
        console.log("hi!");
    })

    app.action("modalDelGroup", async ({ ack, body, client, logger }) => {
        await ack();
        console.log("hi!");
    })

	app.action("goPageMember", async ({ack, body, client}) => {
		await ack();
		const groupId = '1';
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await createMemberManageView(groupId)
		})
	});
};

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
			{text:"멤버 관리", value:"멤버 관리", actionId:"goPageMember"}
		]),
	]));
}