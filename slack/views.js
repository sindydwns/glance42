import { getGls, getGroupUser, getSelectedGroupId, getGroupLocationInfo, getAlarmList } from "../DataBase/utils.js";
import { BlockDivider, BlockHeader, BlockMrkdwn,BlockSectionButton, BlockActionButtons, BlockContextText, 
	BlockSectionSelect, BlockSingleStaicSelect, BlockMultiStaicSelect, BlockMultiUsersSelect, BlockTextInput} from "./utils/blocks.js"

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

/* -------------------------------- HOME VIEWS ---------------------------------- */

export async function mainHomeView(seekerId) {
	const gls_ = await getGls(seekerId);
	const gls = gls_.map(item => {
		return {text:item.group_name, value:String(item.group_id), selected:item.selected}
	});

	const groupId = await getSelectedGroupId(seekerId);
	const locationInfo = await getGroupLocationInfo(seekerId, groupId);
	const initialSelect = gls.filter((item) => item.selected)[0];
	return (HomeViewTemplete([
			...BlockHeader("👀 염탐하기"),
			...BlockSectionSelect("염탐할 대상을 선택해주세요", "selectTarget", gls, initialSelect),
			...BlockMrkdwn("\n"),
			...BlockMrkdwn(formatStrCurrentLocation(locationInfo)),
			...BlockMrkdwn("\n"),
			...BlockDivider(),
			...BlockHeader("⚙️ 설정"),
			...BlockActionButtons([
				{text: "그룹 관리", actionId: "goGroupManageView", value: "goGroupManageView",},
				{text: "알람 설정", actionId: "goAlarmManageView", value: "goAlarmManageView",},
			]),
			...BlockMrkdwn("\n"),
			...BlockDivider(),
			...BlockMrkdwn("\n"),
			...BlockSectionButton("사용방법을 모르시겠나요? 이쪽을 참고하세요! 📚", {text:"Help", value:"help"}, "goManualView"),
		])
	);
}

// console.log(JSON.stringify(await mainHomeView('yeonhkim')));

export async function groupManageHomeView(seekerId, msg) {
	const gls_ = await getGls(seekerId);
	const gls = gls_.map(x=>x.group_name);
	if (gls.length == 0 && msg == null)
		msg = "생성된 그룹이 하나도 없습니다!\n'그룹 생성' 버튼을 눌러 새로운 그룹을 생성해보세요.";
	return (HomeViewTemplete([
		...BlockHeader("👥 그룹 관리"),
		...BlockContextText("홈/그룹 관리"),
		...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...BlockDivider(),
		...BlockMrkdwn("\n"),
		...BlockHeader("📋 나의 그룹 리스트"),
		...BlockMrkdwn(formatStrUnorderedList(gls)),
		...BlockMrkdwn(msg),
		...BlockMrkdwn("\n"),
		...BlockActionButtons([
			{text:"그룹 생성", value:"그룹 생성", actionId:"OpenModalAddGroup"},
			{text:"그룹 삭제", value:"그룹 삭제", actionId:"OpenModalDelGroup"},
			{text:"멤버 관리", value:"멤버 관리", actionId:"goMemberManageView"}
		]),
	]));
}

export async function alarmManageHomeView(seekerId, msg) {
	const alarmList_ = await getAlarmList(seekerId);
	const alarmList = alarmList_.map(x=>x.target_id);
	if (alarmList.length == 0 && msg == null)
		msg = "등록한 알람이 하나도 없습니다!\n'알람 추가' 버튼을 눌러 새로운 알람을 등록해보세요.";
	return HomeViewTemplete([
		...BlockHeader("⏰ 알람 설정"),
		...BlockContextText("홈/알람 설정"),
		...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...BlockDivider(),
		...BlockMrkdwn("\n"),
		...BlockHeader("📋 등록한 알람 리스트"),
		...BlockMrkdwn(formatStrUnorderedList(alarmList)),
		...BlockMrkdwn(msg),
		...BlockMrkdwn("\n"),
		...BlockActionButtons([
			{text:"알람 추가", value:"알람 추가", actionId:"OpenModalAddAlarm"},
			{text:"알람 삭제", value:"알람 삭제", actionId:"OpenModalDelAlarm"},
		]),
	]);
}

