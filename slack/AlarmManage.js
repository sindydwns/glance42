import { getAlarmList, insertAlarm,  deleteAlarm } from "../DataBase/utils.js";
import { getClientIntraId, getUserNamebySlackId} from "./utils/data.js";
import { alarmManageHomeView, addAlarmModalView, delAlarmModalView } from "./views.js";

export default (app) => {
	
	app.action("OpenModalAddAlarm", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getClientIntraId(body, null, client);

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
        const intraId = await getClientIntraId(body, null, client);

		let msg = "";
		if (await getAlarmList(intraId) != "")
		{
			try {
				const result = await client.views.open({
					trigger_id: body.trigger_id,
					view: await delAlarmModalView(intraId),
				});
			} catch (error) {
				logger.error(error);
			}
		}
		else msg = ">등록된 알람이 없습니다!\n>'알람 추가' 버튼을 눌러 새로운 알람을 등록해보세요."
		+ "\n\n*삭제할 수 있는 알람이 없습니다.*";
		try {
            await client.views.update({
                view_id: client.previous_view_id,
                view: await alarmManageHomeView(intraId, msg),
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
        const intraId = await getClientIntraId(body, null, client);
		
		let msg = "";
		// 반복문으로 targetId 배열을 만들고 insertAlarm 을 실행하는 방식으로 수정필요.
		for (const slackId of selectedUsers) {
			const targetId = await getUserNamebySlackId(client, slackId);
			const result = await insertAlarm(intraId, targetId);
			if (result)
				msg = "*성공적으로 추가되었습니다*";
		}
		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await alarmManageHomeView(intraId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

	app.view({callback_id: 'callbackDelAlarm', type: 'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const selectedAlarms = view['state']['values'][view.blocks[0].block_id]['submitDelAlarm']['selected_options']
		.map((x) => (x.value));
        const intraId = await getClientIntraId(body, null, client);
		
		let msg = "";
		const result = await deleteAlarm(intraId, selectedAlarms);
		if (result)
			msg = "*성공적으로 삭제되었습니다*";
		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await alarmManageHomeView(intraId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

}

