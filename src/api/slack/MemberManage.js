import * as dbGroup from "../../DataBase/dbGroup.js";
import { getClientIntraId, getUserNamebySlackId } from "./utils/data.js";
import { mainHomeView, memberManageHomeView, addMemberModalView, delMemberModalView } from "./views.js";

export default (app) => {

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
		const selectedGroupId = await dbGroup.getSelectedGroupId(seekerId);

		let msg = "";
		if (await dbGroup.getMemberList(selectedGroupId) != "")
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
		const selectedUsersSlackId = view['state']['values'][view.blocks[0].block_id]['selectAddMember']['selected_users'];
		const selectedUsersIntraId = await Promise.all(selectedUsersSlackId.map(x => getUserNamebySlackId(client, x)));
		const seekerId = await getClientIntraId(body, null, client);
		const selectedGroupId = await dbGroup.getSelectedGroupId(seekerId);
		const duplicatedGroupMember = await dbGroup.selectDuplicatedGroupMember(selectedGroupId, selectedUsersIntraId);

		if (duplicatedGroupMember.length != 0) {
			const duplicatedGroupMemberStr = duplicatedGroupMember.map(x => `'${x.targetId}'`).join(", ");
			await ack({response_action:"errors", errors:{
				"multiUsersSelect-groupMember": `${duplicatedGroupMemberStr}는 선택한 그룹에 이미 존재하는 멤버입니다.`
				}});
			return ;
		}
		await ack();
		let msg = "";
		for (const targetId of selectedUsersIntraId) {
			const result = await dbGroup.insertMember(selectedGroupId, targetId); 
			if (result)
				msg = "*성공적으로 추가되었습니다*";
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

	app.view({callback_id:'callbackDelMember', type:'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const selectedMembers = view['state']['values'][view.blocks[0].block_id]['selectDelMember']['selected_options']
		.map((x) => (x.value));
		const seekerId = await getClientIntraId(body, null, client);
		const selectedGroupId = await dbGroup.getSelectedGroupId(seekerId);

		let msg = "";
		for (const targetId of selectedMembers) {
			let result = await dbGroup.deleteMember(selectedGroupId, targetId);
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

