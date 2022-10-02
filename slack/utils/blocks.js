
function SelectOptions(items) {
	if (items == "" || items == null)
		items = [{text:"선택할 대상이 없습니다", value:"No-option"}];
	return items.map((x) => ({
        text: {
            type: "plain_text",
            text: x.text,
            emoji: true,
        },
        value: x.value
    }))
}

/* -------------------------- ONLY TEXT BLOCKS ------------------------------- */

export function BlockDivider() {
    return [
        {
            type: "divider",
        },
    ];
}

export function BlockHeader(text) {
    if (text == null || text == "") return [];
    return [
        {
            type: "header",
            text: {
                type: "plain_text",
                text,
                emoji: true,
            },
        },
    ];
}

export function BlockMrkdwn(text) {
	if (text == null || text == "") return [];
	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: text,
			},
		}
	];
}

export function BlockContextText(text) {
    if (text == null || text == "") return [];
    return [
        {
            type: "context",
            elements: [
                {
                    type: "plain_text",
                    text,
                    emoji: true,
                },
            ],
        },
    ];
}

/* -------------------------- BUTTON BLOCKS --------------------------------- */

export function BlockActionButtons(items) {
    items = items
        ?.filter((x) => x.text != null && x.text != "")
        .filter((x) => x.actionId != null && x.actionId != "")
        .filter((x) => x.value != null && x.value != "");
    if (items == null || items.length === 0) return [];
    return [
        {
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
        },
    ];
}

export function BlockSectionButton(desText, item, actionId) {
    if (desText == null || desText == "") return [];
    if (item.text == null || item.text == "") return [];
    if (item.value == null || item.value == "") return [];
    if (actionId == null || actionId == "") return [];
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: desText,
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: item.text,
                    emoji: true,
                },
                value: item.value,
                action_id: actionId,
            },
        },
    ];
}

/* ---------------------------- INPUT BLOCKS --------------------------------- */

export function BlockTextInput(labelText, actionId) {
    if (labelText == null || labelText == "" || actionId == null || actionId == "") return [];
	return {
		"dispatch_action": true,
		"type": "input",
		"element": {
			"type": "plain_text_input",
			"dispatch_action_config": {
				"trigger_actions_on": ["on_character_entered"]
			},
			"action_id": actionId,
		},
		"label": {
			"type": "plain_text",
			"text": labelText,
			"emoji": true
		}
	}
}

/* -------------------------- SELECT BLOCKS --------------------------------- */

export function BlockSectionSelect(desText, actionId, items, initialSelect) {
	let res = {
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": desText
		},
		"accessory": {
			"type": "static_select",
			"placeholder": {
				"type": "plain_text",
				"text": "Select an item",
				"emoji": true
			},
			"options": SelectOptions(items),
			"action_id": actionId
		}
	}
	if (initialSelect)
			res.accessory.initial_option = SelectOptions([initialSelect])[0];
    return [res];
}

export function BlockSingleStaicSelect(labelText, actionId, items) {
    return {
		"type": "input",
		"element": {
			"type": "static_select",
			"placeholder": {
				"type": "plain_text",
				"text": "Select an item",
				"emoji": true
			},
			"options": SelectOptions(items),
			"action_id": actionId
		},
		"label": {
			"type": "plain_text",
			"text": labelText,
			"emoji": true
		}
	}
}

export function BlockMultiStaicSelect(labelText, actionId, items) {
    return {
		"type": "input",
		"element": {
			"type": "multi_static_select",
			"placeholder": {
				"type": "plain_text",
				"text": "Select an item",
				"emoji": true
			},
			"options": SelectOptions(items),
			"action_id": actionId
		},
		"label": {
			"type": "plain_text",
			"text": labelText,
			"emoji": true
		}
	}
}

export function BlockMultiUsersSelect(labelText, actionId) {
    return {
		"type": "input",
		"element": {
			"type": "multi_users_select",
			"placeholder": {
				"type": "plain_text",
				"text": "Select users",
				"emoji": true
			},
			"action_id": actionId
		},
		"label": {
			"type": "plain_text",
			"text": labelText,
			"emoji": true
		}
	}
}
