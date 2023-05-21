import * as dbGroup from "../../DataBase/dbGroup.js";
import * as dbUser from "../../DataBase/dbUser.js";
import * as dbAlarm from "../../DataBase/dbAlarm.js";
import * as Blocks from "./utils/blocks.js";

function formatStrCurrentLocation(locationInfo) {
	if (locationInfo.length == 0) return "\n";
	let rv = "";

	locationInfo.forEach((elem) => {
		const targetId = elem.targetId;
		const location = elem.host;

		if (location)
			rv += `*<https://profile.intra.42.fr/users/${targetId}|✅ ${targetId}> : ${location}*\n`;
		else
			rv += `*<https://profile.intra.42.fr/users/${targetId}|❌ ${targetId}> : No*\n`;
	});
	return rv;
}

function formatStrUnorderedList(items) {
	let res = "";

	for (const i in items) {
		res += `•  ${items[i]} \n`;
	}
	return res;
}

function HomeViewTemplete(blocks) {
	return {
		type: "home",
		blocks,
	};
}

function ModalViewTemplete(titleText, callbackId, blocks) {
	return {
		callback_id: callbackId,
		type: "modal",
		title: {
			type: "plain_text",
			text: titleText,
			emoji: true,
		},
		submit: {
			type: "plain_text",
			text: "Submit",
			emoji: true,
		},
		close: {
			type: "plain_text",
			text: "Cancel",
			emoji: true,
		},
		blocks,
	};
}

/* -------------------------------- HOME VIEWS ---------------------------------- */

async function BlocklocationInfo(locationInfo, selectedType) {
	if (selectedType == "selectGroup" && locationInfo == null) {
		return [
			...Blocks.ContextMrkdwn(
				">선택한 그룹에 등록된 멤버가 없습니다.\n>'멤버 추가'로 멤버를 추가해보세요!"
			),
		];
	} else {
		const timeStamp = () => {
			const today = new Date();

			today.setHours(today.getHours() + 9);
			return today.toISOString().replace("T", " ").substring(0, 19);
		};
		const formattedLocationInfoStr = formatStrCurrentLocation(locationInfo);

		return [
			...Blocks.SectionMrkdwn(`마지막 업데이트: ${timeStamp()}`),
			...Blocks.SectionMrkdwn(formattedLocationInfoStr),
		];
	}
}

export async function mainHomeView(intraId, selectedUsersFromWorkspace, msg) {
	const selectedType = selectedUsersFromWorkspace
		? "selectUserFromWorkspace"
		: "selectGroup";
	const groupList = await dbGroup.getGroupList(intraId);
	const selectOptionList = groupList.map((item) => {
		return {
			text: item.name,
			value: String(item.groupId),
			selected: item.selected,
		};
	});
	const initialSelect = selectOptionList.filter((item) => item.selected)[0];

	selectOptionList.push({
		text: "워크스페이스에서 유저 선택...",
		value: "usersFromWorkspace",
	});

	let locationInfo = null;
	let memberManageButtonsBlock = [];
	let messageBlock = [];

	if (selectedType == "selectUserFromWorkspace")
		locationInfo = await dbUser.getUsersLocationInfo(
			selectedUsersFromWorkspace
		);
	else {
		if (initialSelect != null)
			locationInfo = await dbUser.getGroupLocationInfo(
				intraId,
				initialSelect.value
			);
		memberManageButtonsBlock = Blocks.ActionButtons([
			{
				text: "멤버 추가",
				value: "멤버 추가",
				actionId: "OpenModalAddMember",
			},
			{
				text: "멤버 직접 추가",
				value: "멤버 직접 추가",
				actionId: "OpenModalAddTextMember",
			},
			{
				text: "멤버 삭제",
				value: "멤버 삭제",
				actionId: "OpenModalDelMember",
			},
		]);
	}

	if (msg) messageBlock = Blocks.SectionMrkdwn(msg);

	return HomeViewTemplete([
		...Blocks.Header("👀 염탐하기"),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.SectionSelect(
			"염탐할 대상을 선택해주세요",
			"selectGlanceTarget",
			selectOptionList,
			initialSelect
		),
		...Blocks.SectionMrkdwn("\n"),
		...(await BlocklocationInfo(locationInfo, selectedType)),
		...messageBlock,
		...Blocks.SectionMrkdwn("\n"),
		...memberManageButtonsBlock,
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.Divider(),
		...Blocks.Header("🛠️ 설정 및 관리"),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.ActionButtons([
			{
				text: "그룹 관리",
				actionId: "goGroupManageView",
				value: "goGroupManageView",
			},
			{
				text: "알람 관리",
				actionId: "goAlarmManageView",
				value: "goAlarmManageView",
			},
		]),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.Divider(),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.SectionButton(
			"_사용방법을 모르시겠나요? 여기를 참고하세요!_ 📚",
			{ text: "Help", value: "Help" },
			"goManualView"
		),
	]);
}

