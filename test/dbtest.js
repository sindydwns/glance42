import assert from "assert";
import { sequelize } from "../setting.js"
import * as userFuncs from "../DataBase/dbuser.js"; // ekwak
// import * as groupFuncs from "../DataBase/utils.js"; // hyeyukim
// import * as alarmFuncs from "../DataBase/utils.js"; // sanghwal
import { User, LocationStatus, Group, GroupMember } from "../models/index.js";

const strcmp = (str1, str2) => str1 < str2 ? -1 : str1 > str2 ? 1 : 0;
const sortByTargetId = (o1, o2) => strcmp(o1.targetId, o2.targetId);
await sequelize.sync({force: true});

// userFuncs.replaceLocationStatus
await userFuncs.replaceLocationStatus({"yonshin": "c1r1s1", "ekwak": "c1r1s2"});
assert.equal((await LocationStatus.findAll()).length, 2);
assert.equal((await LocationStatus.findOne({ where: {targetId: "yonshin"} })).host, "c1r1s1");
assert.equal((await LocationStatus.findOne({ where: {targetId: "ekwak"} })).host, "c1r1s2");
await userFuncs.replaceLocationStatus({"yonshin": "c2r2s2", "ekwak": "c3r3s3"}); // 변경
assert.equal((await LocationStatus.findAll()).length, 2);
assert.equal((await LocationStatus.findOne({ where: {targetId: "yonshin"} })).host, "c2r2s2");
assert.equal((await LocationStatus.findOne({ where: {targetId: "ekwak"} })).host, "c3r3s3");
await userFuncs.replaceLocationStatus({"yonshin": "c3r3s3", "ekwak": "c4r4s4", "hyeyukim": "c5r5s5"}); // 추가 및 변경
assert.equal((await LocationStatus.findAll()).length, 3);
assert.equal((await LocationStatus.findOne({ where: {targetId: "yonshin"} })).host, "c3r3s3");
assert.equal((await LocationStatus.findOne({ where: {targetId: "ekwak"} })).host, "c4r4s4");
assert.equal((await LocationStatus.findOne({ where: {targetId: "hyeyukim"} })).host, "c5r5s5");

// userFuncs.getUsersLocationInfo();
assert.deepEqual(
	(await userFuncs.getUsersLocationInfo([])).sort(sortByTargetId),
	[].sort(sortByTargetId)
);
assert.deepEqual(
	(await userFuncs.getUsersLocationInfo(["yonshin"])).sort(sortByTargetId),
	[{targetId:"yonshin", host:"c3r3s3"}].sort(sortByTargetId)
);
assert.deepEqual(
	(await userFuncs.getUsersLocationInfo(["yonshin", "sanghwal"])).sort(sortByTargetId),
	[{targetId:"yonshin", host:"c3r3s3"}, {targetId:"sanghwal", host:null}].sort(sortByTargetId)
);
assert.deepEqual(
	(await userFuncs.getUsersLocationInfo(["yonshin", "ekwak"])).sort(sortByTargetId),
	[{targetId:"yonshin", host:"c3r3s3"}, {targetId:"ekwak", host:"c4r4s4"}].sort(sortByTargetId)
);

// userFuncs.deleteAllLocationTable();
await userFuncs.deleteAllLocationTable();
assert.equal((await LocationStatus.findAll()).length, 0);
await userFuncs.deleteAllLocationTable(); // 재시도
assert.equal((await LocationStatus.findAll()).length, 0);

// userFuncs.deleteLocationTable();
await userFuncs.replaceLocationStatus({"yonshin": "c1r1s1", "ekwak": "c1r1s2", "hyeyukim": "c1r1s3", "sanghwal": "c1r1s4"});
await userFuncs.deleteLocationTable(["yonshin", "ekwak"]);
assert.equal((await LocationStatus.findAll()).length, 2);
assert.equal((await LocationStatus.findOne({ where: {targetId: "hyeyukim"}})).host, "c1r1s3");
assert.equal((await LocationStatus.findOne({ where: {targetId: "sanghwal"}})).host, "c1r1s4");
await userFuncs.deleteLocationTable(["yonshin", "ekwak"]); // 중복 삭제
assert.equal((await LocationStatus.findAll()).length, 2);
assert.equal((await LocationStatus.findOne({ where: {targetId: "hyeyukim"}})).host, "c1r1s3");
assert.equal((await LocationStatus.findOne({ where: {targetId: "sanghwal"}})).host, "c1r1s4");
await userFuncs.deleteLocationTable(["hyeyukim"]); // 한 명 삭제
assert.equal((await LocationStatus.findAll()).length, 1);
assert.equal((await LocationStatus.findOne({ where: {targetId: "sanghwal"}})).host, "c1r1s4");
await userFuncs.deleteLocationTable(["yonshin", "ekwak", "sanghwal"]); // 일부 삭제
assert.equal((await LocationStatus.findAll()).length, 0);

