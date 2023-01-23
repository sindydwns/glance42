//import { sequelize } from "../../src/setting.js";
//import * as userFuncs from "../../src/DataBase/dbuser.js"; // ekwak
//import { User, LocationStatus, Group, GroupMember } from "../../src/DataBase/models/index.js";
////import setTestEnv from "./env.path.js";

test("1 is 1", () => {
    expect(1).toBe(1);
  });

//const defaultArgs = {
//    yonshin: "c1r1s1",
//    ekwak: "c1r1s2",
//    hyeyukim: "c5r5s5",
//};

//const editArgs = {
//    yonshin: "c2r2s2",
//    ekwak: "c3r3s3",
//    hyeyukim: "c6r6s6",
//};

//const addEditArgs = {
//    yonshin: "c2r2s2",
//    ekwak: "c3r3s3",
//    hyeyukim: "c6r6s6",
//    jgo: "c10r2s6",
//};

//const deleteAddArgs = { yonshin: "c1r1s1", ekwak: "c1r1s2", hyeyukim: "c1r1s3", sanghwal: "c1r1s4" };

////setTestEnv();

//const strcmp = (str1, str2) => (str1 < str2 ? -1 : str1 > str2 ? 1 : 0);
//const sortByTargetId = (o1, o2) => strcmp(o1.targetId, o2.targetId);

//await sequelize.sync({ force: true });

//test("input user locationStatus", async () => {
//    const testArgs = defaultArgs;

//    await userFuncs.replaceLocationStatus(testArgs);
//    const testArr = await LocationStatus.findAll();
//    const findYonshin = await LocationStatus.findOne({ where: { targetId: "yonshin" } });
//    const findEkwak = await LocationStatus.findOne({ where: { targetId: "ekwak" } });
//    const findHyeyukim = await LocationStatus.findOne({ where: { targetId: "hyeyukim" } });

//    expect(testArr).toHaveLength(Object.keys(testArgs).length);
//    expect(findYonshin.dataValues.host).toBe(testArgs["yonshin"]);
//    expect(findEkwak.dataValues.host).toBe(testArgs["ekwak"]);
//    expect(findHyeyukim.dataValues.host).toBe(testArgs["hyeyukim"]);
//});

//test("replace registered user locationStatus", async () => {
//    const testArgs = editArgs;

//    await userFuncs.replaceLocationStatus(testArgs);
//    const testArr = await LocationStatus.findAll();
//    const findYonshin = await LocationStatus.findOne({ where: { targetId: "yonshin" } });
//    const findEkwak = await LocationStatus.findOne({ where: { targetId: "ekwak" } });
//    const findHyeyukim = await LocationStatus.findOne({ where: { targetId: "hyeyukim" } });

//    expect(testArr).toHaveLength(Object.keys(testArgs).length);
//    expect(findYonshin.dataValues.host).toBe(testArgs["yonshin"]);
//    expect(findEkwak.dataValues.host).toBe(testArgs["ekwak"]);
//    expect(findHyeyukim.dataValues.host).toBe(testArgs["hyeyukim"]);
//});

//test("replace registered user locationStatus && new user register", async () => {
//    const testArgs = addEditArgs;

//    await userFuncs.replaceLocationStatus(testArgs);
//    const testArr = await LocationStatus.findAll();
//    const findYonshin = await LocationStatus.findOne({ where: { targetId: "yonshin" } });
//    const findEkwak = await LocationStatus.findOne({ where: { targetId: "ekwak" } });
//    const findHyeyukim = await LocationStatus.findOne({ where: { targetId: "hyeyukim" } });
//    const findJgo = await LocationStatus.findOne({ where: { targetId: "jgo" } });

//    expect(testArr).toHaveLength(Object.keys(testArgs).length);
//    expect(findYonshin.dataValues.host).toBe(testArgs["yonshin"]);
//    expect(findEkwak.dataValues.host).toBe(testArgs["ekwak"]);
//    expect(findHyeyukim.dataValues.host).toBe(testArgs["hyeyukim"]);
//    expect(findJgo.dataValues.host).toBe(testArgs["jgo"]);
//});

//test("test Object user locationInfo", async () => {
//    const testArgs = addEditArgs;

