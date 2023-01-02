import * as dbgroup from "../api/DataBase/dbGroup.js.js.js";
import * as db from "../api/DataBase/dbGarbage.js.js.js";
import { getClientIntraId } from "./utils/data.js";
import { isRegisteredGroupName } from "../api/DataBase/dbGroup.js.js.js"
import * as view from "./views.js";

export default (app) => {
    app.action('OpenModalAddGroup', async ({ ack, body, client, logger }) => {
        await ack()
        const seekerId = await getClientIntraId(body, null, client)

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await view.addGroupModalView(),
            });
        } catch (error) {
            logger.error(error)
        }
		// 그룹을 생성한 후 생기는 메시지가 다른 동작을 했을 때 없어지게 하기 위해
		try {
            const result = await client.views.publish({
				user_id: body.user.id,
				view: await view.groupManageHomeView(seekerId),
			});
        } catch (e) {
            logger.error(e);
        }
    });

    app.action("OpenModalDelGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const intraId = await getClientIntraId(body, null, client);
		
		let msg = "";
		if (await dbgroup.getGroupList(intraId) != "")
		{
			try {
				const result = await client.views.open({
					trigger_id: body.trigger_id,
					view: await view.delGroupModalView(intraId),
				});
			} catch (error) {
				logger.error(error);
			}
		}
		else msg = ">생성된 그룹이 없습니다!\n>'그룹 생성' 버튼을 눌러 새로운 그룹을 생성해보세요."
		+ "\n\n*삭제할 수 있는 그룹이 없습니다.*";
		try {
            const result = await client.views.update({
				view_id: body.view.id,
				view: await view.groupManageHomeView(intraId, msg),
			});
        } catch (e) {
            logger.error(e);
        }
    });

    app.action("OpenModalModifyGroupName", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getClientIntraId(body, null, client);

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await view.modifyGroupNameModalView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
		try {
            const result = await client.views.publish({
				user_id: body.user.id,
				view: await view.groupManageHomeView(seekerId),
			});
        } catch (e) {
            logger.error(e)
        }
    })

    app.action('OpenModalDelGroup', async ({ ack, body, client, logger }) => {
        await ack()
        const seekerId = await getClientIntraId(body, null, client)

	app.action("selectDelGroup", async ({ ack, body, client, logger}) => {
		await ack();
	});
	
	app.view({callback_id: 'callbackAddGroup', type: 'view_submission'}, async ({ack, body, view, client, logger}) => {
		const inputVal = view['state']['values'][view.blocks[0].block_id]["writeAddGroupName"]['value'];
        const intraId = await getClientIntraId(body, null, client);
		
		let msg = "";
		if (await isRegisteredGroupName(intraId, inputVal)) {
			await ack({response_action:"errors", errors:{
				"textInput-groupName": "이미 존재하는 그룹의 이름입니다."
			  }});
			return ;
		}
		await ack();
		const result = await dbgroup.insertGroup(intraId, inputVal);
		if (result)
			msg = "*성공적으로 생성되었습니다*";
		try {
			const result = await client.views.publish({
				user_id: body.user.id,
				view: await view.groupManageHomeView(intraId, msg),
			});
		} catch (e) {
			logger.error(e);
		}
	});
	
	app.view({callback_id:'callbackDelGroup', type: 'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]["selectDelGroup"]['selected_option'].value;
        const intraId = await getClientIntraId(body, null, client);
		
		let msg = '';
		const result = await dbgroup.deleteGroup(intraId, inputVal);
		if (result)
			msg = "*성공적으로 삭제되었습니다*";
		try {
			const result = await client.views.publish({
				user_id: body.user.id,
				view: await view.groupManageHomeView(intraId, msg),
			});
		} catch (e) {
			logger.error(e);
		}
	});

	app.view({callback_id: 'callbackModifyGroupName', type: 'view_submission'}, async ({ack, body, view, client, logger}) => {
		await ack();
		const modyfyGroupId = view['state']['values'][view.blocks[0].block_id]["selectModifyNameGroup"]["selected_option"]['value'];
		const modyfyGroupName = view['state']['values'][view.blocks[1].block_id]["writeModifyGroupName"]['value'];
		const seekerId = await getClientIntraId(body, null, client);
		let msg = "";
		const result = await dbgroup.updateGroupName(modyfyGroupId, modyfyGroupName);
		if (result)
			msg = "*성공적으로 수정되었습니다*";
		try {
			const result = await client.views.publish({
				user_id: body.user.id,
				view: await view.groupManageHomeView(seekerId, msg),
			});
		} catch (e) {
			logger.error(e);
		}
	});

            try {
                const result = await client.views.open({
                    trigger_id: body.trigger_id,
                    view: await modifyGroupNameModalView(seekerId),
                })
            } catch (error) {
                logger.error(error)
            }
            try {
                const result = await client.views.publish({
                    user_id: body.user.id,
                    view: await groupManageHomeView(seekerId),
                })
            } catch (e) {
                logger.error(e)
            }
        }
    )

}
