import * as userFuncs from "../../src/DataBase/dbUser.js";
import {Group, GroupMember, LocationStatus} from "../../src/DataBase/models/index.js";
//import sortByTargetId from "../dbtest.js";

const sortByTargetId = (o1, o2) => strcmp(o1.targetId, o2.targetId);

const constriant = [
	{ targetId: "yonshin", host: "c1r1s1" },
	{ targetId: "ekwak", host: "c2r2s2" },
	{ targetId: "hyeyukim", host: "c3r3s3" }
]

//userFuncs.getGroupLocationInfo();
Group.destroy({ where: {}, truncate: true });
GroupMember.destroy({ where: {}, truncate: true });
LocationStatus.destroy({ where: {}, truncate: true });
LocationStatus.create(constriant[0]);
LocationStatus.create(constriant[1]);
LocationStatus.create(constriant[2]);

const createdGroup1 = Group.create({
	groupId: 1,
	intraId: "yonshin",
	name: "test group 1",
	selected: true,
});
GroupMember.create({ 
	groupId: 1, 
	targetId: "ekwak",
});
GroupMember.create({
	groupId: 1, //createdGroup1.groupId,
	targetId: "hyeyukim",
});

const createdGroup2 = Group.create({
	groupId: 2,
	intraId: "yonshin",
	name: "test group 2",
	selected: false,
});
GroupMember.create({
	groupId: 2,
	targetId: "sanghwal",
});

const createdGroup3 = Group.create({
	groupId: 3,
	intraId: "ekwak",
	name: "test group 3",
	selected: false,
});
GroupMember.create({ 
	groupId: 3, 
	targetId: "yonshin",
});
GroupMember.create({
	groupId: 3,
	targetId: "hyeyukim",
});
GroupMember.create({
	groupId: 3,
	targetId: "sanghwal",
});

const createdGroup4 = Group.create({
	groupId:4,
	intraId: "ekwak",
	name: "test group 4",
	selected: false,
});

test("1 is 1", () => {
  expect(1).toBe(1);
});

test("testing getGroupLocationInfo... 기본 동작 테스트", async () => {
	const groupLocationInfo = await userFuncs.getGroupLocationInfo("yonshin", 1);
	expect(groupLocationInfo).toEqual(
		[
			{ targetId: "ekwak", host: "c2r2s2" },
			{ targetId: "hyeyukim", host: "c3r3s3" },
		]
	);
});

test("testing getGroupLocationInfo... 자리 정보 없음", async () => {
	const groupLocationInfo = await userFuncs.getGroupLocationInfo("yonshin", 2);
	expect(groupLocationInfo).toEqual(
		[{ targetId: "sanghwal", host: null }]
	);
});

test("testing getGroupLocationInfo... 일부 자리 정보 없음", async () => {
	const groupLocationInfo = await userFuncs.getGroupLocationInfo("ekwak", 3);
	expect(groupLocationInfo).toEqual(
		[
			{ targetId: "yonshin", host: "c1r1s1" },
			{ targetId: "hyeyukim", host: "c3r3s3" },
			{ targetId: "sanghwal", host: null },
		]
	);
});

test("testing getGroupLocationInfo... 비어 있는 그룹", () => {
	const groupLocationInfo = userFuncs.getGroupLocationInfo("ekwak", 4);
	expect(groupLocationInfo).toEqual({});
});

test("testing getGroupLocationInfo... 타인의 그룹을 조회", async () => {
	const groupLocationInfo = await userFuncs.getGroupLocationInfo("ekwak", 1);
	expect(groupLocationInfo).toEqual([]);
});