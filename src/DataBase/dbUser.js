import Sequelize from "sequelize";
import sequelize from "../../setting.js";
import LocationStatus from "../../models/locationStatus.js";
import User from "../../models/user.js";
import Group from "../../models/group.js";
import GroupMember from "../../models/groupMember.js";

/**
 * Determines if a user with the specified Intranet ID exists.
 * @param {string} intraId The Intranet ID to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if a user with the specified Intranet ID exists, or `false` if no such user exists.
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
 */
 export async function registerNewClient(intraId, slackId) {
	const user = await User.findByPk(intraId);
	if (user) {
	  await user.update({ slackId: slackId });
	} else {
	  await User.create({ intraId: intraId, slackId: slackId });
	}
}

/**
 * Returns the Intranet ID of the user with the specified Slack ID.
 * If no such user exists, returns null.
 * @param {string} slackId The Slack ID of the user.
 * @returns {(string|null)} The Intranet ID of the user, or null if no such user exists.
 */
 export async function getIntraIdbySlackId(slackId) {
	const user = await User.findOne({ where: { slackId: slackId } });
	return user ? user.intraId : null;
}


/**
 * Returns location information for the specified user IDs.
 * @param {string[]} targetIds An array of user IDs.
 * @returns {Object[]} An array of objects containing location information for the specified user IDs. Each object has the following properties:
 * - `targetId`: the user ID.
 * - `host`: the hostname of the user's current location, or null if no location information is available for the user.
 */
 export async function getUsersLocationInfo(targetIds) {
	let locationInfo = [];
	for (const targetId of targetIds) {
	  const locationStatus = await LocationStatus.findByPk(targetId);
	  if (locationStatus) {
		locationInfo.push({ targetId: locationStatus.targetId, host: locationStatus.host });
	  } else {
		locationInfo.push({ targetId: targetId, host: null });
	  }
	}
	return locationInfo;
}

/**
 * Get the user information for the given intraId
 * @param {string} intraId - The intraId of the user to get information for
 * @returns {Object} The user information, or null if no user was found
 */
 export async function getUserInfo(intraId) {
	const user = await User.findOne({
	  where: { intraId }
	});
	return user;
}
