import { Group, GroupMember } from "./models/index.js";

/**
 * @param {string} intraId
 * @brief intraId의 사용자가 현재 선택한 그룹의 groupId를 반환한다.
 * @return {int} 선택한 그룹의 groupId
 * @throws {null} 반환값이 없을 시 return null
 */
export async function getSelectedGroupId(intraId) {
	try {
		const selectedGroup = await Group.findOne({
			attributes: ["groupId"],
			where: {
				intraId,
				selected: 1,
			},
		});

		if (selectedGroup == null) return null;
		return selectedGroup.groupId;
	} catch (e) {
		console.error(e);
		return null;
	}
}

/**
 * @param {string} intraId
 * @brief intraId의 사용자가 생성한 모든 그룹의 리스트를 반환하는 함수.
 * @return {Array<string>} 사용자의 그룹 리스트.
 * @throws {null} 반환값이 없을 시 return null
 */
export async function getGroupList(intraId) {
	try {
		const groupList = await Group.findAll({
			attributes: ["groupId", "name", "selected"],
			where: { intraId },
		});

		return groupList.reduce((acc, cur) => {
			acc.push(cur.dataValues);
			return acc;
		}, []);
	} catch (e) {
		console.error(e);
		return null;
	}
}

/**
 * @param {number} groupId
 * @brief 그룹(groupId)에 속하는 모든 멤버를 배열 형태로 반환하는 함수.
 * @return {Array<string>} 해당 그룹의 멤버들의 리스트
 * @throws {null} 반환값이 없을 시 return null
 */
export async function getMemberList(groupId) {
	try {
		const users = await Group.findAll({
			where: { groupId },
			attributes: [],
			include: {
				model: GroupMember,
				attributes: ["targetId"],
				as: "groupMembers",
				required: true,
			},
		});

		return users[0].groupMembers.map((x) => x.dataValues);
	} catch (e) {
		console.log(e);
		return null;
	}
}

/**
 * @param {string} intraId
 * @param {number} selectedGroupId 선택한 그룹 Id, 그룹을 선택하지 않은 경우 null이 들어온다.
 * @brief 사용자가 선택한 그룹 정보를 업데이트하는 함수.
 */
export async function updateSelectedGroup(intraId, selectedGroupId) {
	try {
		const [existingGroup] = await Group.findAll({
			where: {
				intraId,
				groupId: selectedGroupId,
			},
		});

		if (existingGroup == null && selectedGroupId != null)
			throw new Error("intraId and selectedGroupId doesn't match!");
		await Group.update(
			{
				selected: 0,
			},
			{
				where: { intraId },
			}
		);
		if (selectedGroupId != null)
			await Group.update(
				{
					selected: 1,
				},
				{
					where: { groupId: selectedGroupId },
				}
			);
	} catch (e) {
		console.error(e);
	}
}

/**
 * @param {string} intraId
 * @param {string|Array<string>} groupName
 * @brief 사용자가 새로운 그룹을 추가하면 데이터베이스에 그룹을 추가하는 함수.
 * @return {boolean} return true or return false if fail
 */
export async function insertGroup(intraId, _groupName) {
	const groupName = Array.isArray(_groupName) ? _groupName : [_groupName];
	const values = groupName.map((x) => ({ intraId, name: x }));
	
	try {
		await Group.bulkCreate(values);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

/**
 * @param {string} intraId
 * @param {number} groupId
 * @brief 사용자가 선택한 그룹을 데이터베이스에서 제거하는 함수.
 * @return {boolean} return true or return false if fail
 */
export async function deleteGroup(intraId, groupId) {
	try {
		await Group.destroy({
			where: { intraId, groupId },
		});
		await GroupMember.destroy({
			where: { groupId },
		});
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

/**
 * @param {number} groupId
 * @param {string|Array<string>} _targetId
 * @brief groupId 그룹에 targetId 멤버를 추가하는 함수.
 * @return {boolean} return true or return false if fail
 */
export async function insertMember(groupId, _targetId) {
	const targetId = Array.isArray(_targetId) ? _targetId : [_targetId];
	const values = targetId.map((x) => ({ groupId, targetId: x }));
	
	try {
		await GroupMember.bulkCreate(values);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

/**
 * @param {number} groupId 삭제하고자 하는 멤버가 있는 그룹의 groupId.
 * @param {string} targetId 삭제하고자 하는 멤버의 intraId.
 * @brief 특정 그룹에서 멤버를 삭제하는 함수.
 * @return {boolean} return true or return false if fail
 */
export async function deleteMember(groupId, targetId) {
	try {
		await GroupMember.destroy({
			where: { groupId, targetId },
		});
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

/**
 * @param {number} GroupId
 * @param {string} newGroupName
 * @brief GroupId에 해당하는 그룹의 이음을 newGroupName으로 업데이트 하는 함수.
 * @return {boolean} return true
 */
export async function updateGroupName(GroupId, newGroupName) {
	await Group.update({ name: newGroupName }, { where: { groupId: GroupId } });
	return true;
}

/**
 * @param {string} intraId
 * @param {string} groupName
 * @brief groupName에 이미 존재하는 intraId인지 반환하는 함수.
 * @return {boolean} 그룹이 존재할 시 true반환. 아닐 시 false반환.
 */
export async function isRegisteredGroupName(intraId, groupName) {
	const group = await Group.findOne({
		where: {
			intraId,
			name: groupName,
		},
	});
	
	return group !== null;
}

/**
 * @param {number} groupId
 * @param {number} _groupMembers
 * @brief groupId 그룹에 groupMembers가 존재하면 그대로 반환
 * @return {object|null} 그룹에 멤버가 존재할 시 담은 배열을 반환. 아닐 시 null반환.
 */
export async function selectDuplicatedGroupMember(groupId, _groupMembers) {
	const groupMembers = Array.isArray(_groupMembers)
		? _groupMembers
		: [_groupMembers];
	const res_ = await GroupMember.findAll({
		where: {
			groupId,
			targetId: groupMembers,
		},
	});
	const res = res_.map((x) => x.dataValues);

	return res;
}
