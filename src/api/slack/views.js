import * as dbgroup from "../api/DataBase/dbGroup.js.js.js";
import * as dbUser from "../api/DataBase/dbUser.js.js.js.js";
import * as dbAlarm from "../api/DataBase/dbAlarm.js.js.js";
import * as block from "./utils/blocks.js"

function formatStrUnorderedList(items) {
	let res = "";
    for (let i in items) {
        res += (`•  ${items[i]} \n`);
    }
	return (res)
}

/* -------------------------------- VIEW TEMPLATE ------------------------------- */

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

export async function mainHomeView(intraId, selectedUsersFromWorkspace, msg) {
	const selectedType =  (selectedUsersFromWorkspace ? "selectUserFromWorkspace" : "selectGroup");
	const groupList = await dbgroup.getGroupList(intraId);
	const selectOptionList = groupList.map(item => {
		return {text:item.group_name, value:String(item.group_id), selected:item.selected}
	});
	const initialSelect = selectOptionList.filter((item) => item.selected)[0];
	selectOptionList.push({text:"워크스페이스에서 유저 선택...", value:"usersFromWorkspace"});

	let locationInfo;
	let memberManageButtonsBlock = [];
	let messageBlock = [];

	if (selectedType == "selectUserFromWorkspace")
		locationInfo = await dbUser.getUsersLocationInfo(selectedUsersFromWorkspace);
	else
	{
		locationInfo = await dbUser.getGroupLocationInfo(intraId, initialSelect.value);
		memberManageButtonsBlock = block.ActionButtons([
			{text:"멤버 추가", value:"멤버 추가", actionId:"OpenModalAddMember"},
			{text:"멤버 삭제", value:"멤버 삭제", actionId:"OpenModalDelMember"},]);
	}

	if (msg)
		messageBlock = block.SectionMrkdwn(msg);

	return (HomeViewTemplete([
		...block.Header("👀 염탐하기"),
		...block.SectionMrkdwn("\n"),
		...block.SectionSelect("염탐할 대상을 선택해주세요", "selectGlanceTarget", selectOptionList, initialSelect),
		...block.SectionMrkdwn("\n"),
		...await block.locationInfo(locationInfo, selectedType),
		...messageBlock,
		...block.SectionMrkdwn("\n"),
		...memberManageButtonsBlock,
		...block.SectionMrkdwn("\n"),
		...block.Divider(),
		...block.Header("🛠️ 설정 및 관리"),
		...block.SectionMrkdwn("\n"),
		...block.ActionButtons([
			{text: "그룹 관리", actionId: "goGroupManageView", value: "goGroupManageView",},
			{text: "알람 관리", actionId: "goAlarmManageView", value: "goAlarmManageView",},
		]),
		...block.SectionMrkdwn("\n"),
		...block.Divider(),
		...block.SectionMrkdwn("\n"),
		...block.SectionButton("_사용방법을 모르시겠나요? 여기를 참고하세요!_ 📚", {text:"Help", value:"Help"}, "goManualView"),
	]));
}

export async function notRegisteredHomeView(slackId) {
	return (HomeViewTemplete([
			...block.Header("👋 환영합니다!"),
			...block.SectionMrkdwn("Glance42를 처음 이용하시는군요!\
			\n이 앱에 대한 간략한 소개를 해드리겠습니다.\
			\n\n• Glance42는, 클러스터에 체류하고 있는 카뎃들의 자리를 편리하게 조회👀할 수 있는 슬랙 앱입니다. ~(그래서 염탐42라고도 불려요!)~\
			\n• 원하는 사람👤의 자리를 이 앱을 통해 조회할 수 있음은 물론이고, 미리 등록해놓은 사람👥들을 한번에 조회할 수도 있습니다.\
			\n• 어떤 사람👤이 자리에 앉았을 때 봇이 메시지를 보내도록 알람⏰을 등록해둘 수도 있어요!"),
			...block.SectionMrkdwn("\n"),
			...block.SectionMrkdwn("\n"),
			...block.Header("✨ 처음 서비스를 이용하기 전에 ..."),
			...block.SectionMrkdwn("처음 서비스를 이용하기 전 간단한 42API 인증이 필요합니다."),
			...block.LinkButton("'인증하기'를 통해 카뎃임을 인증해주세요. \n(인증은 최초 한번만 이루어집니다.)", 
			{text:'인증하기', value:'auth', url:`${process.env.OAUTH42_REQUEST_URL}?guess=${slackId}`},
			'requestAuth')
		])
	);
}