//    const defaultObj = await userFuncs.getUsersLocationInfo([]);
//    const yonshinObj = await userFuncs.getUsersLocationInfo(["yonshin"]);
//    const yonshinSanghwalObj = await userFuncs.getUsersLocationInfo(["yonshin", "sanghwal"]);
//    const yonshinEkwakObj = await userFuncs.getUsersLocationInfo(["yonshin", "ekwak"]);

//    expect(defaultObj.sort(sortByTargetId)).toEqual([]);
//    expect(yonshinObj.sort(sortByTargetId)).toEqual([{ targetId: "yonshin", host: testArgs["yonshin"] }].sort(sortByTargetId));
//    expect(yonshinSanghwalObj.sort(sortByTargetId)).toEqual(
//        [
//            { targetId: "yonshin", host: testArgs["yonshin"] },
//            { targetId: "sanghwal", host: null },
//        ].sort(sortByTargetId)
//    );
//    expect(yonshinEkwakObj.sort(sortByTargetId)).toEqual(
//        [
//            { targetId: "yonshin", host: testArgs["yonshin"] },
//            { targetId: "ekwak", host: testArgs["ekwak"] },
//        ].sort(sortByTargetId)
//    );
//});

//test("delete LocationTable", async () => {
//    await userFuncs.deleteAllLocationTable();
//    let testArr = await LocationStatus.findAll();

//    expect(testArr).toHaveLength(0);
//    await userFuncs.deleteAllLocationTable();
//    testArr = await LocationStatus.findAll();
//    expect(testArr).toHaveLength(0);
//});

//test("add after delete", async () => {
//    const testArgs = deleteAddArgs;

//    await userFuncs.replaceLocationStatus(testArgs);
//    await userFuncs.deleteLocationTable(["yonshin", "ekwak"]);
//    const findHyeyukim = await LocationStatus.findOne({ where: { targetId: "hyeyukim" } });
//    let findSanghwal = await LocationStatus.findOne({ where: { targetId: "sanghwal" } });

//    let testArr = await LocationStatus.findAll();

//    expect(testArr).toHaveLength(2);
//    expect(findHyeyukim.dataValues.host).toBe(testArgs["hyeyukim"]);
//    expect(findSanghwal.dataValues.host).toBe(testArgs["sanghwal"]);
//    await userFuncs.deleteLocationTable(["yonshin", "ekwak"]); // 중복 삭제

//    testArr = await LocationStatus.findAll();
//    expect(testArr).toHaveLength(2);
//    expect(findHyeyukim.dataValues.host).toBe(testArgs["hyeyukim"]);
//    expect(findSanghwal.dataValues.host).toBe(testArgs["sanghwal"]);

//    await userFuncs.deleteLocationTable(["hyeyukim"]); // 한 명 삭제
//    testArr = await LocationStatus.findAll();
//    expect(testArr).toHaveLength(1);
//    findSanghwal = await LocationStatus.findOne({ where: { targetId: "sanghwal" } });
//    expect(findSanghwal.dataValues.host).toBe(testArgs["sanghwal"]);

//    await userFuncs.deleteLocationTable(["yonshin", "ekwak", "sanghwal"]); // 일부 삭제
//    testArr = await LocationStatus.findAll();
//    expect(testArr).toHaveLength(0);
//});

//test("test registerNewClient()", async () => {
//    // userFuncs.registerNewClient();
//    await userFuncs.registerNewClient("yonshin", "AAAAAAAA");
//    let testArgs = await User.findAll();
//    expect(testArgs).toHaveLength(1);

//    let findYonshin = await User.findOne({ where: { intraId: "yonshin" } });
//    expect(findYonshin.slackId).toBe("AAAAAAAA");
//    await userFuncs.registerNewClient("ekwak", "BBBBBBBB");
//    testArgs = await User.findAll();
//    expect(testArgs).toHaveLength(2);

//    let findEkwak = await User.findOne({ where: { intraId: "ekwak" } });
//    findYonshin = await User.findOne({ where: { intraId: "yonshin" } });

//    expect(findEkwak.slackId).toBe("BBBBBBBB");
//    expect(findYonshin.slackId).toBe("AAAAAAAA");

//    await userFuncs.registerNewClient("yonshin", "CCCCCCCC");

//    testArgs = await User.findAll();
//    expect(testArgs).toHaveLength(2);

//    findEkwak = await User.findOne({ where: { intraId: "ekwak" } });
//    findYonshin = await User.findOne({ where: { intraId: "yonshin" } });

