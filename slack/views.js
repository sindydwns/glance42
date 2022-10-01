import { getGls, getSelectedGroupId, getGroupLocationInfo, SelectGroup, unSelectGroup, getAlarmList } from "../DataBase/utils.js";
import { BlockDivider, BlockHeader, BlockMrkdwn, BlockSectionButton, BlockActionButtons, BlockContextText, 
	BlockSectionSelect, BlockSingleStaicSelect, BlockMultiStaicSelect, BlockMultiUsersSelect, BlockTextInput} from "./utils/blocks.js"

function formatStrCurrentLocation(locationInfo) {
    let rv = "";
    locationInfo.forEach((elem) => {
        const targetId = elem.target_id;
        const location = elem.host;
        if (location) rv += `*<https://profile.intra.42.fr/users/${targetId}|✅ ${targetId}> : ${location}*\n`;
        else rv += `*<https://profile.intra.42.fr/users/${targetId}|❌ ${targetId}> : No*\n`;
    });
    return rv;
}

function formatStrUnorderedList(items) {
	let res = "";
    for (let i in items) {
        res += (`•  ${items[i]} \n`);
    }
	return (res)
}

function HomeViewTemplete(blocks) {
	return {
		type: "home",
		blocks: blocks
	};
};

function ModalViewTemplete(titleText, callbackId, blocks) {
	return {
		callback_id : callbackId, 
		notify_on_close: true,
		type: "modal",
		title: {
			"type": "plain_text",
			"text": titleText,
			"emoji": true
		},
		submit: {
			"type": "plain_text",
			"text": "Submit",
			"emoji": true
		},
		close: {
			"type": "plain_text",
			"text": "Cancel",
			"emoji": true
		},
		blocks: blocks
	}
}

export async function mainHomeView(seekerId) {
	const gls_ = await getGls(seekerId);
	const gls = gls_.map(item => {
		return {text:item.group_name, value:String(item.group_id), selected:item.selected}
	});

	const groupId = await getSelectedGroupId(seekerId);
	const locationInfo = await getGroupLocationInfo(seekerId, groupId);
	return (HomeViewTemplete([
			...BlockHeader("👀 염탐하기"),
			BlockSectionSelect("염탐할 대상을 선택해주세요", "selectTarget", gls),
			...BlockMrkdwn([formatStrCurrentLocation(locationInfo)]),
			...BlockDivider(),
			...BlockHeader("⚙️ 설정"),
			...BlockActionButtons([
				{text: "그룹 관리", actionId: "goGroupManageView", value: "goGroupManageView",},
				{text: "알람 설정", actionId: "goAlarmManageView", value: "goAlarmManageView",},
			]),
			...BlockDivider(),
			...BlockSectionButton("사용방법을 모르시겠나요? 이쪽을 참고하세요! 📚", "Help", "button-action"),
		])
	);
}

export async function groupManageHomeView(seekerId, msg) {
	const gls_ = await getGls(seekerId);
	const gls = gls_.map(x=>x.group_name);
	return (HomeViewTemplete([
		...BlockHeader("👥 그룹 관리"),
		...BlockContextText("홈/그룹 관리"),
		...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...BlockDivider(),
		...BlockHeader("📃 등록된 그룹 리스트"),
		...BlockMrkdwn([formatStrUnorderedList(gls)]),
		...BlockMrkdwn([msg]),
		...BlockActionButtons([
			{text:"그룹 추가", value:"그룹 추가", actionId:"OpenModalAddGroup"},
			{text:"그룹 삭제", value:"그룹 삭제", actionId:"OpenModalDelGroup"},
			{text:"멤버 관리", value:"멤버 관리", actionId:"goPageMember"}
		]),
	]));
}

export async function addGroupModalView() {
	return (ModalViewTemplete("👥 그룹 추가", "callbackAddGroup", ([
			BlockTextInput("추가할 그룹명을 입력해주세요", "submitAddGroup")
		])
	));
}

export async function delGroupModalView(seekerId) {
	const gls_ = await getGls(seekerId);
	const gls = gls_.map(item => {
		return {text:item.group_name, value:String(item.group_id)}
	});
	return (ModalViewTemplete("👥 그룹 삭제", "callbackDelGroup", ([
			BlockSingleStaicSelect("삭제할 그룹을 선택해주세요", "submitDelGroup", gls)
		])
	));
}

export async function addAlarmModalView() {
	return (ModalViewTemplete("⏰ 알람 추가", "callbackAddAlarm", ([
			BlockMultiUsersSelect("워크스페이스에서 유저를 선택해주세요. \n (물론, 카뎃만 선택 가능합니다!)",
			 "submitAddAlarm")
		])
	));
}

export async function delAlarmModalView(seekerId) {
	const alarmList_ = await getAlarmList(seekerId);
	const alarmList = alarmList_.map(item => {
		return {text:item.target_id, value:String(item.target_id)}
	});
	return (ModalViewTemplete("⏰ 알람 삭제", "callbackDelAlarm", ([
			BlockMultiStaicSelect("삭제할 알람을 선택해주세요", "submitDelAlarm", alarmList)
		])
	));
}

export async function alarmManageHomeView(seekerId, msg) {
	const alarmList_ = await getAlarmList(seekerId);
	const alarmList = alarmList_.map(x=>x.target_id);
	return HomeViewTemplete([
		...BlockHeader("⏰ 알람 설정"),
		...BlockContextText("홈/알람 설정"),
		...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...BlockDivider(),
		...BlockHeader("📃 등록된 알람 리스트"),
		...BlockMrkdwn([formatStrUnorderedList(alarmList)]),
		...BlockMrkdwn([msg]),
		...BlockActionButtons([
			{text:"알람 추가", value:"알람 추가", actionId:"OpenModalAddAlarm"},
			{text:"알람 삭제", value:"알람 삭제", actionId:"OpenModalDelAlarm"},
		]),
	]);
}

export async function memberManageHomeView(groupId, msg) {
	const memberList_ = await getGroupUser(groupId);
	const memberList = memberList_.map(x=>x.target_id);
	console.log(JSON.stringify(memberList));
	return HomeViewTemplete([
		...BlockHeader("👤 멤버 관리"),
		...BlockContextText("홈/그룹 관리/멤버 관리"),
		...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goGroupManageView"}]),
		...BlockDivider(),
		...BlockHeader("📃 등록된 멤버 리스트"),
		...BlockMrkdwn([formatStrUnorderedList(memberList)]),
		...BlockMrkdwn([msg]),
		...BlockActionButtons([
			{text:"멤버 추가", value:"멤버 추가", actionId:"addMember"},
			{text:"멤버 삭제", value:"멤버 삭제", actionId:"delMember"},
		]),
	]);
}
