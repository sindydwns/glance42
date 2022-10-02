import { getGls, getGroupId, getGroupUser } from "../DataBase/utils.js";
import { getSeekerId } from "./utils/data.js";
import { memberManageHomeView} from "./views.js";

export default (app) => {
	
	app.action("selectDoneforMemberManage", async ({ack, body, client, logger}) => {
        try {
            await ack();
            const seekerId = await getSeekerId(body, null, client);
			const inputVal = app.view;

            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await memberManageHomeView(seekerId, 1, "This is Test msg..."),
            });
        } catch (error) {
            logger.error(error);
        }
	})

}