export async function notRegisteredHomeView(slackId) {
	return HomeViewTemplete([
		...Blocks.Header("👋 환영합니다!"),
		...Blocks.SectionMrkdwn(
			"Glance42를 처음 이용하시는군요!\
			\n이 앱에 대한 간략한 소개를 해드리겠습니다.\
			\n\n• Glance42는, 클러스터에 체류하고 있는 카뎃들의 자리를 편리하게 조회👀할 수 있는 슬랙 앱입니다. ~(그래서 염탐42라고도 불려요!)~\
			\n• 원하는 사람👤의 자리를 이 앱을 통해 조회할 수 있음은 물론이고, 미리 등록해놓은 사람👥들을 한번에 조회할 수도 있습니다.\
			\n• 어떤 사람👤이 자리에 앉았을 때 봇이 메시지를 보내도록 알람⏰을 등록해둘 수도 있어요!"
		),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.Header("✨ 처음 서비스를 이용하기 전에 ..."),
		...Blocks.SectionMrkdwn(
			"처음 서비스를 이용하기 전 간단한 42API 인증이 필요합니다."
		),
		...Blocks.LinkButton(
			"'인증하기'를 통해 카뎃임을 인증해주세요. \n(인증은 최초 한번만 이루어집니다.)",
			{
				text: "인증하기",
				value: "auth",
				url: `${process.env.OAUTH42_REQUEST_URL}?guess=${slackId}`,
			},
			"requestAuth"
		),
	]);
}

export async function requestRegisterHomeView() {
	return HomeViewTemplete([
		...Blocks.Header("서비스 이용을 위한 인증 시도 중..."),
		...Blocks.SectionMrkdwn("인증이 완료되었다면 화면을 새로고침해주세요."),
	]);
}

export async function groupManageHomeView(intraId, msg) {
	const groupList_ = await dbGroup.getGroupList(intraId);
	const groupList = groupList_.map((x) => x.name);

	if (groupList.length == 0 && msg == null)
		msg =
			">생성된 그룹이 없습니다!\n>'그룹 생성' 버튼을 눌러 새로운 그룹을 생성해보세요.";
	return HomeViewTemplete([
		...Blocks.Header("👥 그룹 관리"),
		...Blocks.ContextMrkdwn("_홈/그룹 관리_"),
		...Blocks.ActionButtons([
			{ text: "< back", value: "뒤로가기", actionId: "goMainView" },
		]),
		...Blocks.Divider(),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.Header("📋 나의 그룹 리스트"),
		...Blocks.SectionMrkdwn(formatStrUnorderedList(groupList)),
		...Blocks.ContextMrkdwn(msg),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.ActionButtons([
			{
				text: "그룹 생성",
				value: "그룹 생성",
				actionId: "OpenModalAddGroup",
			},
			{
				text: "그룹 삭제",
				value: "그룹 삭제",
				actionId: "OpenModalDelGroup",
			},
			{
				text: "그룹 이름 변경",
				value: "그룹 이름 변경",
				actionId: "OpenModalModifyGroupName",
			},
		]),
	]);
}

