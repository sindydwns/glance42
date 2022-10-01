import { getGls, addGroup, delGroup } from "../DataBase/utils.js";
import { getSeekerId } from "./utils/data.js";
import { mainHomeView, groupManageHomeView, memberManageHomeView, addGroupModalView, delGroupModalView } from "./views.js";

export default (app) => {

	app.action("goMainView", async ({ack, body, client, logger}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await mainHomeView(seekerId)
			})
		}
	);

	app.action("goMemberView", async ({ack, body, client}) => {
		await ack();
		const groupId = '1';
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await memberManageHomeView(groupId)
		})
	});

    app.action("OpenModalAddGroup", async ({ ack, body, client, logger }) => {
        await ack();

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await addGroupModalView(),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.action("callbackAddGroup", async ({ ack, body, client, logger}) => {
		await ack();
		console.log("Maybe this is for error check of selected value?");
		console.log("이미 추가한 그룹명과 겹치는지 확인");
		// 적은 그룹 이름에 대한 valid check하기 (이미 있는 그룹명과 중복되지 않는지 확인)
	});
	
	app.view({callback_id: 'callbackAddGroup', type: 'view_submission' }, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]["submitAddGroup"]['value'];
        const seekerId = await getSeekerId(body, null, client);
		
		let msg = "";
		const result = await addGroup(seekerId, inputVal);
		if (result)
			msg = "*그룹이 정상적으로 추가되었습니다*";
		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await groupManageHomeView(seekerId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

	app.view({callback_id: 'callbackAddGroup', type: 'view_closed' }, async ({ ack, body, view, client, logger }) => {
		await ack();
		try {
            const seekerId = await getSeekerId(body, null, client);
            await client.views.update({
                view_id: client.previous_view_id,
                view: await groupManageHomeView(seekerId, ""),
            });
        } catch (error) {
            logger.error(error);
        }
	});
	
    app.action("OpenModalDelGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);
		
        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await delGroupModalView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.action("submitDelGroup", async ({ ack, body, client, logger}) => {
		await ack();
		console.log("Maybe this is for error check of selected value?");
		// 그룹 삭제에 대한 경고하기 (정말 지우시겠습니까?)
	});

	app.view({callback_id: 'callbackDelGroup', type: 'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]["submitDelGroup"]['selected_option']['text']['text'];
        const seekerId = await getSeekerId(body, null, client);

		let msg = '';
		const result = await delGroup(seekerId, inputVal);
		if (result)
			msg = "*그룹이 정상적으로 삭제되었습니다*";
		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await groupManageHomeView(seekerId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

	app.view({callback_id: 'callbackDelGroup', type: 'view_closed' }, async ({ ack, body, view, client, logger }) => {
		await ack();
		try {
            const seekerId = await getSeekerId(body, null, client);
            await client.views.update({
                view_id: client.previous_view_id,
                view: await groupManageHomeView(seekerId, ""),
            });
        } catch (error) {
            logger.error(error);
        }
	});
};
