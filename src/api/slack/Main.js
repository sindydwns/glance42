import * as dbUser from "../api/DataBase/dbUser.js.js.js.js";
import * as dbgroup from "../api/DataBase/dbGroup.js.js.js";
import { getClientIntraId, getUserNamebySlackId, getClientSlackId } from "./utils/data.js";
import * as view from "./views.js";
import { encrypt } from "../utils.js.js.js";

export default (app) => {
    app.event("app_home_opened", async ({ event, client, logger }) => {
        try {
            const clientSlackId = body ? body.user.id : event.user;
			const clientDisplayName = await getUserNamebySlackId(client, clientSlackId);
			const userInfo = await dbUser.getUserInfo(clientDisplayName);
            const intraId = await getClientIntraId(null, event, client);

			let view;
			if (clientSlackId == userInfo?.slack_id)
				view = await view.mainHomeView(intraId);
			else
				view = await view.notRegisteredHomeView(encrypt(clientSlackId));
            const result = await client.views.publish({
                user_id: event.user,
                view: view,
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("requestAuth", async ({ ack, body, client, logger }) => {
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await view.requestRegisterHomeView(),
		})
	});
	
    app.action("selectGlanceTarget", async ({ ack, body, client, logger }) => {
        await ack();
        const selected = body.actions[0].selected_option;
        const intraId = await getClientIntraId(body, null, client);

		if (selected.value == "usersFromWorkspace")
		{
			await dbgroup.updateSelectedGroup(intraId, null);
			try {
				const result = await client.views.open({
					trigger_id: body.trigger_id,
					view: await view.selectUserFromWorkspaceModalView(),
				});
			} catch (error) {
				logger.error(error);
			}
		}
		else {
			await dbgroup.updateSelectedGroup(intraId, selected.value);
        	await client.views.update({
				view_id: body.view.id,
				hash: body.view.hash,
				view: await view.mainHomeView(intraId),
			});
		}
    });

	app.view({callback_id:'callbackSelectUserFromWorkspace', type:'view_submission'}, async ({ ack, body, view, client, logger }) => {
		await ack();
		const selectedUsers = view['state']['values'][view.blocks[0].block_id]['selectGlanceUser']['selected_users'];
        const seekerId = await getClientIntraId(body, null, client);

		let targetIds = [];
		for (const slackId of selectedUsers) {
			const targetId = await getUserNamebySlackId(client, slackId);
			targetIds.push(targetId);
		}
		try {
			const result = await client.views.publish({
				user_id: body.user.id,
				view: await view.mainHomeView(seekerId, targetIds),
			});
		} catch (e) {
			logger.error(e);
		}
	});

    app.action("selectGlanceUser", async ({ ack, body, client, logger }) => {
		await ack();
		// const selectedUsers = view['state']['values'][view.blocks[0].block_id];
		console.log("유저 하나 선택...");
	});

	app.action("goMainView", async ({ack, body, client}) => {
		await ack();
		const seekerId = await getClientIntraId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await view.mainHomeView(seekerId)
			})
		}
	);

    app.action("goGroupManageView", async ({ ack, body, client, logger }) => {
        try {
            await ack();
            const seekerId = await getClientIntraId(body, null, client);
			
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await view.groupManageHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.action("goAlarmManageView", async ({ack, body, client, logger}) => {
		await ack();
		const seekerId = await getClientIntraId(body, null, client);

		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view : await view.alarmManageHomeView(seekerId),
		});
	})
	
	// app.action("goMemberManageView", async ({ack, body, client}) => {
	// 	await ack();
	// 	const seekerId = await getClientIntraId(body, null, client);
	// 	await client.views.update({
	// 		view_id: body.view.id,
	// 		hash: body.view.hash,
	// 		view: await view.memberManageHomeView(seekerId)
	// 	})
	// });

    app.action("goManualView", async ({ ack, body, client, logger }) => {
        try {
            await ack();
			
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await view.manualHomeView(),
            });
        } catch (error) {
            logger.error(error);
        }
    });

};
