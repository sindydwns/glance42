import { getGls, getGroupId, getGroupLocationInfo, getGroupUser, SelectGroup, unSelectGroup } from "../DataBase/utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons, BlockDivider, BlockManual } from "./block.js";
import { formatLocationStr, getSeekerId } from "./utils.js";

export default (app) => {
    app.event("app_home_opened", async ({ event, client, logger }) => {
        try {
            const seekerId = await getSeekerId(null, event, client);

            const gls = await getGls(seekerId);
            const groupId = await getGroupId(seekerId);
            // const groupUser = await getGroupUser(groupId);
            const locationInfo = await getGroupLocationInfo(seekerId, groupId);
            const formatedStrArr = formatLocationStr(locationInfo);
            const result = await client.views.publish({
                user_id: event.user,
                view: createHomeView(
                    gls.map((v) => ({ title: v.group_name, value: v.group_id, selected: v.selected })),
                    formatedStrArr
                ),
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("manageGroup", async ({ ack, body, client }) => {
        await ack();

        await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: createMemberView(),
        });
    });

    app.action("test-select-id", async ({ ack, body, client, logger }) => {
        await ack();
        const selected = body.actions[0].selected_option;
        const selectedGroup = selected.text.text;
        const selectedGroupId = +selected.value;
        const seekerId = await getSeekerId(body, null, client);

        const prev = body.actions[0].initial_option;
        let prevGroup = null;
        await unSelectGroup(seekerId, prevGroup ? prevGroup : prev.text.text);
        await SelectGroup(seekerId, selectedGroup);
        prevGroup = selectedGroup;
        const gls = await getGls(seekerId);
        const locationInfo = await getGroupLocationInfo(seekerId, selectedGroupId);
        const formatedStrArr = formatLocationStr(locationInfo);
        await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: createHomeView(
                gls.map((v) => ({ title: v.group_name, value: v.group_id, selected: v.selected })),
                formatedStrArr
            ),
        });
    });

    function createMemberView() {
        return {
            type: "home",
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "👥 그룹 관리",
                        emoji: true,
                    },
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "plain_text",
                            text: "홈/그룹관리",
                            emoji: true,
                        },
                    ],
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "< Back",
                                emoji: true,
                            },
                            value: "click_me_123",
                            action_id: "actionId-0",
                        },
                    ],
                },
                {
                    type: "divider",
                },
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "📃 등록된 그룹리스트",
                        emoji: true,
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "• glance42",
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "• slience42",
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "• idiot",
                    },
                },
                {
                    type: "divider",
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "그룹 추가",
                                emoji: true,
                            },
                            value: "click_me_123",
                            action_id: "actionId-0",
                        },
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "그룹 삭제",
                                emoji: true,
                            },
                            value: "click_me_123",
                            action_id: "actionId-2",
                        },
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "멤버 관리",
                                emoji: true,
                            },
                            value: "click_me_123",
                            action_id: "actionId-1",
                        },
                    ],
                },
            ],
        };
    }

    function createHomeView(gls, locationInfo) {
        return {
            type: "home",
            blocks: [
                BlockHeader("👀 염탐하기"),
                BlockSelect("염탐할 그룹을 선택해주세요", gls, "test-select-id"),
                BlockMrkdwn(locationInfo),
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
                BlockDivider(),
                BlockManual(),
            ],
        };
    }
};
