import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockContext, BlockButtons, BlockDivider } from "./block.js";

function createGroupView(seekerId) {
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
            ...BlockMrkdwn([
                "• glance42",
                "• slience42",
                "• idiot",
            ]),
            ...BlockDivider(),
            ...BlockButtons([
                {
                    text: "그룹 추가",
                    action_id: "addGroup",
                    value: "addGroup",
                },
                {
                    text: "그룹 삭제",
                    action_id: "delGroup",
                    value: "delGroup",
                },
                {
                    text: "멤버 관리",
                    action_id: "manageMember",
                    value: "manageMember",
                }
            ])
        ],
    };
}

export default createGroupView;
