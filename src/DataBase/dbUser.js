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
 * @return {boolean} A promise that resolves to `true` if a user with the specified Intranet ID exists, or `false` if no such user exists.
 */
export async function isExistIntraId(intraId) {
	const user = await User.findByPk(intraId);

	return user !== null;
}

/**
 * Registers a new client with the specified Intranet ID and Slack ID.
 * If a user with the specified Intranet ID already exists, their Slack ID will be updated.
 * If no such user exists, a new user will be created with the specified Intranet and Slack IDs.
 * @param {string} intraId The Intranet ID of the client to register.
 * @param {string} slackId The Slack ID of the client to register.
 * @returns {Promise} A promise that resolves when the registration is complete.
 *
/**
 * @param {}
 * @brief 
 * @return {}
 * @throws {}
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
 * Returns the Intranet ID of the user with the specified Slack ID.
 * If no such user exists, returns null.
 * @param {string} slackId The Slack ID of the user.
 * @returns {(string|null)} The Intranet ID of the user, or null if no such user exists.
 */
/**
 * @param {}
 * @brief 
 * @return {}
 * @throws {}
 */

export async function getIntraIdbySlackId(slackId) {
	const user = await User.findOne({ where: { slackId } });

	return user ? user.intraId : null;
}

/**
 * Returns location information for the specified user IDs.
 * @param {string[]} targetIds An array of user IDs.
 * @returns {Object[]} An array of objects containing location information for the specified user IDs. Each object has the following properties:
 * - `targetId`: the user ID.
 * - `host`: the hostname of the user's current location, or null if no location information is available for the user.
 */
/**
 * @param {}
 * @brief 
 * @return {}
 * @throws {}
 */

export async function getUsersLocationInfo(targetIds) {
	const locationInfo = [];

	for (const targetId of targetIds) {
		// TODO: edit please
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
 * Retrieves the location information for the members of a group.
 * @param {string} intraId - The intraId of the user who owns the group.
 * @param {number} groupId - The ID of the group.
 * @returns {Array} An array of objects, where each object has the following properties:
 *   - targetId {string}: The intraId of a group member.
 *   - host {string}: The host of the group member's location, or null if the location is unknown.
 */
/**
 * @param {}
 * @brief 
 * @return {}
 * @throws {}
 */

export async function getGroupLocationInfo(intraId, groupId) {
	const group = await Group.findOne({ where: { groupId } });

	if (!group || group.intraId !== intraId) {
		return [];
	}
	const groupMembers = await GroupMember.findAll({ where: { groupId } });
	const targetIds = groupMembers.map((member) => member.targetId);

	if (targetIds.length === 0) {
		return [];
	}
	const locations = await LocationStatus.findAll({
		where: { targetId: targetIds },
	});
	const locationMap = new Map();

	for (const location of locations) {
		locationMap.set(location.targetId, location);
	}
	return targetIds.map((targetId) => {
		const location = locationMap.get(targetId);

		return { targetId, host: location ? location.host : null };
	});
}

/**
 * Get the user information for the given intraId
 * @param {string} intraId - The intraId of the user to get information for
 * @returns {Object} The user information, or null if no user was found
 */
/**
 * @param {}
 * @brief 
 * @return {}
 * @throws {}
 */

export async function getUserInfo(intraId) {
	const user = await User.findOne({
		where: { intraId },
	});

	return user;
}
