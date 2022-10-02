import { getGls, getGroupId, getGroupUser } from "../DataBase/utils.js";
import { getSeekerId } from "./utils/data.js";
import { memberManageHomeView} from "./views.js";

export default (app) => {
	
	app.action("selectDoneforMemberManage", async ({ack, body, client, logger}) => {
        try {
            await ack();
       	 	const selected = body.actions[0].selected_option;
			const selectedGroup = {text: selected.text.text, value: selected.value};
			const seekerId = await getSeekerId(body, null, client);
			
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: await memberManageHomeView(seekerId, selectedGroup),
            });
        } catch (error) {
            logger.error(error);
        }
	})

}

