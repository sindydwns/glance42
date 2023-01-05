
/* -------------------------- LOCATION INFO BLOCK ---------------------------- */

function formatStrCurrentLocation(locationInfo) {
	if (locationInfo.length == 0)
		return ("\n");
    let rv = "";
    locationInfo.forEach((elem) => {
        const targetId = elem.target_id;
        const location = elem.host;
        if (location) rv += `*<https://profile.intra.42.fr/users/${targetId}|✅ ${targetId}> : ${location}*\n`;
        else rv += `*<https://profile.intra.42.fr/users/${targetId}|❌ ${targetId}> : No*\n`;
    });
    return rv;
}

export async function locationInfo(locationInfo, selectedType)
{	
	if (selectedType == "selectGroup" && locationInfo == "") {
		return [...BlockContextMrkdwn(
			">선택한 그룹에 등록된 멤버가 없습니다.\n>'멤버 추가'로 멤버를 추가해보세요!")];
	}
	else {
		const timeStamp = () => {
			const today = new Date();
			today.setHours(today.getHours() + 9);
			return today.toISOString().replace("T", " ").substring(0, 19);
		};
		const formattedLocationInfoStr = formatStrCurrentLocation(locationInfo);
		return [...BlockSectionMrkdwn(`마지막 업데이트: ${timeStamp()}`),
		...BlockSectionMrkdwn(formattedLocationInfoStr)];
	}
}

/* ----------------------------- SELECT BLOCK -------------------------------- */

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

export function Divider() {
    return [
        {
            type: "divider",
        },
    ];
}

export function Header(text) {
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

export function SectionMrkdwn(text) {
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

export function ContextMrkdwn(text) {
    if (text == null || text == "") return [];
    return [
        {
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text,
                },
            ],
        },
    ];
}

/* -------------------------- BUTTON BLOCKS --------------------------------- */

export function ActionButtons(items) {
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

export function SectionButton(descText, item, actionId) {
    if (descText == null || descText == "") return [];
    if (item.text == null || item.text == "") return [];
    if (item.value == null || item.value == "") return [];
    if (actionId == null || actionId == "") return [];
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: descText,
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

export function LinkButton(descText, item, actionId) {
	if (descText == null || descText == "") return [];
    if (item.text == null || item.text == "") return [];
    if (item.value == null || item.value == "") return [];
    if (actionId == null || actionId == "") return [];
	return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": descText,
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": item.text,
					"emoji": true
				},
				"value": item.value,
				"url": item.url,
				"action_id": actionId
			}
		}
	]
}

/* ---------------------------- INPUT BLOCKS --------------------------------- */

export function TextInput(labelText, actionId, blockId = "textInput") {
    if (labelText == null || labelText == "" || actionId == null || actionId == "") return [];
	return {
		"dispatch_action": true,
		"type": "input",
		"block_id": blockId,
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

export function SectionSelect(desText, actionId, items, initialSelect) {
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

export function SingleStaicSelect(labelText, actionId, items) {
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

export function MultiStaicSelect(labelText, actionId, items) {
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

export function MultiUsersSelect(labelText, actionId, blockId = "multiUsersSelect") {
    return {
		"type": "input",
		"block_id": blockId,
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
