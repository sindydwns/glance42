import * as dbUser from "../../DataBase/dbUser.js";
import * as dbGroup from "../../DataBase/dbGroup.js";
import {
	getClientIntraId,
	getUserNamebySlackId,
	getClientSlackId,
} from "./utils/data.js";
import {
	mainHomeView,
	notRegisteredHomeView,
	requestRegisterHomeView,
	groupManageHomeView,
	alarmManageHomeView,
	memberManageHomeView,
	manualHomeView,
	selectUserFromWorkspaceModalView,
} from "./views.js";
import { encrypt } from "../../utils/crypto.js";

export default (app) => {
	app.event("app_home_opened", async ({ event, client, logger }) => {
		try {
			const clientSlackId = await getClientSlackId(null, event, client);
			const clientDisplayName = await getUserNamebySlackId(
				client,
				clientSlackId
			);
			const userInfo = await dbUser.getUserInfo(clientDisplayName);
			const intraId = await getClientIntraId(null, event, client);
			let view;
	
			if (process.env.DEV_MODE)
				await dbUser.registerNewClient(clientDisplayName, clientSlackId);
			if (clientSlackId == userInfo?.slackId)
				view = await mainHomeView(intraId);
			else view = await notRegisteredHomeView(encrypt(clientSlackId));
			const result = await client.views.publish({
				user_id: event.user,
				view,
			});
		} catch (error) {
			logger.error(error);
		}
	});

	app.action("requestAuth", async ({ ack, body, client, logger }) => {
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await requestRegisterHomeView(),
		});
	});

	app.action("selectGlanceTarget", async ({ ack, body, client, logger }) => {
		await ack();
		const selected = body.actions[0].selected_option;
		const intraId = await getClientIntraId(body, null, client);

		if (selected.value == "usersFromWorkspace") {
			await dbGroup.updateSelectedGroup(intraId, null);
			try {
				const result = await client.views.open({
					trigger_id: body.trigger_id,
					view: await selectUserFromWorkspaceModalView(),
				});
			} catch (error) {
				logger.error(error);
			}
		} else {
			await dbGroup.updateSelectedGroup(intraId, selected.value);
			await client.views.update({
				view_id: body.view.id,
				hash: body.view.hash,
				view: await mainHomeView(intraId),
			});
		}
	});

	app.view(
		{
			callback_id: "callbackSelectUserFromWorkspace",
			type: "view_submission",
		},
		async ({ ack, body, view, client, logger }) => {
			await ack();
			const selectedUsers =
				view.state.values[view.blocks[0].block_id].selectGlanceUser
					.selected_users;
			const seekerId = await getClientIntraId(body, null, client);

			const targetIds = [];

			for (const slackId of selectedUsers) {
				const targetId = await getUserNamebySlackId(client, slackId);

				targetIds.push(targetId);
			}
			try {
				const result = await client.views.publish({
					user_id: body.user.id,
					view: await mainHomeView(seekerId, targetIds),
				});
			} catch (e) {
				logger.error(e);
			}
		}
	);

	app.action("selectGlanceUser", async ({ ack, body, client, logger }) => {
		await ack();
		// const selectedUsers = view['state']['values'][view.blocks[0].block_id];
		console.log("유저 하나 선택...");
	});

	app.action("goMainView", async ({ ack, body, client }) => {
		await ack();
		const seekerId = await getClientIntraId(body, null, client);

		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await mainHomeView(seekerId),
		});
	});

	app.action("goGroupManageView", async ({ ack, body, client, logger }) => {
		try {
			await ack();
			const seekerId = await getClientIntraId(body, null, client);

			await client.views.update({
				view_id: body.view.id,
				hash: body.view.hash,
				view: await groupManageHomeView(seekerId),
			});
		} catch (error) {
			logger.error(error);
		}
	});

	app.action("goAlarmManageView", async ({ ack, body, client, logger }) => {
		await ack();
		const seekerId = await getClientIntraId(body, null, client);

		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await alarmManageHomeView(seekerId),
		});
	});

	// app.action("goMemberManageView", async ({ack, body, client}) => {
	// 	await ack();
	// 	const seekerId = await getClientIntraId(body, null, client);
	// 	await client.views.update({
	// 		view_id: body.view.id,
	// 		hash: body.view.hash,
	// 		view: await memberManageHomeView(seekerId)
	// 	})
	// });

	app.action("goManualView", async ({ ack, body, client, logger }) => {
		try {
			await ack();

			await client.views.update({
				view_id: body.view.id,
				hash: body.view.hash,
				view: await manualHomeView(),
			});
		} catch (error) {
			logger.error(error);
		}
	});
};
