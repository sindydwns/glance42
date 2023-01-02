import { getGroupList, insertGroup, deleteGroup } from "../DataBase/utils.js";
import { getClientIntraId } from "./utils/data.js";
import { groupManageHomeView, addGroupModalView, delGroupModalView } from "./views.js";

export default (app) => {

    app.action("OpenModalAddGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getClientIntraId(body, null, client);

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await addGroupModalView(),
            });
        } catch (error) {
            logger.error(error);
        }
		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await groupManageHomeView(seekerId),
			});
        } catch (e) {
            logger.error(e);
        }
    });

    app.action("OpenModalDelGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const intraId = await getClientIntraId(body, null, client);
		
		let msg = "";
		if (await getGroupList(intraId) != "")
		{
			try {
				const result = await client.views.open({
					trigger_id: body.trigger_id,
					view: await delGroupModalView(intraId),
				});
			} catch (error) {
				logger.error(error);
			}
		}
		else msg = ">생성된 그룹이 없습니다!\n>'그룹 생성' 버튼을 눌러 새로운 그룹을 생성해보세요."
		+ "\n\n*삭제할 수 있는 그룹이 없습니다.*";
		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await groupManageHomeView(intraId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
    });

	app.action("writeAddGroupName", async ({ ack, body, client, logger}) => {
		await ack({response_action:"errors", errors:"에러메세지"});
		console.log("Maybe this is for error check of selected value?");
		// 적은 그룹 이름에 대한 valid check하기 (이미 있는 그룹명과 중복되지 않는지 확인)
	});

	app.action("submitDelGroup", async ({ ack, body, client, logger}) => {
		await ack();
		console.log("정말 지우시겠습니까");
		// 그룹 삭제에 대한 경고하기 (정말 지우시겠습니까?)
	});
	
	app.view({callback_id: 'callbackAddGroup', type: 'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]["writeAddGroupName"]['value'];
        const intraId = await getClientIntraId(body, null, client);
		
		let msg = "";
		const result = await insertGroup(intraId, inputVal);
		if (result)
			msg = "*성공적으로 생성되었습니다*";
		try {
			const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await groupManageHomeView(intraId, msg),
			});
		} catch (e) {
			logger.error(e);
		}
	});
	
	app.view({callback_id:'callbackDelGroup', type: 'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]["submitDelGroup"]['selected_option'].value;
        const intraId = await getClientIntraId(body, null, client);
		
		let msg = '';
		const result = await deleteGroup(intraId, inputVal);
		if (result)
			msg = "*성공적으로 삭제되었습니다*";
		try {
			const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await groupManageHomeView(intraId, msg),
			});
		} catch (e) {
			logger.error(e);
		}
	});
}