export async function alarmManageHomeView(intraId, msg) {
	const alarmList_ = await dbAlarm.getAlarmList(intraId);
	const alarmList = alarmList_.map((x) => x.targetId);

	if (alarmList.length == 0 && msg == null)
		msg =
			">등록된 알람이 없습니다!\n>'알람 추가' 버튼을 눌러 새로운 알람을 등록해보세요.";
	return HomeViewTemplete([
		...Blocks.Header("⏰ 알람 관리"),
		...Blocks.ContextMrkdwn("_홈/알람 관리_"),
		...Blocks.ActionButtons([
			{ text: "< back", value: "뒤로가기", actionId: "goMainView" },
		]),
		...Blocks.Divider(),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.Header("📋 나의 알람 리스트"),
		...Blocks.SectionMrkdwn(formatStrUnorderedList(alarmList)),
		...Blocks.ContextMrkdwn(msg),
		...Blocks.SectionMrkdwn("\n"),
		...Blocks.ActionButtons([
			{
				text: "알람 추가",
				value: "알람 추가",
				actionId: "OpenModalAddAlarm",
			},
			{
				text: "알람 삭제",
				value: "알람 삭제",
				actionId: "OpenModalDelAlarm",
			},
		]),
	]);
}

export async function memberManageHomeView(intraId, selectGroup, msg) {
	const groupList_ = await dbGroup.getGroupList(intraId);
	const groupList = groupList_.map((item) => {
		return {
			text: item.name,
			value: String(item.groupId),
			selected: item.selected,
		};
	});

	if (selectGroup) {
		const memberList_ = await dbGroup.getMemberList(selectGroup.value);
		const memberList = memberList_.map((x) => x.targetId);

		if (memberList.length == 0 && msg == null)
			msg =
				">선택한 그룹에 등록된 멤버가 없습니다!\n>'멤버 추가' 버튼을 눌러 새로운 멤버를 추가해보세요.";
		return HomeViewTemplete([
			...Blocks.Header("👤 멤버 관리"),
			...Blocks.ContextMrkdwn("_홈/그룹 관리/멤버 관리_"),
			...Blocks.ActionButtons([
				{
					text: "< back",
					value: "뒤로가기",
					actionId: "goGroupManageView",
				},
			]),
			...Blocks.Divider(),
			...Blocks.SectionMrkdwn("\n"),
			...Blocks.SectionSelect(
				"멤버를 관리할 그룹을 선택해주세요",
				"selectGroupforMemberManage",
				groupList,
				selectGroup
			),
			...Blocks.SectionMrkdwn("\n"),
			...Blocks.Header("📋 이 그룹의 멤버 리스트"),
			...Blocks.SectionMrkdwn(formatStrUnorderedList(memberList)),
			...Blocks.ContextMrkdwn(msg),
			...Blocks.SectionMrkdwn("\n"),
			...Blocks.ActionButtons([
				{
					text: "멤버 추가",
					value: "멤버 추가",
					actionId: "OpenModalAddMember",
				},
				{
					text: "멤버 삭제",
					value: "멤버 삭제",
					actionId: "OpenModalDelMember",
				},
			]),
		]);
	} else
		return HomeViewTemplete([
			...Blocks.Header("👤 멤버 관리"),
			...Blocks.ContextMrkdwn("_홈/그룹 관리/멤버 관리_"),
			...Blocks.ActionButtons([
				{
					text: "< back",
					value: "뒤로가기",
					actionId: "goGroupManageView",
				},
			]),
			...Blocks.Divider(),
			...Blocks.SectionMrkdwn("\n\n"),
			...Blocks.SectionSelect(
				"멤버를 관리할 그룹을 선택해주세요",
				"selectGroupforMemberManage",
				groupList,
				false
			),
		]);
}

export async function manualHomeView() {
	return HomeViewTemplete([
		...Blocks.Header("도움말"),
		...Blocks.ContextMrkdwn("홈/도움말"),
		...Blocks.ActionButtons([
			{ text: "< back", value: "뒤로가기", actionId: "goMainView" },
		]),
		...Blocks.Divider(),
		...Blocks.Header("사용 방법"),
		...Blocks.SectionMrkdwn("어쩌구 저쩌구..."),
	]);
}

