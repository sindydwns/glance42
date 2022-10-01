import { getAlarmList, addAlarm,  delAlarm } from "../DataBase/utils.js";
import { getSeekerId, createView, getUserNamebySlackId} from "./utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons, BlockDivider, BlockList, ModalTemplate, ModalSelectUser, ModalMultiSelectList } from "./block.js";
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
	
	app.action("OpenModalAddAlarm", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await ModalSelectUser(
                    "알람 추가",
                    "워크스페이스에서 유저를 선택해주세요. \n (물론, 카뎃만 선택 가능합니다!)",
                    "callbackAddAlarm"
                ),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.action("userSelectAction", async ({ ack, body, client, logger}) => {
		await ack();
		console.log("Maybe this is for error check of selected value?");
		// 선택한 워크스페이스 유저에 대한 valid check하기 (user_list에 속한 id인지 확인)
	});

	app.view({ callback_id: 'callbackAddAlarm', type: 'view_submission' }, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]['userSelectAction']['selected_user'];
        const seekerId = await getSeekerId(body, null, client);
		
		const targetId = await getUserNamebySlackId(client, inputVal);
		const result = await addAlarm(seekerId, targetId);
		try {
            const seekerId = await getSeekerId(body, null, client);
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await createAlarmManageView(seekerId),
			});
        } catch (e) {
            logger.error(e);
        }
	});

    app.action("OpenModalDelAlarm", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);
        const als = await getAlarmList(seekerId);
        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await ModalMultiSelectList(
                    "알람 삭제",
                    "삭제할 알람을 선택해주세요.",
                    als.map((v) => ({text: v.target_id, value: v.target_id})),
                    "callbackDelAlarm"
                ),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.view({ callback_id: "callbackDelAlarm", type: 'view_submission' }, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]['MultiSelectAction']['selected_options']
		.map((x) => (x.value));
        const seekerId = await getSeekerId(body, null, client);
		let result;

		for (const targetId of inputVal) {
			result = await delAlarm(seekerId, targetId);
		}
		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await createAlarmManageView(seekerId),
			});
        } catch (e) {
            logger.error(e);
        }
	});
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
			{text:"알람 추가", value:"알람 추가", actionId:"OpenModalAddAlarm"},
			{text:"알람 삭제", value:"알람 삭제", actionId:"OpenModalDelAlarm"},
		]),
	]);
}
