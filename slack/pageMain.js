import { SelectGroup, unSelectGroup } from "../DataBase/utils.js";
import { getSeekerId } from "./utils/data.js";
import { mainHomeView, groupManageHomeView, alarmManageHomeView } from "./views.js";

export default (app) => {
    app.event("app_home_opened", async ({ event, client, logger }) => {
        try {
            const seekerId = await getSeekerId(null, event, client);

            const result = await client.views.publish({
                user_id: event.user,
                view: await mainHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.action("goMainView", async ({ack, body, client}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await mainHomeView(seekerId)
			})
		}
	);
	
    app.action("goGroupManageView", async ({ ack, body, client, logger }) => {
        try {
            await ack();
            const seekerId = await getSeekerId(body, null, client);
			
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await groupManageHomeView(seekerId, ""),
            });
        } catch (error) {
            logger.error(error);
        }
		client.previous_view_id = body.view.id;
    });

	app.action("goAlarmManageView", async ({ack, body, client, logger}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);

		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view : await alarmManageHomeView(seekerId),
		});
		client.previous_view_id = body.view.id;
	})

    app.action("selectTarget", async ({ ack, body, client, logger }) => {
        await ack();
        const selected = body.actions[0].selected_option;
        const prev = body.actions[0].initial_option;
        let prevGroup = null;

        const selectedGroup = selected.text.text;
        const selectedGroupId = +selected.value;
        const seekerId = await getSeekerId(body, null, client);

        await unSelectGroup(seekerId, prevGroup ? prevGroup : prev ? prev.text.text : selectedGroup);
        await SelectGroup(seekerId, selectedGroup);

        prevGroup = selectedGroup;

        await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: await mainHomeView(seekerId),
        });
    });
};