/* ----------------------------- MODAL VIEWS ---------------------------------- */

export async function selectUserFromWorkspaceModalView() {
	return ModalViewTemplete(
		"워크스페이스에서 유저 선택",
		"callbackSelectUserFromWorkspace",
		[
			Blocks.MultiUsersSelect(
				"염탐할 유저를 선택해주세요.\n(물론, 카뎃만 선택 가능합니다!)",
				"selectGlanceUser",
				"multiUsersSelect-glanceUser"
			),
		]
	);
}

export async function addGroupModalView() {
	return ModalViewTemplete("그룹 추가", "callbackAddGroup", [
		Blocks.TextInput(
			"추가할 그룹명을 입력해주세요",
			"writeAddGroupName",
			"textInput-groupName"
		),
	]);
}

export async function delGroupModalView(intraId) {
	const groupList_ = await dbGroup.getGroupList(intraId);
	const groupList = groupList_.map((item) => {
		return { text: item.name, value: String(item.groupId) };
	});

	return ModalViewTemplete("그룹 삭제", "callbackDelGroup", [
		Blocks.SingleStaicSelect(
			"삭제할 그룹을 선택해주세요\n(해당 그룹이 완전히 삭제되며, 되돌릴 수 없습니다)",
			"selectDelGroup",
			groupList
		),
	]);
}

export async function modifyGroupNameModalView(seekerId) {
	const groupList_ = await dbGroup.getGroupList(seekerId);
	const groupList = groupList_.map((item) => {
		return { text: item.name, value: String(item.groupId) };
	});

	return ModalViewTemplete("그룹 이름 변경", "callbackModifyGroupName", [
		Blocks.SingleStaicSelect(
			"이름을 변경할 그룹을 선택해주세요",
			"selectModifyNameGroup",
			groupList
		),
		Blocks.TextInput(
			"변경할 그룹명을 입력해주세요",
			"writeModifyGroupName",
			"textInput-groupName"
		),
	]);
}

export async function addAlarmModalView() {
	return ModalViewTemplete("알람 추가", "callbackAddAlarm", [
		Blocks.MultiUsersSelect(
			"알람을 받을 유저를 선택해주세요\n(물론, 카뎃만 선택 가능합니다!)",
			"selectAddAlarm",
			"multiUsersSelect-alarm"
		),
	]);
}

export async function delAlarmModalView(intraId) {
	const alarmList_ = await dbAlarm.getAlarmList(intraId);
	const alarmList = alarmList_.map((item) => {
		return { text: item.targetId, value: String(item.targetId) };
	});

	return ModalViewTemplete("알람 삭제", "callbackDelAlarm", [
		Blocks.MultiStaicSelect(
			"삭제할 알람을 선택해주세요",
			"selectDelAlarm",
			alarmList
		),
	]);
}

export async function addMemberModalView() {
	return ModalViewTemplete("멤버 추가", "callbackAddMember", [
		Blocks.MultiUsersSelect(
			"멤버로 추가할 유저를 선택해주세요\n(물론, 카뎃만 선택 가능합니다!)",
			"selectAddMember",
			"multiUsersSelect-groupMember"
		),
	]);
}

export async function addTextMemberModalView() {
	return ModalViewTemplete("멤버 직접 추가", "callbackAddMember", [
		Blocks.TextInput(
			"멤버로 추가할 유저를 선택해주세요\n(물론, 카뎃만 선택 가능합니다!)",
			"selectAddMember"
		),
	]);
}

export async function delMemberModalView(groupId) {
	const memberList_ = await dbGroup.getMemberList(groupId);
	const memberList = memberList_.map((item) => {
		return { text: item.targetId, value: String(item.targetId) };
	});

	return ModalViewTemplete("멤버 삭제", "callbackDelMember", [
		Blocks.MultiStaicSelect(
			"그룹에서 삭제할 멤버를 선택해주세요",
			"selectDelMember",
			memberList
		),
	]);
}