// userFuncs.registerNewClient();
await userFuncs.registerNewClient("yonshin", "AAAAAAAA");
assert.equal((await User.findAll()).length, 1);
assert.equal((await User.findOne({ where: {intraId: "yonshin"}})).slackId, "AAAAAAAA");
await userFuncs.registerNewClient("ekwak", "BBBBBBBB");
assert.equal((await User.findAll()).length, 2);
assert.equal((await User.findOne({ where: {intraId: "yonshin"}})).slackId, "AAAAAAAA");
assert.equal((await User.findOne({ where: {intraId: "ekwak"}})).slackId, "BBBBBBBB");
await userFuncs.registerNewClient("yonshin", "CCCCCCCC");
assert.equal((await User.findAll()).length, 2);
assert.equal((await User.findOne({ where: {intraId: "yonshin"}})).slackId, "CCCCCCCC");
assert.equal((await User.findOne({ where: {intraId: "ekwak"}})).slackId, "BBBBBBBB");

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
assert.equal((await userFuncs.getUserInfo("hyeyukim")), null);
assert.equal((await userFuncs.getUserInfo("sanghwal")), null);

// userFuncs.getGroupLocationInfo();
Group.destroy({ where: {}, truncate: true });
GroupMember.destroy({ where: {}, truncate: true });
LocationStatus.destroy({ where: {}, truncate: true });
LocationStatus.create({targetId: "yonshin", host: "c1r1s1"});
LocationStatus.create({targetId: "ekwak", host: "c2r2s2"});
LocationStatus.create({targetId: "hyeyukim", host: "c3r3s3"});
const createdGroup1 = await Group.create({intraId: "yonshin", name: "test group 1"});
GroupMember.create({groupId: createdGroup1.groupId, targetId: "ekwak"});
GroupMember.create({groupId: createdGroup1.groupId, targetId: "hyeyukim"});
const createdGroup2 = await Group.create({intraId: "yonshin", name: "test group 2"});
GroupMember.create({groupId: createdGroup2.groupId, targetId: "sanghwal"});
const createdGroup3 = await Group.create({intraId: "ekwak", name: "test group 3"});
GroupMember.create({groupId: createdGroup3.groupId, targetId: "yonshin"});
GroupMember.create({groupId: createdGroup3.groupId, targetId: "hyeyukim"});
GroupMember.create({groupId: createdGroup3.groupId, targetId: "sanghwal"});
const createdGroup4 = await Group.create({intraId: "ekwak", name: "test group 4"});
assert.equal(await userFuncs.getGroupLocationInfo("yonshin", createdGroup1.groupId), );
assert.deepEqual(
	(await userFuncs.getGroupLocationInfo("yonshin", createdGroup1.groupId)).sort(sortByTargetId),
	[{targetId:"ekwak", host:"c2r2s2"}, {targetId:"hyeyukim", host:"c3r3s3"}].sort(sortByTargetId),
	"기본 동작 테스트"
);
assert.deepEqual(
	(await userFuncs.getGroupLocationInfo("yonshin", createdGroup2.groupId)).sort(sortByTargetId),
	[{targetId:"sanghwal", host:null}].sort(sortByTargetId),
	"자리 정보 없음"
);
assert.deepEqual(
	(await userFuncs.getGroupLocationInfo("ekwak", createdGroup3.groupId)).sort(sortByTargetId),
	[{targetId:"yonshin", host:"c1r1s1"}, {targetId:"hyeyukim", host:"c3r3s3"}, {targetId:"sanghwal", host: null}].sort(sortByTargetId),
	"일부 자리 정보 없음"
);
assert.deepEqual(
	(await userFuncs.getGroupLocationInfo("ekwak", createdGroup4.groupId)).sort(sortByTargetId),
	[].sort(sortByTargetId),
	"비어 있는 그룹"
);
assert.deepEqual(
	(await userFuncs.getGroupLocationInfo("ekwak", createdGroup1.groupId)).sort(sortByTargetId),
	[].sort(sortByTargetId),
	"타인의 그룹을 조회"
);

// groupFuncs.getSelectedGroupId();
// groupFuncs.getGroupList();
// groupFuncs.getMemberList();
// groupFuncs.reflectWhetherSelected();
// groupFuncs.insertGroup();
// groupFuncs.deleteGroup();
// groupFuncs.insertMember();
// groupFuncs.deleteMember();

// alarmFuncs.getAlarmList();
// alarmFuncs.insertAlarm();
// alarmFuncs.deleteAlarm();
// alarmFuncs.getAllReservedAlarm();
// alarmFuncs.insertStatisticHost();
// alarmFuncs.deleteReservedAlarm();
// alarmFuncs.insertErrorLog();

console.log("done !");
