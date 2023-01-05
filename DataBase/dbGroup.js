import { sequelize } from "../setting.js";
import { Group, GroupMember } from "../models/index.js";

/**
 * @description 
 *  사용자가 현재 선택한 그룹의 groupId를 반환하는 함수.
 *  없으면 null 반환.
 * @param {string} intraId 사용자의 intraId.
 * @returns {int} 선택한 그룹의 groupId.
 */
 export async function getSelectedGroupId(intraId) {
	try {
		const selectedGroup = await Group.findOne({
			attributes: ['groupId'],
			where: {
				intraId: intraId,
				selected: 1
			}
		});
		if (selectedGroup == null)
			return (null);
		return selectedGroup.groupId;
	} catch(e) {
		console.error(e);
		return (null);
	}
}

/**
 * @description
 *  사용자(intraId)가 생성한 모든 그룹의 리스트를 반환하는 함수.
 *  실패하면 null 반환.
 * @param {string} intraId 사용자의 intraId.
 * @returns {Array<string>} 사용자의 그룹 리스트.
 */
 export async function getGroupList(intraId) {
	try {
		const groupList = await Group.findAll({
			attributes: ['groupId', 'name', 'selected'],
			where: { intraId },
		});
		return (groupList.reduce((acc, cur) => {
				acc.push(cur.dataValues);
				return acc;
			}, []));
	} catch (e) {
		console.error(e);
		return (null);
	}
}

/**
 * @description 그룹(groupId)에 속하는 모든 멤버를 배열 형태로 반환하는 함수.
 * @param {number} groupId 그룹의 groupId.
 * @returns {Array<string>} 해당 그룹의 멤버들의 리스트. 실패하면 null 반환.
 */
// Group.hasMany(GroupMember, {
// 	as: "groupMembers",
// 	foreignKey: "groupId",
// });

// GroupMember.belongsTo(Group, {
// 	as: "groups",
// 	foreignKey: "groupId",
// });
export async function getMemberList(groupId) {
	try {
		const users = await Group.findAll({
			where: { groupId },
			attributes : [],
			include : {
				model : GroupMember,
				attributes: ["targetId"],
				as: "groupMembers",
				required: true,
			},
		});
		return (users[0].groupMembers.map(x => x.dataValues));
	} catch (e) {
		console.log(e);
		return (null);
	}
}

/**
 * @description 사용자가 메인 화면에서 선택한 그룹 정보를 업데이트하는 함수.
 * @param {string} intraId 사용자의 intraId.
 * @param {number} selectedGroupId 
 *  사용자가 선택한 그룹의 groupId.
 *  사용자가 "워크스페이스에서 유저 선택"을 선택한 경우 null 값이 들어온다.
 * @returns 반환값 x.
 */
export async function updateSelectedGroup(intraId, selectedGroupId) {
	try {
		const [existingGroup, ...other] = await Group.findAll({
			where: { 
				intraId, 
				groupId : selectedGroupId
			}
		});
		if (existingGroup == null && selectedGroupId != null)
			throw ("intraId and selectedGroupId doesn't match!");
		await Group.update({
				selected: 0
			}, {
				where: { intraId }
			});
		if (selectedGroupId != null)
			await Group.update({
				selected: 1,
			}, {
				where: { groupId : selectedGroupId }
			});
	} catch (e) {
		console.error(e);
	}
}

/**
 * @description 사용자가 새로운 그룹을 추가하면 데이터베이스에 그룹을 추가하는 함수.
 * @param {string} intraId 사용자의 intraId.
 * @param {string|Array<string>} groupName 추가하고 싶은 그룹의 이름.
 * @returns 성공하면 true, 실패하면 false 반환.
 */
export async function insertGroup(intraId, groupName) {
	// console.error(`why?`, intraId);
	groupName = Array.isArray(groupName) ? groupName : [groupName];
	const values = groupName.map(x => ({intraId, name: x}));
	try {
		await Group.bulkCreate(values);
		return (true);
		
	} catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * @description
 *  사용자가 선택한 그룹을 데이터베이스에서 제거하는 함수.
 * @param {string} intraId 사용자의 intraId.
 * @param {number} groupId 사용자가 삭제하고자 하는 groupId.
 * @returns 성공하면 true, 실패하면 false.
 */
export async function deleteGroup(intraId, groupId) {
	try {
		await Group.destroy({
			where : { intraId, groupId }
		});
		await GroupMember.destroy({
			where : { groupId }
		})
		return (true);
	} catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * @description 특정 그룹에 멤버를 추가하는 함수.
 * @param {number} groupId 멤버를 추가하고자 하는 groupId.
 * @param {string|Array<string>} targetId 추가하고자 하는 멤버의 intraId.
 * @returns 성공하면 true, 실패하면 false.
 */
export async function insertMember(groupId, targetId) {
	targetId = Array.isArray(targetId) ? targetId : [targetId];
	const values = targetId.map(x => ({groupId, targetId: x}));
	try {
		await GroupMember.bulkCreate(values);
		return (true);
	} catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * @description 특정 그룹에서 멤버를 삭제하는 함수.
 * @param {number} groupId 삭제하고자 하는 멤버가 있는 그룹의 groupId.
 * @param {string} targetId 삭제하고자 하는 멤버의 intraId.
 * @returns 성공하면 true, 실패하면 false.
 */
export async function deleteMember(groupId, targetId) {
	try {
		await GroupMember.destroy({
			where : { groupId, targetId }
		});
		return (true);
	} catch (e) {
		console.error(e);
		return (false);
	}
}

export async function insertGroup(intraId, name) {
    try {
        await Group.create({
          intraId: intraId,
          name: name,
          selected: 0
    });
    return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

export async function updateGroupName(GroupId, newGroupName) {
    await Group.update({ name: newGroupName }, { where: { groupId: GroupId } });
    return true;
  }

export async function isRegisteredGroupName(intraId, groupName) {
  const group = await Group.findOne({
    where: {
    intraId,
    name: groupName
    }
  });
  return (group !== null);
}

export async function selectDuplicatedGroupMember(groupId, groupMembers) {
  groupMembers = Array.isArray(groupMembers) ? groupMembers : [groupMembers];
  const res_ = await GroupMember.findAll({
    where: {
      groupId,
      targetId : groupMembers,
    }
  });
  const res = res_.map(x => x.dataValues);
  return (res);
}
