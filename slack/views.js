import { getGroupList, getMemberList, getSelectedGroupId, getUsersLocationInfo, getGroupLocationInfo, getAlarmList } from "../DataBase/utils.js";
import { BlockDivider, BlockHeader, BlockSectionMrkdwn,BlockSectionButton, BlockActionButtons, BlockContextMrkdwn, 
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

async function BlocklocationInfo(locationInfo, selectedGroupId)
{
	if (locationInfo == "") {
		if (selectedGroupId == null) 
			return [...BlockSectionMrkdwn("")];
		else
			return [...BlockContextMrkdwn(
			">선택한 그룹에 등록된 멤버가 없습니다.\n>_홈/그룹 관리/멤버 관리_ 에서 멤버를 추가해보세요!")];
	} 
	else {
		const locationInfoStr = formatStrCurrentLocation(locationInfo);
		return [...BlockSectionMrkdwn(locationInfoStr)];
	}
}

export async function mainHomeView(seekerId, justSelectedUsers) {
	const groupList_ = await getGroupList(seekerId);
	const groupList = groupList_.map(item => {
		return {text:item.group_name, value:String(item.group_id), selected:item.selected}
	});
	groupList.push({text:"워크스페이스에서 유저 선택...", value:"selectUserFromWorkspace"});
	const selectedGroupId = await getSelectedGroupId(seekerId);
	const initialSelect = groupList.filter((item) => item.selected)[0];
	
	let locationInfo = null;
	if (justSelectedUsers != null) {
		locationInfo = await getUsersLocationInfo(justSelectedUsers);
	}
	else if (selectedGroupId != "") {
		locationInfo = await getGroupLocationInfo(seekerId, selectedGroupId);
	}

	return (HomeViewTemplete([
			...BlockHeader("👀 염탐하기"),
			...BlockSectionMrkdwn("\n"),
			...BlockSectionSelect("염탐할 대상을 선택해주세요", "selectGlanceTarget", groupList, initialSelect),
			...BlockSectionMrkdwn("\n"),
			...await BlocklocationInfo(locationInfo, selectedGroupId),
			...BlockSectionMrkdwn("\n"),
			...BlockDivider(),
			...BlockHeader("🛠️ 설정 및 관리"),
			...BlockSectionMrkdwn("\n"),
			...BlockActionButtons([
				{text: "그룹 관리", actionId: "goGroupManageView", value: "goGroupManageView",},
				{text: "알람 관리", actionId: "goAlarmManageView", value: "goAlarmManageView",},
			]),
			...BlockSectionMrkdwn("\n"),
			...BlockDivider(),
			...BlockSectionMrkdwn("\n"),
			...BlockSectionButton("_사용방법을 모르시겠나요? 여기를 참고하세요!_ 📚", {text:"Help", value:"Help"}, "goManualView"),
		])
	);
}

export async function groupManageHomeView(seekerId, msg) {
	const groupList_ = await getGroupList(seekerId);
	const groupList = groupList_.map(x=>x.group_name);
	if (groupList.length == 0 && msg == null)
		msg = ">생성된 그룹이 없습니다!\n>'그룹 생성' 버튼을 눌러 새로운 그룹을 생성해보세요.";
	return (HomeViewTemplete([
		...BlockHeader("👥 그룹 관리"),
		...BlockContextMrkdwn("_홈/그룹 관리_"),
		...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...BlockDivider(),
		...BlockSectionMrkdwn("\n"),
		...BlockHeader("📋 나의 그룹 리스트"),
		...BlockSectionMrkdwn(formatStrUnorderedList(groupList)),
		...BlockContextMrkdwn(msg),
		...BlockSectionMrkdwn("\n"),
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
		msg = ">등록된 알람이 없습니다!\n>'알람 추가' 버튼을 눌러 새로운 알람을 등록해보세요.";
	return HomeViewTemplete([
		...BlockHeader("⏰ 알람 관리"),
		...BlockContextMrkdwn("_홈/알람 관리_"),
		...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...BlockDivider(),
		...BlockSectionMrkdwn("\n"),
		...BlockHeader("📋 나의 알람 리스트"),
		...BlockSectionMrkdwn(formatStrUnorderedList(alarmList)),
		...BlockContextMrkdwn(msg),
		...BlockSectionMrkdwn("\n"),
		...BlockActionButtons([
			{text:"알람 추가", value:"알람 추가", actionId:"OpenModalAddAlarm"},
			{text:"알람 삭제", value:"알람 삭제", actionId:"OpenModalDelAlarm"},
		]),
	]);
}

export async function memberManageHomeView(seekerId, selectGroup, msg) {
	const groupList_ = await getGroupList(seekerId);
	const groupList = groupList_.map(item => {
		return {text:item.group_name, value:String(item.group_id), selected:item.selected}
	});
	if (selectGroup) {
		const memberList_ = await getMemberList(selectGroup.value);
		const memberList = memberList_.map(x=>x.target_id);
		if (memberList.length == 0 && msg == null)
			msg = ">선택한 그룹에 등록된 멤버가 없습니다!\n>'멤버 추가' 버튼을 눌러 새로운 멤버를 추가해보세요.";
		return HomeViewTemplete([
			...BlockHeader("👤 멤버 관리"),
			...BlockContextMrkdwn("_홈/그룹 관리/멤버 관리_"),
			...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goGroupManageView"}]),
			...BlockDivider(),
			...BlockSectionMrkdwn("\n"),
			...BlockSectionSelect("멤버를 관리할 그룹을 선택해주세요", "selectGroupforMemberManage", groupList, selectGroup),
			...BlockSectionMrkdwn("\n"),
			...BlockHeader("📋 이 그룹의 멤버 리스트"),
			...BlockSectionMrkdwn(formatStrUnorderedList(memberList)),
			...BlockContextMrkdwn(msg),
			...BlockSectionMrkdwn("\n"),
			...BlockActionButtons([
				{text:"멤버 추가", value:"멤버 추가", actionId:"OpenModalAddMember"},
				{text:"멤버 삭제", value:"멤버 삭제", actionId:"OpenModalDelMember"},
			]),
		]);
	}
	else
		return HomeViewTemplete([
			...BlockHeader("👤 멤버 관리"),
			...BlockContextMrkdwn("_홈/그룹 관리/멤버 관리_"),
			...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goGroupManageView"}]),
			...BlockDivider(),
			...BlockSectionMrkdwn("\n\n"),
			...BlockSectionSelect("멤버를 관리할 그룹을 선택해주세요", "selectGroupforMemberManage", groupList, false),
		]);
}

export async function manualHomeView() {
	return (HomeViewTemplete([
		...BlockHeader("도움말"),
		...BlockContextMrkdwn("홈/도움말"),
		...BlockActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...BlockDivider(),
		...BlockHeader("사용 방법"),
		...BlockSectionMrkdwn("어쩌구 저쩌구..."),
	]));
}

/* ----------------------------- MODAL VIEWS ---------------------------------- */

export async function selectGlanceUserModalView() {
	return (ModalViewTemplete("워크스페이스에서 유저 선택", "callbackSelectGlanceUser", ([
			BlockMultiUsersSelect("염탐할 유저를 선택해주세요.\n(물론, 카뎃만 선택 가능합니다!)",
			 "selectDone-GlanceUser")
		])
	));
}

export async function addGroupModalView() {
	return (ModalViewTemplete("그룹 추가", "callbackAddGroup", ([
			BlockTextInput("추가할 그룹명을 입력해주세요", "writeAddGroupName")
		])
	));
}

export async function delGroupModalView(seekerId) {
	const groupList_ = await getGroupList(seekerId);
	const groupList = groupList_.map(item => {
		return {text:item.group_name, value:String(item.group_id)}
	});
	return (ModalViewTemplete("그룹 삭제", "callbackDelGroup", ([
			BlockSingleStaicSelect("삭제할 그룹을 선택해주세요\n(해당 그룹이 완전히 삭제되며, 되돌릴 수 없습니다)", "submitDelGroup", groupList)
		])
	));
}

export async function addAlarmModalView() {
	return (ModalViewTemplete("알람 추가", "callbackAddAlarm", ([
			BlockMultiUsersSelect("알람을 받을 유저를 선택해주세요\n(물론, 카뎃만 선택 가능합니다!)",
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
			BlockMultiUsersSelect("멤버로 추가할 유저를 선택해주세요\n(물론, 카뎃만 선택 가능합니다!)",
			 "submitAddMember")
		])
	));
}

export async function delMemberModalView(groupId) {
	const memberList_ = await getMemberList(groupId);
	const memberList = memberList_.map(item => {
		return {text:item.target_id, value:String(item.target_id)}
	});
	return (ModalViewTemplete("멤버 삭제", "callbackDelMember", ([
			BlockMultiStaicSelect("그룹에서 삭제할 멤버를 선택해주세요", "submitDelMember", memberList)
		])
	));
}

