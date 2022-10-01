
function SelectOptions(items) {
	return (items.map((x) => ({
        text: {
            type: "plain_text",
            text: x.text,
            emoji: true,
        },
        value: x.value
    }))
	)
}

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

export function BlockMrkdwn(items) {
	if (items[0] == null || items[0] == "") return [];
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
    if (text == null || text == "" || actionId == null || actionId == "") return [];
    return [
        {
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
        },
    ];
}

export function BlockLabelButton(label, text, actionId) {
    if (label == null || label == "") return [];
    if (text == null || text == "") return [];
    if (actionId == null || actionId == "") return [];
    return [
        {
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
        },
    ];
}

export function BlockButtons(items) {
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

export function BlockContext(text) {
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

export function BlockSectionSelect(desText, actionId, items) {
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
	const selectedItem = items.filter((item) => item.selected)[0];
    if (selectedItem)
		res.accessory.initial_option = SelectOptions([selectedItem])[0];
    return (res);
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

export function BlockTextInput(labelText, actionId) {
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