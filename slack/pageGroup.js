import { getGls } from "../DataBase/utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockContext, BlockButtons, BlockDivider, ModalTemplate } from "./block.js";
import { getSeekerId } from "./utils.js";

export default (app) => {
    app.action("addGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);
        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: ModalTemplate(
                    "그룹 추가",
                    "추가할 그룹을 입력해주세요",
                    null
                ),
            });
            // logger.info(result);
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("delGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);
        const gls = await getGls(seekerId);
        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: ModalTemplate(
                    "그룹 삭제",
                    "삭제할 그룹을 선택해주세요..",
                    gls.map((v) => ({ title: v.group_name, value: v.group_id, selected: v.selected }))
                ),
            });
            // logger.info(result);
        } catch (error) {
            logger.error(error);
        }
    })
};


export async function createGroupView(seekerId) {
    const gls = await getGls(seekerId);
    return {
        type: "home",
        blocks: [
            ...BlockHeader("👥 그룹 관리"),
            ...BlockContext("홈/그룹관리"),
            ...BlockButtons([
                {
                    text: "< Back",
                    actionId: "Backbutton",
                    value: "Backbutton",
                },
            ]),
            ...BlockDivider(),
            ...BlockHeader("📃 등록된 그룹리스트"),
            ...BlockMrkdwn(gls.map(v => v.group_name)),
            ...BlockDivider(),
            ...BlockButtons([
                {
                    text: "그룹 추가",
                    actionId: "addGroup",
                    value: "addGroup",
                },
                {
                    text: "그룹 삭제",
                    actionId: "delGroup",
                    value: "delGroup",
                },
                {
                    text: "멤버 관리",
                    actionId: "manageMember",
                    value: "manageMember",
                },
            ]),
        ],
    };
}