//    expect(findEkwak.slackId).toBe("BBBBBBBB");
//    expect(findYonshin.slackId).toBe("CCCCCCCC");
//});

//test("test userFuncs.isExistIntraId()", async () => {
//    // userFuncs.isExistIntraId();

//    expect(await userFuncs.isExistIntraId("yonshin")).toBeTruthy();
//    expect(await userFuncs.isExistIntraId("ekwak")).toBeTruthy();
//    expect(await userFuncs.isExistIntraId("hyeyukim")).toBeFalsy();
//    expect(await userFuncs.isExistIntraId("sanghwal")).toBeFalsy();
//});

//test("userFuncs.getIntraIdbySlackId()", async () => {
//    // userFuncs.getIntraIdbySlackId();

//    expect(await userFuncs.getIntraIdbySlackId("CCCCCCCC")).toBe("yonshin");
//    expect(await userFuncs.getIntraIdbySlackId("BBBBBBBB")).toBe("ekwak");
//    expect(await userFuncs.getIntraIdbySlackId("AAAAAAAA")).toBe(null);
//});

//test("userFuncs.getUserInfo()", async () => {
//    // userFuncs.getUserInfo();

//    expect((await userFuncs.getUserInfo("yonshin")).slackId).toBe("CCCCCCCC");
//    expect((await userFuncs.getUserInfo("ekwak")).slackId).toBe("BBBBBBBB");
//    expect(await userFuncs.getUserInfo("hyeyukim")).toBe(null);
//    expect(await userFuncs.getUserInfo("sanghwal")).toBe(null);
//});

//test("", async () => {
//    // userFuncs.getGroupLocationInfo();
//    Group.destroy({ where: {}, truncate: true });
//    GroupMember.destroy({ where: {}, truncate: true });
//    LocationStatus.destroy({ where: {}, truncate: true });
//    LocationStatus.create({ targetId: "yonshin", host: "c1r1s1" });
//    LocationStatus.create({ targetId: "ekwak", host: "c2r2s2" });
//    LocationStatus.create({ targetId: "hyeyukim", host: "c3r3s3" });
//    const createdGroup1 = await Group.create({ intraId: "yonshin", name: "test group 1" });
//    GroupMember.create({ groupId: createdGroup1.groupId, targetId: "ekwak" });
//    GroupMember.create({ groupId: createdGroup1.groupId, targetId: "hyeyukim" });
//    const createdGroup2 = await Group.create({ intraId: "yonshin", name: "test group 2" });
//    GroupMember.create({ groupId: createdGroup2.groupId, targetId: "sanghwal" });
//    const createdGroup3 = await Group.create({ intraId: "ekwak", name: "test group 3" });
//    GroupMember.create({ groupId: createdGroup3.groupId, targetId: "yonshin" });
//    GroupMember.create({ groupId: createdGroup3.groupId, targetId: "hyeyukim" });
//    GroupMember.create({ groupId: createdGroup3.groupId, targetId: "sanghwal" });
//    const createdGroup4 = await Group.create({ intraId: "ekwak", name: "test group 4" });

//    expect((await userFuncs.getGroupLocationInfo("yonshin", createdGroup1.groupId)).sort(sortByTargetId)).toEqual(
//        [
//            { targetId: "ekwak", host: "c2r2s2" },
//            { targetId: "hyeyukim", host: "c3r3s3" },
//        ].sort(sortByTargetId)
//    );

//    expect((await userFuncs.getGroupLocationInfo("yonshin", createdGroup2.groupId)).sort(sortByTargetId)).toEqual(
//        [{ targetId: "sanghwal", host: null }].sort(sortByTargetId)
//    );

//    expect((await userFuncs.getGroupLocationInfo("ekwak", createdGroup3.groupId)).sort(sortByTargetId)).toEqual(
//        [
//            { targetId: "yonshin", host: "c1r1s1" },
//            { targetId: "hyeyukim", host: "c3r3s3" },
//            { targetId: "sanghwal", host: null },
//        ].sort(sortByTargetId)
//    );

//    expect((await userFuncs.getGroupLocationInfo("ekwak", createdGroup4.groupId)).sort(sortByTargetId)).toEqual(
//        [].sort(sortByTargetId)
//    );
	
//    expect((await userFuncs.getGroupLocationInfo("ekwak", createdGroup1.groupId)).sort(sortByTargetId)).toEqual(
//        [].sort(sortByTargetId)
//    );
//});
