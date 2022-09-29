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

export function BlockMrkdwn(items) {
    if (items === null || items.length === 0) return;
    return items.map((x) => {
        return {
            type: "section",
            text: {
                type: "mrkdwn",
                text: x,
            },
        };
    });
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
            value: x.value,
            action_id: x.actionId,
        })),
    };
}

export function BlockDivider() {
    return {
        type: "divider",
    };
}

export function BlockContext(text) {
    return {
        type: "context",
        elements: [
            {
                type: "plain_text",
                text,
                emoji: true,
            },
        ],
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