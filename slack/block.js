/**
 * Select
 * @param {string} title
 * @param {Array<{title:String, value:String, selected:Boolean}>} items
 * @param {string} actionId
 * @returns
 */
export function BlockSelect(title, items, actionId) {
    if (items == null || items.length === 0) return;
    const options = items.map((x) => ({
        text: {
            type: "plain_text",
            text: x.title,
            emoji: true,
        },
        value: String(x.value),
    }));
    const res = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: title,
        },
        accessory: {
            type: "static_select",
            placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
            },
            options,
            action_id: actionId,
        },
    };
    const selectedItem = items.filter((x) => x.selected)[0];
    const selectedOption = selectedItem ? options.filter((x) => x.value == selectedItem.value) : null;
    if (selectedOption) res.accessory.initial_option = selectedOption[0];
    return res;
}

export function BlockMrkdwn(text) {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text,
        },
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

export function BlockLabelButton(label, text, actionId) {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: label,
        },
        accessory: {
            type: "button",
            text: {
                type: "plain_text",
                text,
                emoji: true,
            },
            value: "click_me_123",
            action_id: actionId,
        },
    };
}

export function BlockHeader(text) {
    return {
        type: "header",
        text: {
            type: "plain_text",
            text,
            emoji: true,
        },
    };
}

/**
 *
 * @param {Array<text:String, actionId:String>} items
 * @returns
 */
export function BlockButtons(items) {
    return {
        type: "actions",
        elements: items.map((x) => ({
            type: "button",
            text: {
                type: "plain_text",
                text: x.text,
                emoji: true,
            },
            value: "그룹관리",
            action_id: x.actionId,
        })),
    };
}

export function BlockDivider() {
    return {
        type: "divider",
    };
}

export function BlockManual() {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "사용방법을 모르시겠나요? 이쪽을 참고하세요! 📚",
        },
        accessory: {
            type: "button",
            text: {
                type: "plain_text",
                text: "Help",
                emoji: true,
            },
            value: "manual",
            action_id: "manual_button",
        },
    };
}

export function BlockList(items)
{
	if (items == null || items.length === 0)
		return ;
	let text = "";
	for (let i in items) {
		text = text + `•  ${items[i]} \n`;
	}
	return {
		type: "section",
		text: {
				type: "mrkdwn",
				text: text
		},
	}
}

export function BlockDivider()
{
	return ({
		type: "divider",
	})
}