export async function requestRegisterHomeView() {
	return (HomeViewTemplete([
		...block.Header("서비스 이용을 위한 인증 시도 중..."),
		...block.SectionMrkdwn("인증이 완료되었다면 화면을 새로고침해주세요."),
	])
	);
}


export async function groupManageHomeView(intraId, msg) {
	const groupList_ = await dbgroup.getGroupList(intraId);
	const groupList = groupList_.map(x=>x.group_name);
	if (groupList.length == 0 && msg == null)
		msg = ">생성된 그룹이 없습니다!\n>'그룹 생성' 버튼을 눌러 새로운 그룹을 생성해보세요.";
	return (HomeViewTemplete([
		...block.Header("👥 그룹 관리"),
		...block.ContextMrkdwn("_홈/그룹 관리_"),
		...block.ActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...block.Divider(),
		...block.SectionMrkdwn("\n"),
		...block.Header("📋 나의 그룹 리스트"),
		...block.SectionMrkdwn(formatStrUnorderedList(groupList)),
		...block.ContextMrkdwn(msg),
		...block.SectionMrkdwn("\n"),
		...block.ActionButtons([
			{text:"그룹 생성", value:"그룹 생성", actionId:"OpenModalAddGroup"},
			{text:"그룹 삭제", value:"그룹 삭제", actionId:"OpenModalDelGroup"},
			{text:"그룹 이름 변경", value:"그룹 이름 변경", actionId:"OpenModalModifyGroupName"},
		]),
	]));
}

export async function alarmManageHomeView(intraId, msg) {
	const alarmList_ = await dbAlarm.getAlarmList(intraId);
	const alarmList = alarmList_.map(x=>x.targetId);
	if (alarmList.length == 0 && msg == null)
		msg = ">등록된 알람이 없습니다!\n>'알람 추가' 버튼을 눌러 새로운 알람을 등록해보세요.";
	return HomeViewTemplete([
		...block.Header("⏰ 알람 관리"),
		...block.ContextMrkdwn("_홈/알람 관리_"),
		...block.ActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...block.Divider(),
		...block.SectionMrkdwn("\n"),
		...block.Header("📋 나의 알람 리스트"),
		...block.SectionMrkdwn(formatStrUnorderedList(alarmList)),
		...block.ContextMrkdwn(msg),
		...block.SectionMrkdwn("\n"),
		...block.ActionButtons([
			{text:"알람 추가", value:"알람 추가", actionId:"OpenModalAddAlarm"},
			{text:"알람 삭제", value:"알람 삭제", actionId:"OpenModalDelAlarm"},
		]),
	]);
}

export async function memberManageHomeView(intraId, selectGroup, msg) {
	const groupList_ = await dbgroup.getGroupList(intraId);
	const groupList = groupList_.map(item => {
		return {text:item.group_name, value:String(item.group_id), selected:item.selected}
	});
	if (selectGroup) {
		const memberList_ = await dbgroup.getMemberList(selectGroup.value);
		const memberList = memberList_.map(x=>x.target_id);
		if (memberList.length == 0 && msg == null)
			msg = ">선택한 그룹에 등록된 멤버가 없습니다!\n>'멤버 추가' 버튼을 눌러 새로운 멤버를 추가해보세요.";
		return HomeViewTemplete([
			...block.Header("👤 멤버 관리"),
			...block.ContextMrkdwn("_홈/그룹 관리/멤버 관리_"),
			...block.ActionButtons([{text:"< back", value:"뒤로가기", actionId:"goGroupManageView"}]),
			...block.Divider(),
			...block.SectionMrkdwn("\n"),
			...block.SectionSelect("멤버를 관리할 그룹을 선택해주세요", "selectGroupforMemberManage", groupList, selectGroup),
			...block.SectionMrkdwn("\n"),
			...block.Header("📋 이 그룹의 멤버 리스트"),
			...block.SectionMrkdwn(formatStrUnorderedList(memberList)),
			...block.ContextMrkdwn(msg),
			...block.SectionMrkdwn("\n"),
			...block.ActionButtons([
				{text:"멤버 추가", value:"멤버 추가", actionId:"OpenModalAddMember"},
				{text:"멤버 삭제", value:"멤버 삭제", actionId:"OpenModalDelMember"},
			]),
		]);
	}
	else
		return HomeViewTemplete([
			...block.Header("👤 멤버 관리"),
			...block.ContextMrkdwn("_홈/그룹 관리/멤버 관리_"),
			...block.ActionButtons([{text:"< back", value:"뒤로가기", actionId:"goGroupManageView"}]),
			...block.Divider(),
			...block.SectionMrkdwn("\n\n"),
			...block.SectionSelect("멤버를 관리할 그룹을 선택해주세요", "selectGroupforMemberManage", groupList, false),
		]);
}

