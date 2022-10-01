import { getGls, getGroupId, getGroupUser } from "../DataBase/utils.js";
import { getSeekerId } from "./utils/data.js";
import { groupManageHomeView, memberManageHomeView  } from "./views.js";

export default (app) => {

	app.action("goMemberManageView", async ({ ack, body, client, logger }) => {
        try {
            await ack();
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await memberManageHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });
}

