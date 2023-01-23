import {Group, GroupMember, LocationStatus} from "../../src/DataBase/models/index.js";

const constriant = [
	{ targetId: "yonshin", host: "c1r1s1" },
	{ targetId: "ekwak", host: "c2r2s2" },
	{ targetId: "hyeyukim", host: "c3r3s3" }
]

// userFuncs.getGroupLocationInfo();
Group.destroy({ where: {}, truncate: true });
GroupMember.destroy({ where: {}, truncate: true });
LocationStatus.destroy({ where: {}, truncate: true });
LocationStatus.create(constriant[0]);
LocationStatus.create(constriant[1]);
LocationStatus.create(constriant[2]);

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