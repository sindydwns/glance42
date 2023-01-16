import assert from "assert";
import { sequelize } from "../src/setting.js";
import * as userFuncs from "../src/DataBase/dbUser.js"; // ekwak
import * as groupFuncs from "../src/DataBase/dbGroup.js"; // hyeyukim
import * as alarmFuncs from "../src/DataBase/dbAlarm.js"; // sanghwal
import {
	User,
	LocationStatus,
	Group,
	GroupMember,
	Alarm,
	ErrorLog,
} from "../models/index.js";

const strcmp = (str1, str2) => {
	if (str1 < str2) return -1;
	if (str1 > str2) return 1;
	return 0;
};
const sortByTargetId = (o1, o2) => strcmp(o1.targetId, o2.targetId);

async function test1() {
	await sequelize.sync({ force: true });

	// userFuncs.replaceLocationStatus
	await userFuncs.replaceLocationStatus({
		yonshin: "c1r1s1",
		ekwak: "c1r1s2",
	});
	assert.equal((await LocationStatus.findAll()).length, 2);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "yonshin" } })).host,
		"c1r1s1"
	);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "ekwak" } })).host,
		"c1r1s2"
	);
	await userFuncs.replaceLocationStatus({
		yonshin: "c2r2s2",
		ekwak: "c3r3s3",
	}); // 변경
	assert.equal((await LocationStatus.findAll()).length, 2);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "yonshin" } })).host,
		"c2r2s2"
	);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "ekwak" } })).host,
		"c3r3s3"
	);
	await userFuncs.replaceLocationStatus({
		yonshin: "c3r3s3",
		ekwak: "c4r4s4",
		hyeyukim: "c5r5s5",
	}); // 추가 및 변경
	assert.equal((await LocationStatus.findAll()).length, 3);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "yonshin" } })).host,
		"c3r3s3"
	);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "ekwak" } })).host,
		"c4r4s4"
	);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "hyeyukim" } }))
			.host,
		"c5r5s5"
	);

	// userFuncs.getUsersLocationInfo();
	assert.deepEqual(
		(await userFuncs.getUsersLocationInfo([])).sort(sortByTargetId),
		[].sort(sortByTargetId)
	);
	assert.deepEqual(
		(await userFuncs.getUsersLocationInfo(["yonshin"])).sort(
			sortByTargetId
		),
		[{ targetId: "yonshin", host: "c3r3s3" }].sort(sortByTargetId)
	);
	assert.deepEqual(
		(await userFuncs.getUsersLocationInfo(["yonshin", "sanghwal"])).sort(
			sortByTargetId
		),
		[
			{ targetId: "yonshin", host: "c3r3s3" },
			{ targetId: "sanghwal", host: null },
		].sort(sortByTargetId)
	);
	assert.deepEqual(
		(await userFuncs.getUsersLocationInfo(["yonshin", "ekwak"])).sort(
			sortByTargetId
		),
		[
			{ targetId: "yonshin", host: "c3r3s3" },
			{ targetId: "ekwak", host: "c4r4s4" },
		].sort(sortByTargetId)
	);

	// userFuncs.deleteAllLocationTable();
	await userFuncs.deleteAllLocationTable();
	assert.equal((await LocationStatus.findAll()).length, 0);
	await userFuncs.deleteAllLocationTable(); // 재시도
	assert.equal((await LocationStatus.findAll()).length, 0);

	// userFuncs.deleteLocationTable();
	await userFuncs.replaceLocationStatus({
		yonshin: "c1r1s1",
		ekwak: "c1r1s2",
		hyeyukim: "c1r1s3",
		sanghwal: "c1r1s4",
	});
	await userFuncs.deleteLocationTable(["yonshin", "ekwak"]);
	assert.equal((await LocationStatus.findAll()).length, 2);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "hyeyukim" } }))
			.host,
		"c1r1s3"
	);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "sanghwal" } }))
			.host,
		"c1r1s4"
	);
	await userFuncs.deleteLocationTable(["yonshin", "ekwak"]); // 중복 삭제
	assert.equal((await LocationStatus.findAll()).length, 2);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "hyeyukim" } }))
			.host,
		"c1r1s3"
	);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "sanghwal" } }))
			.host,
		"c1r1s4"
	);
	await userFuncs.deleteLocationTable(["hyeyukim"]); // 한 명 삭제
	assert.equal((await LocationStatus.findAll()).length, 1);
	assert.equal(
		(await LocationStatus.findOne({ where: { targetId: "sanghwal" } }))
			.host,
		"c1r1s4"
	);
	await userFuncs.deleteLocationTable(["yonshin", "ekwak", "sanghwal"]); // 일부 삭제
	assert.equal((await LocationStatus.findAll()).length, 0);

	// userFuncs.registerNewClient();
	await userFuncs.registerNewClient("yonshin", "AAAAAAAA");
	assert.equal((await User.findAll()).length, 1);
	assert.equal(
		(await User.findOne({ where: { intraId: "yonshin" } })).slackId,
		"AAAAAAAA"
	);
	await userFuncs.registerNewClient("ekwak", "BBBBBBBB");
	assert.equal((await User.findAll()).length, 2);
	assert.equal(
		(await User.findOne({ where: { intraId: "yonshin" } })).slackId,
		"AAAAAAAA"
	);
	assert.equal(
		(await User.findOne({ where: { intraId: "ekwak" } })).slackId,
		"BBBBBBBB"
	);
	await userFuncs.registerNewClient("yonshin", "CCCCCCCC");
	assert.equal((await User.findAll()).length, 2);
	assert.equal(
		(await User.findOne({ where: { intraId: "yonshin" } })).slackId,
		"CCCCCCCC"
	);
	assert.equal(
		(await User.findOne({ where: { intraId: "ekwak" } })).slackId,
		"BBBBBBBB"
	);

	// userFuncs.isExistIntraId();
	assert.equal(await userFuncs.isExistIntraId("yonshin"), true);
	assert.equal(await userFuncs.isExistIntraId("ekwak"), true);
	assert.equal(await userFuncs.isExistIntraId("hyeyukim"), false);
	assert.equal(await userFuncs.isExistIntraId("sanghwal"), false);

	// userFuncs.getIntraIdbySlackId();
	assert.equal(await userFuncs.getIntraIdbySlackId("CCCCCCCC"), "yonshin");
	assert.equal(await userFuncs.getIntraIdbySlackId("BBBBBBBB"), "ekwak");
	assert.equal(await userFuncs.getIntraIdbySlackId("AAAAAAAA"), null);

	// userFuncs.getUserInfo();
	assert.equal((await userFuncs.getUserInfo("yonshin")).slackId, "CCCCCCCC");
	assert.equal((await userFuncs.getUserInfo("ekwak")).slackId, "BBBBBBBB");
	assert.equal(await userFuncs.getUserInfo("hyeyukim"), null);
	assert.equal(await userFuncs.getUserInfo("sanghwal"), null);

	// userFuncs.getGroupLocationInfo();
	Group.destroy({ where: {}, truncate: true });
	GroupMember.destroy({ where: {}, truncate: true });
	LocationStatus.destroy({ where: {}, truncate: true });
	LocationStatus.create({ targetId: "yonshin", host: "c1r1s1" });
	LocationStatus.create({ targetId: "ekwak", host: "c2r2s2" });
	LocationStatus.create({ targetId: "hyeyukim", host: "c3r3s3" });
	const createdGroup1 = await Group.create({
		intraId: "yonshin",
		name: "test group 1",
	});

	GroupMember.create({ groupId: createdGroup1.groupId, targetId: "ekwak" });
	GroupMember.create({
		groupId: createdGroup1.groupId,
		targetId: "hyeyukim",
	});
	const createdGroup2 = await Group.create({
		intraId: "yonshin",
		name: "test group 2",
	});

	GroupMember.create({
		groupId: createdGroup2.groupId,
		targetId: "sanghwal",
	});
	const createdGroup3 = await Group.create({
		intraId: "ekwak",
		name: "test group 3",
	});

	GroupMember.create({ groupId: createdGroup3.groupId, targetId: "yonshin" });
	GroupMember.create({
		groupId: createdGroup3.groupId,
		targetId: "hyeyukim",
	});
	GroupMember.create({
		groupId: createdGroup3.groupId,
		targetId: "sanghwal",
	});
	const createdGroup4 = await Group.create({
		intraId: "ekwak",
		name: "test group 4",
	});

	assert.equal(
		await userFuncs.getGroupLocationInfo("yonshin", createdGroup1.groupId)
	);
	assert.deepEqual(
		(
			await userFuncs.getGroupLocationInfo(
				"yonshin",
				createdGroup1.groupId
			)
		).sort(sortByTargetId),
		[
			{ targetId: "ekwak", host: "c2r2s2" },
			{ targetId: "hyeyukim", host: "c3r3s3" },
		].sort(sortByTargetId),
		"기본 동작 테스트"
	);
	assert.deepEqual(
		(
			await userFuncs.getGroupLocationInfo(
				"yonshin",
				createdGroup2.groupId
			)
		).sort(sortByTargetId),
		[{ targetId: "sanghwal", host: null }].sort(sortByTargetId),
		"자리 정보 없음"
	);
	assert.deepEqual(
		(
			await userFuncs.getGroupLocationInfo("ekwak", createdGroup3.groupId)
		).sort(sortByTargetId),
		[
			{ targetId: "yonshin", host: "c1r1s1" },
			{ targetId: "hyeyukim", host: "c3r3s3" },
			{ targetId: "sanghwal", host: null },
		].sort(sortByTargetId),
		"일부 자리 정보 없음"
	);
	assert.deepEqual(
		(
			await userFuncs.getGroupLocationInfo("ekwak", createdGroup4.groupId)
		).sort(sortByTargetId),
		[].sort(sortByTargetId),
		"비어 있는 그룹"
	);
	assert.deepEqual(
		(
			await userFuncs.getGroupLocationInfo("ekwak", createdGroup1.groupId)
		).sort(sortByTargetId),
		[].sort(sortByTargetId),
		"타인의 그룹을 조회"
	);
}
async function test2() {
	await sequelize.sync({ force: true });
	const yonshin = await User.create({
		intraId: "yonshin",
		slackId: "AAAAAAAA",
	});
	const hyeyukim = await User.create({
		intraId: "hyeyukim",
		slackId: "BBBBBBBB",
	});
	const sanghwal = await User.create({
		intraId: "sanghwal",
		slackId: "CCCCCCCC",
	});

	// groupFuncs.insertGroup();
	await groupFuncs.insertGroup(yonshin.intraId, "yonshin group 1");
	const yonshinGroup1 = await Group.findOne({
		where: { intraId: "yonshin" },
	});

	assert.equal((await Group.findAll()).length, 1);
	assert.equal(
		(await Group.findOne({ where: { intraId: "yonshin" } })).groupId,
		yonshinGroup1.groupId
	);
	assert.equal(
		(await Group.findOne({ where: { intraId: "yonshin" } })).name,
		"yonshin group 1"
	);
	await groupFuncs.insertGroup(hyeyukim.intraId, "hyeyukim group 1");
	const hyeyukimGroup1 = await Group.findOne({
		where: { intraId: "hyeyukim" },
	});

	assert.equal((await Group.findAll()).length, 2);
	assert.equal(
		(await Group.findOne({ where: { intraId: "yonshin" } })).groupId,
		yonshinGroup1.groupId
	);
	assert.equal(
		(await Group.findOne({ where: { intraId: "yonshin" } })).name,
		"yonshin group 1"
	);
	assert.equal(
		(await Group.findOne({ where: { intraId: "hyeyukim" } })).groupId,
		hyeyukimGroup1.groupId
	);
	assert.equal(
		(await Group.findOne({ where: { intraId: "hyeyukim" } })).name,
		"hyeyukim group 1"
	);
	await groupFuncs.insertGroup(yonshin.intraId, "yonshin group 2"); // yonshin has two group
	const yonshinGroup2 = await Group.findOne({
		where: { name: "yonshin group 2" },
	});

	assert.equal((await Group.findAll()).length, 3);
	assert.equal(
		(await Group.findOne({ where: { intraId: "yonshin" } })).groupId,
		yonshinGroup1.groupId
	);
	assert.equal(
		(await Group.findOne({ where: { intraId: "yonshin" } })).name,
		"yonshin group 1"
	);
	assert.equal(
		(await Group.findOne({ where: { intraId: "hyeyukim" } })).groupId,
		hyeyukimGroup1.groupId
	);
	assert.equal(
		(await Group.findOne({ where: { intraId: "hyeyukim" } })).name,
		"hyeyukim group 1"
	);
	assert.deepEqual(
		(await Group.findAll({ where: { intraId: "yonshin" } }))
			.map((x) => x.groupId)
			.sort(),
		[yonshinGroup1.groupId, yonshinGroup2.groupId].sort()
	);
	assert.deepEqual(
		(await Group.findAll({ where: { intraId: "yonshin" } }))
			.map((x) => x.name)
			.sort(),
		[yonshinGroup1.name, yonshinGroup2.name].sort()
	);
	assert.notEqual(yonshinGroup1.groupId, hyeyukimGroup1.groupId);
	assert.notEqual(hyeyukimGroup1.groupId, yonshinGroup2.groupId);
	assert.notEqual(yonshinGroup2.groupId, yonshinGroup1.groupId);

	// groupFuncs.insertMember();
	await groupFuncs.insertMember(yonshinGroup1.groupId, "hyeyukim");
	assert.equal((await GroupMember.findAll()).length, 1);
	assert.deepEqual(
		(
			await GroupMember.findAll({
				where: { groupId: yonshinGroup1.groupId },
			})
		)
			.map((x) => x.targetId)
			.sort(),
		["hyeyukim"].sort()
	);
	await groupFuncs.insertMember(yonshinGroup1.groupId, [
		"yonshin",
		"sanghwal",
		"ekwak",
	]);
	assert.equal((await GroupMember.findAll()).length, 4);
	assert.deepEqual(
		(
			await GroupMember.findAll({
				where: { groupId: yonshinGroup1.groupId },
			})
		)
			.map((x) => x.targetId)
			.sort(),
		["yonshin", "hyeyukim", "sanghwal", "ekwak"].sort()
	);
	await groupFuncs.insertMember(hyeyukimGroup1.groupId, ["yonshin", "ekwak"]);
	assert.equal((await GroupMember.findAll()).length, 6);
	assert.deepEqual(
		(
			await GroupMember.findAll({
				where: { groupId: hyeyukimGroup1.groupId },
			})
		)
			.map((x) => x.targetId)
			.sort(),
		["yonshin", "ekwak"].sort()
	);
	await groupFuncs.insertMember(yonshinGroup2.groupId, ["yonshin"]);
	assert.equal((await GroupMember.findAll()).length, 7);
	assert.deepEqual(
		(
			await GroupMember.findAll({
				where: { groupId: yonshinGroup2.groupId },
			})
		)
			.map((x) => x.targetId)
			.sort(),
		["yonshin"].sort()
	);

	// groupFuncs.updateSelectedGroup();
	assert.equal(
		(await Group.findAll({ where: { selected: false } })).length,
		3
	);
	await groupFuncs.updateSelectedGroup(
		yonshin.intraId,
		yonshinGroup1.groupId
	);
	assert.equal(
		(await Group.findAll({ where: { selected: false } })).length,
		2
	);
	assert.equal(
		(
			await Group.findOne({
				where: {
					selected: true,
					intraId: yonshin.intraId,
					groupId: yonshinGroup1.groupId,
				},
			})
		).name,
		"yonshin group 1"
	);
	await groupFuncs.updateSelectedGroup(
		hyeyukim.intraId,
		hyeyukimGroup1.groupId
	);
	assert.equal(
		(await Group.findAll({ where: { selected: false } })).length,
		1
	);
	assert.equal(
		(
			await Group.findOne({
				where: {
					selected: true,
					intraId: hyeyukim.intraId,
					groupId: hyeyukimGroup1.groupId,
				},
			})
		).name,
		"hyeyukim group 1"
	);
	await groupFuncs.updateSelectedGroup(
		yonshin.intraId,
		yonshinGroup2.groupId
	);
	assert.equal(
		(await Group.findAll({ where: { selected: false } })).length,
		1
	);
	assert.equal(
		(
			await Group.findOne({
				where: {
					selected: true,
					intraId: yonshin.intraId,
					groupId: yonshinGroup2.groupId,
				},
			})
		).name,
		"yonshin group 2"
	);
	await groupFuncs.updateSelectedGroup(
		yonshin.intraId,
		hyeyukimGroup1.groupId
	);
	assert.equal(
		(await Group.findAll({ where: { selected: false } })).length,
		1
	);
	assert.equal(
		(
			await Group.findOne({
				where: {
					selected: true,
					intraId: hyeyukim.intraId,
					groupId: hyeyukimGroup1.groupId,
				},
			})
		).name,
		"hyeyukim group 1"
	);
	assert.equal(
		(
			await Group.findOne({
				where: {
					selected: true,
					intraId: yonshin.intraId,
					groupId: yonshinGroup2.groupId,
				},
			})
		).name,
		"yonshin group 2"
	);

	// groupFuncs.getSelectedGroupId();
	assert.equal(
		await groupFuncs.getSelectedGroupId(yonshin.intraId),
		yonshinGroup2.groupId
	);
	assert.equal(
		await groupFuncs.getSelectedGroupId(hyeyukim.intraId),
		hyeyukimGroup1.groupId
	);
	assert.ok((await groupFuncs.getSelectedGroupId(sanghwal.intraId)) == null);

	// groupFuncs.getGroupList();
	assert.deepEqual(
		(await groupFuncs.getGroupList(yonshin.intraId))
			.map((x) => x.groupId)
			.sort(),
		[yonshinGroup1.groupId, yonshinGroup2.groupId].sort()
	);
	assert.deepEqual(
		(await groupFuncs.getGroupList(hyeyukim.intraId))
			.map((x) => x.groupId)
			.sort(),
		[hyeyukimGroup1.groupId].sort()
	);
	assert.deepEqual(
		(await groupFuncs.getGroupList(sanghwal.intraId))
			.map((x) => x.groupId)
			.sort(),
		[].sort()
	);
	assert.deepEqual(
		(await groupFuncs.getGroupList("")).map((x) => x.groupId).sort(),
		[].sort()
	);

	// groupFuncs.getMemberList();
	assert.deepEqual(
		(await groupFuncs.getMemberList(yonshinGroup1.groupId)).sort(
			sortByTargetId
		),
		[
			{ targetId: "yonshin" },
			{ targetId: "hyeyukim" },
			{ targetId: "sanghwal" },
			{ targetId: "ekwak" },
		].sort(sortByTargetId)
	);
	assert.deepEqual(
		(await groupFuncs.getMemberList(hyeyukimGroup1.groupId)).sort(
			sortByTargetId
		),
		[{ targetId: "yonshin" }, { targetId: "ekwak" }].sort(sortByTargetId)
	);
	assert.deepEqual(
		(await groupFuncs.getMemberList(yonshinGroup2.groupId)).sort(
			sortByTargetId
		),
		[{ targetId: "yonshin" }].sort(sortByTargetId)
	);

	// groupFuncs.deleteMember();
	await groupFuncs.deleteMember(yonshinGroup1.groupId, "ekwak");
	assert.deepEqual(
		(await groupFuncs.getMemberList(yonshinGroup1.groupId)).sort(
			sortByTargetId
		),
		[
			{ targetId: "yonshin" },
			{ targetId: "hyeyukim" },
			{ targetId: "sanghwal" },
		].sort(sortByTargetId)
	);
	assert.deepEqual(
		(await groupFuncs.getMemberList(hyeyukimGroup1.groupId)).sort(
			sortByTargetId
		),
		[{ targetId: "yonshin" }, { targetId: "ekwak" }].sort(sortByTargetId)
	);

	// groupFuncs.deleteGroup();
	await groupFuncs.deleteGroup(yonshin.intraId, yonshinGroup1.groupId);
	assert.ok(
		(await Group.findOne({ where: { groupId: yonshinGroup1.groupId } })) ==
			null
	);
	assert.ok(
		(await GroupMember.findOne({
			where: { groupId: yonshinGroup1.groupId },
		})) == null
	);
	assert.ok(
		(await Group.findOne({ where: { groupId: hyeyukimGroup1.groupId } })) !=
			null
	);
	assert.ok(
		(await GroupMember.findOne({
			where: { groupId: hyeyukimGroup1.groupId },
		})) != null
	);
	assert.ok(
		(await Group.findOne({ where: { groupId: yonshinGroup2.groupId } })) !=
			null
	);
	assert.ok(
		(await GroupMember.findOne({
			where: { groupId: yonshinGroup2.groupId },
		})) != null
	);
}
async function test3() {
	await sequelize.sync({ force: true });
	const yonshin = await User.create({
		intraId: "yonshin",
		slackId: "AAAAAAAA",
	});
	const sanghwal = await User.create({
		intraId: "sanghwal",
		slackId: "BBBBBBBB",
	});
	const ekwak = await User.create({ intraId: "ekwak", slackId: "CCCCCCCC" });

	await LocationStatus.create({ targetId: "yonshin", host: "c1r1s1" });
	await LocationStatus.create({ targetId: "sanghwal", host: "c2r2s2" });

	// alarmFuncs.insertAlarm();
	assert.ok(
		await alarmFuncs.insertAlarm(
			yonshin.intraId,
			ekwak.intraId,
			yonshin.slackId
		)
	);
	assert.equal((await Alarm.findAll()).length, 1);
	assert.equal(
		(await Alarm.findAll({ where: { intraId: yonshin.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { targetId: ekwak.intraId } })).length,
		1
	);
	assert.ok(
		await alarmFuncs.insertAlarm(
			yonshin.intraId,
			yonshin.intraId,
			yonshin.slackId
		)
	);
	assert.equal((await Alarm.findAll()).length, 2);
	assert.equal(
		(await Alarm.findAll({ where: { intraId: yonshin.intraId } })).length,
		2
	);
	assert.equal(
		(await Alarm.findAll({ where: { targetId: ekwak.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { targetId: yonshin.intraId } })).length,
		1
	);
	assert.ok(
		await alarmFuncs.insertAlarm(
			sanghwal.intraId,
			yonshin.intraId,
			yonshin.slackId
		)
	);
	assert.equal((await Alarm.findAll()).length, 3);
	assert.equal(
		(await Alarm.findAll({ where: { intraId: yonshin.intraId } })).length,
		2
	);
	assert.equal(
		(await Alarm.findAll({ where: { intraId: sanghwal.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { targetId: ekwak.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { targetId: yonshin.intraId } })).length,
		2
	);

	// alarmFuncs.getAlarmList();
	assert.deepEqual(
		(await alarmFuncs.getAlarmList(yonshin.intraId)).sort(sortByTargetId),
		[{ targetId: "ekwak" }, { targetId: "yonshin" }].sort(sortByTargetId)
	);
	assert.deepEqual(
		(await alarmFuncs.getAlarmList(sanghwal.intraId)).sort(sortByTargetId),
		[{ targetId: "yonshin" }].sort(sortByTargetId)
	);
	assert.deepEqual(
		(await alarmFuncs.getAlarmList(ekwak.intraId)).sort(sortByTargetId),
		[].sort(sortByTargetId)
	);

	// alarmFuncs.getAllReservedAlarm();
	// 이걸 어떻게 테스트하지..?
	// assert.deepEqual(
	// 	(await alarmFuncs.getAllReservedAlarm()).sort(sortByTargetId),
	// 	[...].sort(sortByTargetId)
	// );;
	assert.equal((await alarmFuncs.getAllReservedAlarm()).length, 2);

	// alarmFuncs.deleteReservedAlarm();
	const alarm1 = (await Alarm.findAll()).find(
		(x) => x.intraId === "yonshin" && x.targetId === "yonshin"
	);

	await alarmFuncs.deleteReservedAlarm(alarm1.alarmId);
	assert.equal((await Alarm.findAll()).length, 2);
	assert.equal(
		(await Alarm.findAll({ where: { intraId: yonshin.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { intraId: sanghwal.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { targetId: ekwak.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { targetId: yonshin.intraId } })).length,
		1
	);

	await alarmFuncs.insertAlarm(
		yonshin.intraId,
		yonshin.intraId,
		yonshin.slackId
	);
	// alarmFuncs.deleteAlarm();
	await alarmFuncs.deleteAlarm(yonshin.intraId, yonshin.intraId);
	assert.equal((await Alarm.findAll()).length, 2);
	assert.equal(
		(await Alarm.findAll({ where: { intraId: yonshin.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { intraId: sanghwal.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { targetId: ekwak.intraId } })).length,
		1
	);
	assert.equal(
		(await Alarm.findAll({ where: { targetId: yonshin.intraId } })).length,
		1
	);

	// alarmFuncs.insertStatisticHost();
	// await alarmFuncs.insertStatisticHost();

	// alarmFuncs.insertErrorLog();
	await alarmFuncs.insertErrorLog("yonshin error");
	assert((await ErrorLog.findAll())[0].message, "yonshin error");
}
await test1();
await test2();
await test3();

console.log("done !");
