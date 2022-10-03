import { getMemberList, insertMember, deleteMember } from "../DataBase/utils.js";
import { getSeekerId, getUserNamebySlackId } from "./utils/data.js";
import { memberManageHomeView, addMemberModalView, delMemberModalView } from "./views.js";

export default (app) => {

	app.action("selectGroupforMemberManage", async ({ack, body, client, logger}) => {
        try {
            await ack();
       	 	const selected = body.actions[0].selected_option;
			const selectedGroup = {text: selected.text.text, value: selected.value};
			const seekerId = await getSeekerId(body, null, client);
			
			if (selectedGroup.value != "No-option")
			{
				await client.views.update({
					view_id: body.view.id,
					hash: body.view.hash,
					view: await memberManageHomeView(seekerId, selectedGroup),
				});
				client.selected_group = selectedGroup;
			}
        } catch (error) {
            logger.error(error);
        }
	})
	
	app.action("OpenModalAddMember", async ({ ack, body, client, logger }) => {
        await ack();
		const selectedGroup = client.selected_group;
		const seekerId = await getSeekerId(body, null, client);

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await addMemberModalView()
            });
        } catch (error) {
            logger.error(error);
        }
		try {
            const result = await client.views.update({
                view_id: client.previous_view_id,
				view: await memberManageHomeView(seekerId, selectedGroup),
			});
        } catch (e) {
            logger.error(e);
        }
    });

	app.action("OpenModalDelMember", async ({ ack, body, client, logger }) => {
        await ack();
		const selectedGroup = client.selected_group;
		const seekerId = await getSeekerId(body, null, client);

		let msg = "";
		if (await getMemberList(selectedGroup.value) != "")
		{
			try {
				const result = await client.views.open({
					trigger_id: body.trigger_id,
					view: await delMemberModalView(selectedGroup.value),
				});
			} catch (error) {
				logger.error(error);
			}
		}
		else msg = ">선택한 그룹에 등록된 멤버가 없습니다!\n>'멤버 추가' 버튼을 눌러 새로운 멤버를 추가해보세요."
		+ "\n\n*삭제할 수 있는 멤버가 없습니다.*";
		try {
            const result = await client.views.update({
                view_id: client.previous_view_id,
				view: await memberManageHomeView(seekerId, selectedGroup, msg),
			});
        } catch (e) {
            logger.error(e);
        }
    });
	app.view({callback_id:'callbackAddMember', type:'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const selectedUsers = view['state']['values'][view.blocks[0].block_id]['submitAddMember']['selected_users'];
		const selectedGroup = client.selected_group;
		
		let msg = "";
		for (const slackId of selectedUsers) {
			const targetId = await getUserNamebySlackId(client, slackId);
			const result = await insertMember(selectedGroup.value, targetId); 
			if (result)
				msg = "*성공적으로 추가되었습니다*";
		}
		try {
            const seekerId = await getSeekerId(body, null, client);
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await memberManageHomeView(seekerId, client.selected_group, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

	app.view({callback_id:'callbackDelMember', type:'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]['submitDelMember']['selected_options']
		.map((x) => (x.value));
		const selectedGroup = client.selected_group;
		const seekerId = await getSeekerId(body, null, client);

		let msg = "";
		for (const targetId of inputVal) {
			let result = await deleteMember(selectedGroup.value, targetId);
			if (result)
				msg = "*성공적으로 삭제되었습니다*";
		}
		try {
            const result = await client.views.update({
                view_id: client.previous_view_id,
				view: await memberManageHomeView(seekerId, selectedGroup, msg),
			});
        } catch (e) {
            logger.error(e);
        }
	});

}

