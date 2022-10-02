import { getAlarmList, addAlarm,  delAlarm } from "../DataBase/utils.js";
import { getSeekerId, getUserNamebySlackId} from "./utils/data.js";
import { alarmManageHomeView, addAlarmModalView, delAlarmModalView } from "./views.js";

export default (app) => {
	
	app.action("OpenModalAddAlarm", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await addAlarmModalView()
            });
        } catch (error) {
            logger.error(error);
        }
		try {
            await client.views.update({
                view_id: client.previous_view_id,
                view: await alarmManageHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("OpenModalDelAlarm", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);
        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await delAlarmModalView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
		try {
            await client.views.update({
                view_id: client.previous_view_id,
                view: await alarmManageHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.action("validCheck-SelectUser", async ({ ack, body, client, logger}) => {
		await ack();
		console.log("Maybe this is for error check of selected value?");
		// 선택한 워크스페이스 유저에 대한 valid check하기 (user_list에 속한 id인지 확인)
	});

	app.view({callback_id:'callbackAddAlarm', type:'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const selectedUsers = view['state']['values'][view.blocks[0].block_id]['submitAddAlarm']['selected_users'];
        const seekerId = await getSeekerId(body, null, client);
		
		let msg = "";
		for (const slackId of selectedUsers) {
			const targetId = await getUserNamebySlackId(client, slackId);
			const result = await addAlarm(seekerId, targetId); 
			if (result)
				msg = "*알람이 정상적으로 등록되었습니다*";
		}
		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await alarmManageHomeView(seekerId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

	app.view({callback_id: 'callbackDelAlarm', type: 'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]['submitDelAlarm']['selected_options']
		.map((x) => (x.value));
        const seekerId = await getSeekerId(body, null, client);
		
		let msg = "";
		for (const targetId of inputVal) {
			let result = await delAlarm(seekerId, targetId);
			if (result)
				msg = "*알람이 정상적으로 삭제되었습니다*";
		}
		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await alarmManageHomeView(seekerId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

}