export async function manualHomeView() {
	return (HomeViewTemplete([
		...block.Header("도움말"),
		...block.ContextMrkdwn("홈/도움말"),
		...block.ActionButtons([{text:"< back", value:"뒤로가기", actionId:"goMainView"}]),
		...block.Divider(),
		...block.Header("사용 방법"),
		...block.SectionMrkdwn("어쩌구 저쩌구..."),
	]));
}

/* ----------------------------- MODAL VIEWS ---------------------------------- */

export async function selectUserFromWorkspaceModalView() {
	return (ModalViewTemplete("워크스페이스에서 유저 선택", "callbackSelectUserFromWorkspace", ([
			block.MultiUsersSelect("염탐할 유저를 선택해주세요.\n(물론, 카뎃만 선택 가능합니다!)",
			 "selectGlanceUser", "multiUsersSelect-glanceUser")
		])
	));
}

export async function addGroupModalView() {
	return (ModalViewTemplete("그룹 추가", "callbackAddGroup", ([
			block.TextInput("추가할 그룹명을 입력해주세요", "writeAddGroupName", "textInput-groupName"),
		])
	));
}

export async function delGroupModalView(intraId) {
	const groupList_ = await dbgroup.getGroupList(intraId);
	const groupList = groupList_.map(item => {
		return {text:item.group_name, value:String(item.group_id)}
	});
	return (ModalViewTemplete("그룹 삭제", "callbackDelGroup", ([
			block.SingleStaicSelect("삭제할 그룹을 선택해주세요\n(해당 그룹이 완전히 삭제되며, 되돌릴 수 없습니다)", "selectDelGroup", groupList)
		])
	));
}

export async function modifyGroupNameModalView(seekerId) {
	const groupList_ = await dbgroup.getGroupList(seekerId);
	const groupList = groupList_.map(item => {
		return {text:item.group_name, value:String(item.group_id)}
	});
	return (ModalViewTemplete("그룹 이름 변경", "callbackModifyGroupName", ([
			block.SingleStaicSelect("이름을 변경할 그룹을 선택해주세요", "selectModifyNameGroup", groupList),
			block.TextInput("변경할 그룹명을 입력해주세요", "writeModifyGroupName", "textInput-groupName")
		])
	));
}

export async function addAlarmModalView() {
	return (ModalViewTemplete("알람 추가", "callbackAddAlarm", ([
			block.MultiUsersSelect("알람을 받을 유저를 선택해주세요\n(물론, 카뎃만 선택 가능합니다!)",
			 "selectAddAlarm", "multiUsersSelect-alarm")
		])
	));
}

export async function delAlarmModalView(intraId) {
	const alarmList_ = await dbAlarm.getAlarmList(intraId);
	const alarmList = alarmList_.map(item => {
		return {text:item.targetId, value:String(item.targetId)}
	});
	return (ModalViewTemplete("알람 삭제", "callbackDelAlarm", ([
			block.MultiStaicSelect("삭제할 알람을 선택해주세요", "selectDelAlarm", alarmList)
		])
	));
}

export async function addMemberModalView() {
	return (ModalViewTemplete("멤버 추가", "callbackAddMember", ([
			block.MultiUsersSelect("멤버로 추가할 유저를 선택해주세요\n(물론, 카뎃만 선택 가능합니다!)",
			 "selectAddMember", "multiUsersSelect-groupMember")
		])
	));
}

export async function delMemberModalView(groupId) {
	const memberList_ = await dbgroup.getMemberList(groupId);
	const memberList = memberList_.map(item => {
		return {text:item.target_id, value:String(item.target_id)}
	});
	return (ModalViewTemplete("멤버 삭제", "callbackDelMember", ([
			block.MultiStaicSelect("그룹에서 삭제할 멤버를 선택해주세요", "selectDelMember", memberList)
		])
	));
}
