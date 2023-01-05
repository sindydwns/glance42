import * as dbAlarm from "../api/DataBase/dbAlarm.js.js.js";
import { selectDuplicatedAlarm } from "../api/DataBase/dbAlarm.js.js.js";
import { getClientIntraId, getUserNamebySlackId } from "./utils/data.js";
import * as view from "./views.js";

export default (app) => {
	
	app.action("OpenModalAddAlarm", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getClientIntraId(body, null, client);

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await view.addAlarmModalView()
            });
        } catch (error) {
            logger.error(error);
        }
		try {
            await client.views.publish({
                user_id: body.user.id,
                view: await view.alarmManageHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("OpenModalDelAlarm", async ({ ack, body, client, logger }) => {
        await ack();
        const intraId = await getClientIntraId(body, null, client);

		let msg = "";
		if (await dbAlarm.getAlarmList(intraId) != "")
		{
			try {
				const result = await client.views.open({
					trigger_id: body.trigger_id,
					view: await view.delAlarmModalView(intraId),
				});
			} catch (error) {
				logger.error(error);
			}
		}
		else msg = ">등록된 알람이 없습니다!\n>'알람 추가' 버튼을 눌러 새로운 알람을 등록해보세요."
		+ "\n\n*삭제할 수 있는 알람이 없습니다.*";
		try {
            await client.views.publish({
                user_id: body.user.id,
                view: await view.alarmManageHomeView(intraId, msg),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.view({callback_id:'callbackAddAlarm', type:'view_submission'}, async ({ack, body, view, client, logger}) => {
		const selectedUsersSlackId = view['state']['values'][view.blocks[0].block_id]['selectAddAlarm']['selected_users'];
		const selectedUsersIntraId = await Promise.all(selectedUsersSlackId.map(x => getUserNamebySlackId(client, x)));
        const intraId = await getClientIntraId(body, null, client);
		const duplicatedAlarm = await selectDuplicatedAlarm(intraId, selectedUsersIntraId);

		if (duplicatedAlarm.length != 0) {
			const duplicatedAlarmStr = duplicatedAlarm.map(x => `'${x.target_id}'`).join(", ");
			await ack({response_action:"errors", errors:{
				"multiUsersSelect-alarm": `${duplicatedAlarmStr}는 이미 등록된 알람입니다.`
				}});
			return ;
		}
		await ack();
		let msg = "";
		for (const targetId of selectedUsersIntraId) {
			const result = await dbAlarm.insertAlarm(intraId, targetId); 
			if (result)
				msg = "*성공적으로 추가되었습니다*";
		}
		try {
            const result = await client.views.publish({
				user_id: body.user.id,
				view: await view.alarmManageHomeView(intraId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

	app.view({callback_id: 'callbackDelAlarm', type: 'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const selectedAlarms = view['state']['values'][view.blocks[0].block_id]['selectDelAlarm']['selected_options']
		.map((x) => (x.value));
        const intraId = await getClientIntraId(body, null, client);
		
		let msg = "";
		const result = await dbAlarm.deleteAlarm(intraId, selectedAlarms);
		if (result)
			msg = "*성공적으로 삭제되었습니다*";
		try {
            const result = await client.views.publish({
				user_id: body.user.id,
				view: await view.alarmManageHomeView(intraId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

}

