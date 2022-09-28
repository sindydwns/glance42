import { getGls, getGroupId, getGroupUser } from "../DataBase/utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons } from "./block.js";

export default (app) => {
    app.event("app_home_opened", async ({ event, client, logger }) => {
        try {
            const userId = event.user;
            const userName = await client.users.info({
                user: userId,
            });
            const seekerId = userName.user.profile.display_name;

            const gls = await getGls(seekerId);
            const groupId = await getGroupId(seekerId, "fashion");
            const groupUser = await getGroupUser(groupId);

            // const locationIn

            const result = await client.views.publish({
                user_id: event.user,
                view: createHomeView(groupUser),
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("test-select-id", async ({ ack, body, client, logger }) => {
        await ack();
        memberArrTestTempXYZ = [];
        const selectedGroup = body.actions[0].selected_option.text.text;
        await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: createHomeView(),
        });
    });

    app.action("test-action-id", async ({ ack, body, client, logger }) => {
        await ack();
        memberArrTestTempXYZ.push(body.actions[0].value);
        await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: createHomeView(),
        });
    });

    var memberArrTestTempXYZ = [];
    function createHomeView() {
        return {
            type: "home",
            blocks: [
                BlockHeader("👀 염탐하기"),
                BlockSelect(
                    "염탐할 대상을 선택해주세요",
                    [
                        { title: "과묵한동반자들", value: "value-0" },
                        { title: "염탐42멤버", value: "value-1" },
                        { title: "👤 워크스페이스에서 유저 선택...", value: "value-2" },
                    ],
                    "test-select-id"
                ),
                ...memberArrTestTempXYZ.map((x) => BlockMrkdwn(x)),
                BlockLabelInput("test plain text", "test-action-id"),
                BlockHeader("⚙️ 설정"),
                BlockButtons([
                    {
                        text: "그룹관리",
                        actionId: "manageGroup",
                    },
                    {
                        text: "알람 설정",
                        actionId: "alarmConfigure",
                    },
                ]),
            ],
        };
    }
};
