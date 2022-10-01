import { getGls, getSelectedGroupId, getGroupId, getGroupLocationInfo, getGroupUser, SelectGroup, unSelectGroup } from "../DataBase/utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons, BlockDivider, BlockList, BlockLabelButton } from "./block.js";
import { formatCurrentLocationStr, getSeekerId } from "./utils.js";
import { createGroupManageView } from "./pageGroup.js";
import { createAlarmManageView } from "./pageAlarm.js";

export default (app) => {
    app.event("app_home_opened", async ({ event, client, logger }) => {
        try {
            const seekerId = await getSeekerId(null, event, client);

            const result = await client.views.publish({
                user_id: event.user,
                view: await createHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("manageGroup", async ({ ack, body, client, logger }) => {
        try {
            await ack({ response_action: "update" });
            const seekerId = await getSeekerId(body, null, client);
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await createGroupManageView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
		client.previous_view_id = body.view.id;
    });

	app.action("manageAlarm", async ({ack, body, client, logger}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view : await createAlarmManageView(seekerId),
		});
		client.previous_view_id = body.view.id;
	})

    app.action("test-select-id", async ({ ack, body, client, logger }) => {
        await ack();
        const selected = body.actions[0].selected_option;
        const prev = body.actions[0].initial_option;
        let prevGroup = null;

        const selectedGroup = selected.text.text;
        const selectedGroupId = +selected.value;
        const seekerId = await getSeekerId(body, null, client);

        await unSelectGroup(seekerId, prevGroup ? prevGroup : prev ? prev.text.text : selectedGroup);
        await SelectGroup(seekerId, selectedGroup);

        prevGroup = selectedGroup;

        await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: await createHomeView(seekerId),
        });
    });
};

export async function createHomeView(seekerId) {
	const gls = await getGls(seekerId);
	const groupId = await getSelectedGroupId(seekerId);
	const locationInfo = await getGroupLocationInfo(seekerId, groupId);
	const currentLocationStr = formatCurrentLocationStr(locationInfo);
	return {
		type: "home",
		blocks: [
			...BlockHeader("👀 염탐하기"),
			...BlockSelect(
				"염탐할 그룹을 선택해주세요",
				gls.map((v) => ({ title: v.group_name, value: v.group_id, selected: v.selected })),
				"test-select-id"
			),
			...BlockMrkdwn([currentLocationStr]),
			...BlockHeader("⚙️ 설정"),
			...BlockButtons([
				{
					text: "그룹관리",
					actionId: "manageGroup",
					value: "manageGroup",
				},
				{
					text: "알람 설정",
					actionId: "manageAlarm",
					value: "manageAlarm",
				},
			]),
			...BlockDivider(),
			...BlockLabelButton("사용방법을 모르시겠나요? 이쪽을 참고하세요! 📚", "Help", "button-action"),
		],
	};
}
