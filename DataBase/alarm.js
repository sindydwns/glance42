import { Alarm, ErrorLog, StatisticsHost } from "../models/index.js";
import { sequelize } from "../setting.js";

/**
 * @param {string} intraId
 * @return {Array<object>}
 */
export async function getAlarmList(intraId) {
	try {
		const alarmList = await Alarm.findAll({
			attributes: ['targetId'],
			where: {
				intraId
			}
		});
		return alarmList;
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * @param {string} intraId 
 * @param {string|Array<string>} targetId 
 * @returns {boolean}
 */
export async function insertAlarm(intraId, targetId) {
	targetId = Array.isArray(targetId) ? targetId : [targetId];
	const values = targetId.map(x => ({ intraId, targetId: x }));
	try {
		await Alarm.bulkCreate(values);
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * @param {string} intraId
 * @param {string|Array<string>} targetId
 * @returns {boolean}
 */
export async function deleteAlarm(intraId, targetId) {
	targetId = Array.isArray(targetId) ? targetId : [targetId];
	try {
		await Alarm.destroy({
			where: {
			intraId,
			targetId,
		}
		})
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * 
 * @param {Array<integer>} ids 
 * @returns {void}
 */
export async function deleteReservedAlarm(ids) {
	if (ids.length == 0)
		return ;
	await Alarm.destroy({
		where: {
			alarmId: ids,
		}
	})
}

/**
 * 
 * @param {STRING} message 
 * @returns {boolean}
 */
export async function insertErrorLog(message) {
	try {
		await ErrorLog.create({
			message,
		});
		return (true);
	}
	catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * 
 * @param {Array<Array<integer>>} data 
 * @returns {boolean}
 */
export async function insertStatisticHost(data) {
	const values = data.map(item => ({ cluster: item[0], studentCount: item[1] }));
	try {
		await StatisticsHost.bulkCreate(values, {
			fields: ['cluster', 'studentCount'],
			updateOnDuplicate: ['studentCount'],
		});
		return (true);
	}	
	catch (e) {
		console.error(e);
		return (false);
	}
}

/**
 * 
 * @returns {object}
 */
export async function getAllReservedAlarm() {
	try {
		Alarm.belongsTo(User, { foreignKey: 'intraId' });
		Alarm.belongsTo(LocationStatus, { foreignKey: 'targetId' });
		const alarms_ = await Alarm.findAll({
			where: {
				'$LocationStatus.host$': { [sequelize.Sequelize.Op.ne]: null }
			},
			attributes : ['alarmId', 'intraId', 'targetId'],
		  	include: [{
				model: User,
				attributes: ['slackId'],
				required: true,
		  }, {
				model: LocationStatus,
				attributes: ['host'],
				required: false,
		  }]
		});
		const alarm = alarms_.map(x => ({
			alarmId : x.dataValues.alarmId,
			intraId : x.dataValues.intraId,
			targetId : x.dataValues.targetId,
			host : x.dataValues.LocationStatus.host,
			slackId : x.dataValues.User.slackId}));
		return alarm;
	} catch (e) {
		console.error(e);
		return (false);
	}
}
