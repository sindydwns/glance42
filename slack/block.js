/**
 * Select
 * @param {string} title 
 * @param {Array<{title:String, value:String}} items 
 * @param {string} actionId 
 * @returns 
 */
 export function BlockSelect(title, items, actionId) {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: title
        },
        accessory: {
            type: "static_select",
            placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true
            },
            options: items.map(x => ({
                text: {
                    type: "plain_text",
                    text: x.title,
                    emoji: true,
                },
                value: x.value
            })),
            action_id: actionId
        }
    }
}

export function BlockMrkdwn(text) {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text
        }
    };
}

export function BlockLabelInput(text, actionId) {
    return {
        dispatch_action: true,
        type: "input",
        element: {
            type: "plain_text_input",
            action_id: actionId,
        },
        label: {
            type: "plain_text",
            text,
            emoji: true,
        },
    };
}

export function BlockHeader(text) {
    return {
        type: "header",
        text: {
            type: "plain_text",
            text,
            emoji: true
        }
    };
}
