import { getGroupList, getMemberList, getUsersLocationInfo, getGroupLocationInfo, getAlarmList } from "../DataBase/utils.js";
import { BlockDivider, BlockHeader, BlockSectionMrkdwn,BlockSectionButton, BlockActionButtons, BlockLinkButton, BlockContextMrkdwn, 
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

async function BlocklocationInfo(locationInfo, selectedType)
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

export async function mainHomeView(seekerId, selectedUsersFromWorkspace, msg) {
	const selectedType =  (selectedUsersFromWorkspace ? "selectUserFromWorkspace" : "selectGroup");
	const groupList = await getGroupList(seekerId);
	const selectOptionList = groupList.map(item => {
		return {text:item.group_name, value:String(item.group_id), selected:item.selected}
	});
	const initialSelect = selectOptionList.filter((item) => item.selected)[0];
	selectOptionList.push({text:"워크스페이스에서 유저 선택...", value:"usersFromWorkspace"});

	let locationInfo;
	let memberManageButtonsBlock = [];
	let messageBlock = [];

	if (selectedType == "selectUserFromWorkspace")
		locationInfo = await getUsersLocationInfo(selectedUsersFromWorkspace);
	else
	{
		locationInfo = await getGroupLocationInfo(seekerId, initialSelect.value);
		memberManageButtonsBlock = BlockActionButtons([
			{text:"멤버 추가", value:"멤버 추가", actionId:"OpenModalAddMember"},
			{text:"멤버 삭제", value:"멤버 삭제", actionId:"OpenModalDelMember"},]);
	}

	if (msg)
		messageBlock = BlockSectionMrkdwn(msg);

	return (HomeViewTemplete([
		...BlockHeader("👀 염탐하기"),
		...BlockSectionMrkdwn("\n"),
		...BlockSectionSelect("염탐할 대상을 선택해주세요", "selectGlanceTarget", selectOptionList, initialSelect),
		...BlockSectionMrkdwn("\n"),
		...await BlocklocationInfo(locationInfo, selectedType),
		...messageBlock,
		...BlockSectionMrkdwn("\n"),
		...memberManageButtonsBlock,
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
	]));
}

export async function notRegisteredHomeView(slackId) {
	return (HomeViewTemplete([
			...BlockHeader("👋 환영합니다!"),
			...BlockSectionMrkdwn("Glance42를 처음 이용하시는군요!\
			\n이 앱에 대한 간략한 소개를 해드리겠습니다.\
			\n\n• Glance42는, 클러스터에 체류하고 있는 카뎃들의 자리를 편리하게 조회👀할 수 있는 슬랙 앱입니다. ~(그래서 염탐42라고도 불려요!)~\
			\n• 원하는 사람👤의 자리를 이 앱을 통해 조회할 수 있음은 물론이고, 미리 등록해놓은 사람👥들을 한번에 조회할 수도 있습니다.\
			\n• 어떤 사람👤이 자리에 앉았을 때 봇이 메시지를 보내도록 알람⏰을 등록해둘 수도 있어요!"),
			...BlockSectionMrkdwn("\n"),
			...BlockSectionMrkdwn("\n"),
			...BlockHeader("✨ 처음 서비스를 이용하기 전에 ..."),
			...BlockSectionMrkdwn("처음 서비스를 이용하기 전 간단한 42API 인증이 필요합니다."),
			...BlockLinkButton("'인증하기'를 통해 카뎃임을 인증해주세요. \n(인증은 최초 한번만 이루어집니다.)", 
			{text:'인증하기', value:'auth', url:`${process.env.OAUTH42_REQUEST_URL}?guess=${slackId}`},
			'requestAuth')
		])
	);
}

export async function requestRegisterHomeView() {
	return (HomeViewTemplete([
		...BlockHeader("서비스 이용을 위한 인증 시도 중..."),
		...BlockSectionMrkdwn("인증이 완료되었다면 화면을 새로고침해주세요."),
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
			{text:"그룹 이름 변경", value:"그룹 이름 변경", actionId:"OpenModalModifyGroupName"},
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

export async function selectUserFromWorkspaceModalView() {
	return (ModalViewTemplete("워크스페이스에서 유저 선택", "callbackSelectUserFromWorkspace", ([
			BlockMultiUsersSelect("염탐할 유저를 선택해주세요.\n(물론, 카뎃만 선택 가능합니다!)",
			 "selectGlanceUser", "multiUsersSelect-glanceUser")
		])
	));
}

export async function addGroupModalView() {
	return (ModalViewTemplete("그룹 추가", "callbackAddGroup", ([
			BlockTextInput("추가할 그룹명을 입력해주세요", "writeAddGroupName", "textInput-groupName"),
		])
	));
}

export async function delGroupModalView(seekerId) {
	const groupList_ = await getGroupList(seekerId);
	const groupList = groupList_.map(item => {
		return {text:item.group_name, value:String(item.group_id)}
	});
	return (ModalViewTemplete("그룹 삭제", "callbackDelGroup", ([
			BlockSingleStaicSelect("삭제할 그룹을 선택해주세요\n(해당 그룹이 완전히 삭제되며, 되돌릴 수 없습니다)", "selectDelGroup", groupList)
		])
	));
}

export async function modifyGroupNameModalView(seekerId) {
	const groupList_ = await getGroupList(seekerId);
	const groupList = groupList_.map(item => {
		return {text:item.group_name, value:String(item.group_id)}
	});
	return (ModalViewTemplete("그룹 이름 변경", "callbackModifyGroupName", ([
			BlockSingleStaicSelect("이름을 변경할 그룹을 선택해주세요", "selectModifyNameGroup", groupList),
			BlockTextInput("변경할 그룹명을 입력해주세요", "writeModifyGroupName", "textInput-groupName")
		])
	));
}

export async function addAlarmModalView() {
	return (ModalViewTemplete("알람 추가", "callbackAddAlarm", ([
			BlockMultiUsersSelect("알람을 받을 유저를 선택해주세요\n(물론, 카뎃만 선택 가능합니다!)",
			 "selectAddAlarm", "multiUsersSelect-alarm")
		])
	));
}

export async function delAlarmModalView(seekerId) {
	const alarmList_ = await getAlarmList(seekerId);
	const alarmList = alarmList_.map(item => {
		return {text:item.target_id, value:String(item.target_id)}
	});
	return (ModalViewTemplete("알람 삭제", "callbackDelAlarm", ([
			BlockMultiStaicSelect("삭제할 알람을 선택해주세요", "selectDelAlarm", alarmList)
		])
	));
}

export async function addMemberModalView() {
	return (ModalViewTemplete("멤버 추가", "callbackAddMember", ([
			BlockMultiUsersSelect("멤버로 추가할 유저를 선택해주세요\n(물론, 카뎃만 선택 가능합니다!)",
			 "selectAddMember", "multiUsersSelect-groupMember")
		])
	));
}

export async function delMemberModalView(groupId) {
	const memberList_ = await getMemberList(groupId);
	const memberList = memberList_.map(item => {
		return {text:item.target_id, value:String(item.target_id)}
	});
	return (ModalViewTemplete("멤버 삭제", "callbackDelMember", ([
			BlockMultiStaicSelect("그룹에서 삭제할 멤버를 선택해주세요", "selectDelMember", memberList)
		])
	));
}
