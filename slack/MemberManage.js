import { getMemberList, insertMember, deleteMember, getSelectedGroupId } from "../DataBase/utils.js";
import { getClientIntraId, getUserNamebySlackId } from "./utils/data.js";
import { mainHomeView, memberManageHomeView, addMemberModalView, delMemberModalView } from "./views.js";

export default (app) => {

	// app.action("selectGroupforMemberManage", async ({ack, body, client, logger}) => {
    //     try {
    //         await ack();
    //    	 	const selected = body.actions[0].selected_option;
	// 		const selectedGroup = {text: selected.text.text, value: selected.value};
	// 		const seekerId = await getClientIntraId(body, null, client);
			
	// 		if (selectedGroup.value != "No-option")
	// 		{
	// 			await client.views.update({
	// 				view_id: body.view.id,
	// 				hash: body.view.hash,
	// 				view: await memberManageHomeView(seekerId, selectedGroup),
	// 			});
	// 		}
    //     } catch (error) {
    //         logger.error(error);
    //     }
	// })
	
	app.action("OpenModalAddMember", async ({ ack, body, client, logger }) => {
        await ack();
		const seekerId = await getClientIntraId(body, null, client);

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await addMemberModalView()
            });
        } catch (error) {
            logger.error(error);
        }
		try {
            const result = await client.views.publish({
                user_id: body.user.id,
				view: await mainHomeView(seekerId),
			});
        } catch (e) {
            logger.error(e);
        }
    });

	app.action("OpenModalDelMember", async ({ ack, body, client, logger }) => {
        await ack();
		const seekerId = await getClientIntraId(body, null, client);
		const selectedGroupId = await getSelectedGroupId(seekerId);

		let msg = "";
		if (await getMemberList(selectedGroupId) != "")
		{
			try {
				const result = await client.views.open({
					trigger_id: body.trigger_id,
					view: await delMemberModalView(selectedGroupId),
				});
			} catch (error) {
				logger.error(error);
			}
		}
		else msg = "*삭제할 수 있는 멤버가 없습니다*";
		try {
            const result = await client.views.publish({
                user_id: body.user.id,
				view: await mainHomeView(seekerId, null, msg),
			});
        } catch (e) {
            logger.error(e);
        }
    });

	app.view({callback_id:'callbackAddMember', type:'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const selectedUsers = view['state']['values'][view.blocks[0].block_id]['submitAddMember']['selected_users'];
		const seekerId = await getClientIntraId(body, null, client);
		const selectedGroupId = await getSelectedGroupId(seekerId);

		let msg = "";
		for (const slackId of selectedUsers) {
			const targetId = await getUserNamebySlackId(client, slackId);
			const result = await insertMember(selectedGroupId, targetId); 
			if (result)
				msg = "*성공적으로 추가되었습니다*";
		}
		try {
            const seekerId = await getClientIntraId(body, null, client);
            const result = await client.views.publish({
                user_id: body.user.id,
				view: await mainHomeView(seekerId, null, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

	app.view({callback_id:'callbackDelMember', type:'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const selectedMembers = view['state']['values'][view.blocks[0].block_id]['submitDelMember']['selected_options']
		.map((x) => (x.value));
		const seekerId = await getClientIntraId(body, null, client);
		const selectedGroupId = await getSelectedGroupId(seekerId);

		let msg = "";
		for (const targetId of selectedMembers) {
			let result = await deleteMember(selectedGroupId, targetId);
			if (result)
				msg = "*성공적으로 삭제되었습니다*";
		}
		try {
            const result = await client.views.publish({
                user_id: body.user.id,
				view: await mainHomeView(seekerId, null, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

}