export async function memberManageHomeView(seekerId, selectGroup, msg) {
	const gls_ = await getGls(seekerId);
	const gls = gls_.map(item => {
		return {text:item.group_name, value:String(item.group_id), selected:item.selected}
	});
	if (selectGroup) {
		const memberList_ = await getGroupUser(selectGroup.value);
		const memberList = memberList_.map(x=>x.target_id);
		if (memberList.length == 0 && msg == null)
			msg = "선택한 그룹에 등록된 멤버가 없습니다!";
		return HomeViewTemplete([
			...BlockHeader("👤 멤버 관리"),
			...BlockContextText("홈/그룹 관리/멤버 관리"),
			...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goGroupManageView"}]),
			...BlockDivider(),
			...BlockMrkdwn("\n"),
			...BlockSectionSelect("멤버를 관리할 그룹을 선택해주세요", "selectGroupDoneforMemberManage", gls, selectGroup),
			...BlockMrkdwn("\n"),
			...BlockHeader("📋 그룹에 등록한 멤버 리스트"),
			...BlockMrkdwn(formatStrUnorderedList(memberList)),
			...BlockMrkdwn(msg),
			...BlockActionButtons([
				{text:"멤버 추가", value:"멤버 추가", actionId:"OpenModalAddMember"},
				{text:"멤버 삭제", value:"멤버 삭제", actionId:"OpenModalDelMember"},
			]),
		]);
	}
	else
		return HomeViewTemplete([
			...BlockHeader("👤 멤버 관리"),
			...BlockContextText("홈/그룹 관리/멤버 관리"),
			...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goGroupManageView"}]),
			...BlockDivider(),
			...BlockMrkdwn("\n\n"),
			...BlockSectionSelect("멤버를 관리할 그룹을 선택해주세요", "selectGroupDoneforMemberManage", gls, false),
		]);
}

export async function manualHomeView() {
	return (HomeViewTemplete([
		...BlockHeader("도움말"),
		...BlockContextText("홈/도움말"),
		...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...BlockDivider(),
		...BlockHeader("사용 방법"),
		...BlockMrkdwn("어쩌구 저쩌구..."),
	]));
}

/* ----------------------------- MODAL VIEWS ---------------------------------- */

export async function addGroupModalView() {
	return (ModalViewTemplete("그룹 추가", "callbackAddGroup", ([
			BlockTextInput("추가할 그룹명을 입력해주세요", "submitAddGroup")
		])
	));
}

export async function delGroupModalView(seekerId) {
	const gls_ = await getGls(seekerId);
	const gls = gls_.map(item => {
		return {text:item.group_name, value:String(item.group_id)}
	});
	return (ModalViewTemplete("그룹 삭제", "callbackDelGroup", ([
			BlockSingleStaicSelect("삭제할 그룹을 선택해주세요", "submitDelGroup", gls)
		])
	));
}

export async function addAlarmModalView() {
	return (ModalViewTemplete("알람 추가", "callbackAddAlarm", ([
			BlockMultiUsersSelect("알람을 받을 유저를 선택해주세요. \n (물론, 카뎃만 선택 가능합니다!)",
			 "submitAddAlarm")
		])
	));
}

export async function delAlarmModalView(seekerId) {
	const alarmList_ = await getAlarmList(seekerId);
	const alarmList = alarmList_.map(item => {
		return {text:item.target_id, value:String(item.target_id)}
	});
	return (ModalViewTemplete("알람 삭제", "callbackDelAlarm", ([
			BlockMultiStaicSelect("삭제할 알람을 선택해주세요", "submitDelAlarm", alarmList)
		])
	));
}

export async function addMemberModalView() {
	return (ModalViewTemplete("멤버 추가", "callbackAddMember", ([
			BlockMultiUsersSelect("멤버로 추가할 유저를 선택해주세요. \n (물론, 카뎃만 선택 가능합니다!)",
			 "submitAddMember")
		])
	));
}

export async function delMemberModalView(groupId) {
	const memberList_ = await getGroupUser(groupId);
	const memberList = memberList_.map(item => {
		return {text:item.target_id, value:String(item.target_id)}
	});
	return (ModalViewTemplete("멤버 삭제", "callbackDelMember", ([
			BlockMultiStaicSelect("그룹에서 삭제할 멤버를 선택해주세요", "submitDelMember", memberList)
		])
	));
}

