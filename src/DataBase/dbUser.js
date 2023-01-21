import Sequelize from "sequelize";
import { sequelize } from "../setting.js";
import { LocationStatus, User, Group, GroupMember } from "./models/index.js";

/**
 * @param {object} table key: targetId, value: host location
 * @brief table에 지정된 targetId의 location이 업데이트 된다. 트랜잭션이 적용됨.
 * @return {Promise | null} 자리가 업데이트 된 후의 table을 반환. 없으면 null이 반환됨.
 */
//@왜 여기있는 bulkCreate함수는 그대로 반환되는지? (다른곳에서는 true, false반환)
export async function replaceLocationStatus(table) {
	const keys = Object.keys(table);

	if (keys.length === 0) return;

	await sequelize.transaction((transaction) => {
		return LocationStatus.bulkCreate(
			keys.map((x) => ({ targetId: x, host: table[x] })),
			{
				fields: ["targetId", "host"],
				updateOnDuplicate: ["host"],
				transaction,
			}
		);
	});
}

/**
 * @brief location 테이블의 모든 내용을 지우는 함수.
 * @return {boolean} return true or return false if fail
 */
export async function deleteAllLocationTable() {
	try {
		await LocationStatus.truncate();
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

/**
 * @param {string[]} targets An array of target IDs.
 * @brief Location 테이블에 대한 targets 열을 삭제함
 * @return {boolean} return true or return false if fail
 */
export async function deleteLocationTable(targets) {
	if (targets == null) return false;
	if (targets.length === 0) return true;

	try {
		// Use the destroy method of the LocationStatus model to delete records
		await LocationStatus.destroy({
			where: {
				targetId: {
					[Sequelize.Op.in]: targets,
				},
			},
		});
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

/**
 * @param {string} intraId
 * @brief intraId로 User 테이블에서 찾아 반환하는 함수.
 * @return {boolean} 찾지 못하면 false
 */
export async function isExistIntraId(intraId) {
	const user = await User.findByPk(intraId);

	return user !== null;
}

/**
 * @param {string} intraId
 * @param {string} slackId
 * @brief User테이블에 intraId, slackId가 존재하면 update하고 없으면 create한다.
 */
export async function registerNewClient(intraId, slackId) {
	const user = await User.findByPk(intraId);

	if (user) {
		await user.update({ slackId });
	} else {
		await User.create({ intraId, slackId });
	}
}

/**
 * @param {string} slackId
 * @brief User테이블에서 slackId로 찾아본 후 있으면 intraId를 반환, 없으면 null을 반환하는 함수.
 * @return {string|null} The Intranet ID of the user, or null if no such user exists.
 */
export async function getIntraIdbySlackId(slackId) {
	const user = await User.findOne({ where: { slackId } });

	return user ? user.intraId : null;
}

/**
 * @param {string[]} targetIds
 * @brief targetIds에 대한 자리위치 (location)을 찾아 반환한다. 자리 위치가 null이어도 함께 반환하는 함수.
 * @return {Object[]} locationInfo
 */
export async function getUsersLocationInfo(targetIds) {
	const locationInfo = [];

	for (const targetId of targetIds) {
		// @ TODO: edit please
		// eslint-disable-next-line no-await-in-loop
		const locationStatus = await LocationStatus.findByPk(targetId);

		if (locationStatus) {
			locationInfo.push({
				targetId: locationStatus.targetId,
				host: locationStatus.host,
			});
		} else {
			locationInfo.push({ targetId, host: null });
		}
	}
	return locationInfo;
}

/**
 * @param {string} intraId
 * @param {number} groupId
 * @brief 그룹 리스트에서 그룹에 속한 맴버 정보를 가져온후 
 * 해당 맴버를 기준으로 locationStatus에서 자리 정보를 가져와 값을 이어준다 
 * 이를 통해 그룹에 속한 맴버의 자리정보를 수집하고 배열로 만들어 반환한다.
 * @return {Array}
 */

export async function getGroupLocationInfo(intraId, groupId) {
	const group = await groupList.findAll({
		where: {
			targetId, host
		},
		include: [{
			model: groupMember,
			attributes: ['groupId'],
			require: true,
		}, {
			model: LocationStatus,
			attributes: ['target_id'],
			require: false,
			where: intraId, groupId,
		}]
	});

	const locationInfo = group.map(x => ({
		targetId : x.targetId,
		host : x.host,
		intraId : x.intraId, //@check here: change to seekerId
		groupId : x.groupId,
	}));

	console.log(locationInfo);
	return locationInfo;
}

/**
 * @param {string} intraId
 * @brief intraId로 User테이블에서 정보를 찾아 반환하는 함수.
 * @return {Object} user object 찾지 못한 경우 null반환
 */

export async function getUserInfo(intraId) {
	const user = await User.findOne({
		where: { intraId },
	});

	return user;
}
