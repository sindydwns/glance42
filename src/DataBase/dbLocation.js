import Sequelize from "sequelize";
import sequelize from "../../setting.js";
import LocationStatus from "../../models/locationStatus.js";
import Group from "../../models/group.js";
import GroupMember from "../../models/groupMember.js";

/**
 * Replaces the location statuses of the specified targets with the provided table.
 * @param {Object} table An object containing target IDs as keys and host locations as values.
 * @returns {Promise} A promise that resolves when the location statuses have been replaced.
 */
export async function replaceLocationStatus(table) {
	const keys = Object.keys(table);
	if (keys.length == 0)
		return;

	await sequelize.transaction(transaction => {
		return LocationStatus.bulkCreate(keys.map(x => ({ targetId: x, host: table[x] })), {
			fields: ['targetId', 'host'],
			updateOnDuplicate: ['host'],
			transaction
		});
	});
}

/**
 * Deletes all rows from the location table.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the rows were successfully deleted, or `false` if an error occurred.
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
 * Deletes rows from the location table for the specified targets.
 * @param {string[]} targets An array of target IDs.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the rows were successfully deleted, or `false` if an error occurred.
 */
export async function deleteLocationTable(targets) {
    if (targets == null) return false;
    if (targets.length == 0) return true;
  
	try {
	  // Use the destroy method of the LocationStatus model to delete records
	  await LocationStatus.destroy({
		where: {
		  targetId: {
			[Sequelize.Op.in]: targets
		  }
		}
	  });
	  return true;
	} catch (e) {
	  console.error(e);
	  return false;
	}
}

/**
 * Retrieves the location information for the members of a group.
 * @param {string} intraId - The intraId of the user who owns the group.
 * @param {number} groupId - The ID of the group.
 * @returns {Array} An array of objects, where each object has the following properties:
 *   - targetId {string}: The intraId of a group member.
 *   - host {string}: The host of the group member's location, or null if the location is unknown.
 */
export async function getGroupLocationInfo(intraId, groupId) {
	const group = await Group.findOne({ where: { groupId } });
	if (!group || group.intraId !== intraId) {
	  return [];
	}
	const groupMembers = await GroupMember.findAll({ where: { groupId } });
	const targetIds = groupMembers.map(member => member.targetId);
	if (targetIds.length === 0) {
	  return [];
	}
	const locations = await LocationStatus.findAll({ where: { targetId: targetIds } });
	const locationMap = new Map();
	for (const location of locations) {
	  locationMap.set(location.targetId, location);
	}
	return targetIds.map(targetId => {
	  const location = locationMap.get(targetId);
	  return { targetId, host: location ? location.host : null };
	});
  }
