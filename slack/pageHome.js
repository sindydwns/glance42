import { getGls, getGroupId, getGroupLocationInfo, getGroupUser, SelectGroup, unSelectGroup } from "../DataBase/utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons, BlockDivider, BlockLabelButton } from "./block.js";
import createGroupView from "./pageGroup.js";
import { formatLocationStr, getSeekerId } from "./utils.js";

export default (app) => {
    app.event("app_home_opened", async ({ event, client, logger }) => {
        try {
            const seekerId = await getSeekerId(null, event, client);
            const result = await client.views.publish({
                user_id: event.user,
                view: await createHomeView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("manageGroup", async ({ ack, body, client, logger }) => {
        try {
            await ack();
            const seekerId = await getSeekerId(body, null, client);
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: createGroupView(seekerId),
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("test-select-id", async ({ ack, body, client, logger }) => {
        await ack();
        const selected = body.actions[0].selected_option;
        const prev = body.actions[0].initial_option;
        let prevGroup = null;

        const selectedGroup = selected.text.text;
        const selectedGroupId = +selected.value;
        const seekerId = await getSeekerId(body, null, client);

        await unSelectGroup(seekerId, prevGroup ? prevGroup : prev.text.text);
        await SelectGroup(seekerId, selectedGroup);

        prevGroup = selectedGroup;

        await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: await createHomeView(seekerId),
        });
    });

    async function createHomeView(seekerId) {
        const gls = await getGls(seekerId);
        const groupId = await getGroupId(seekerId);
        const locationInfo = await getGroupLocationInfo(seekerId, groupId);
        const formatedStrArr = formatLocationStr(locationInfo);
        return {
            type: "home",
            blocks: [
                BlockHeader("👀 염탐하기"),
                BlockSelect(
                    "염탐할 그룹을 선택해주세요",
                    gls.map((v) => ({ title: v.group_name, value: v.group_id, selected: v.selected })),
                    "test-select-id"
                ),
                ...BlockMrkdwn([formatedStrArr]),
                BlockHeader("⚙️ 설정"),
                BlockButtons([
                    {
                        text: "그룹관리",
                        actionId: "manageGroup",
                        value: "manageGroup",
                    },
                    {
                        text: "알람 설정",
                        actionId: "alarmConfigure",
                        value: "alarmConfigure",
                    },
                ]),
                BlockDivider(),
                BlockLabelButton("사용방법을 모르시겠나요? 이쪽을 참고하세요! 📚", "Help", "button-action"),
            ],
    };
    }
};
