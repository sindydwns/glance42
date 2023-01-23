test("1 is 1", () => {
	expect(1).toBe(1);
});

//const sequelize = require('../../src/setting.js');
//const userFuncs = require("../../src/DataBase/dbUser.js");

import { sequelize } from "../../src/setting.js";
import * as userFuncs from "../../src/DataBase/dbUser.js";
//import * as groupFuncs from "../../src/DataBase/dbGroup.js";
//import * as alarmFuncs from "../../src/DataBase/alarm.js";
import {
	User,
	LocationStatus,
	Group,
	GroupMember,
	Alarm,
	ErrorLog,
} from "../../src/DataBase/models/index.js";

userFuncs.replaceLocationStatus({
	yonshin: "c1r1s1",
	ekwak: "c1r1s2",
});

test('testing replaceLocationStatus...', () => {
	expect(LocationStatus.findAll().length).toBe(2);
	expect((LocationStatus.findOne({ where: {  } })).host).toBe("c1r1s1");
	expect((LocationStatus.findOne({ where: { targetId: "ekwak" } })).host).toBe("c1r1s2");
});

//change to toEqual()
test('testing replaceLocationStatus...', () => {
  expect(LocationStatus.).toEqual({
    targetId: "yonshin",
    host: "c1r1s1",
  });
});


await userFuncs.replaceLocationStatus({
	yonshin: "c3r3s3",
	ekwak: "c4r4s4",
	hyeyukim: "c5r5s5",
});

test('testing replaceLocationStatus2...', () => {
	expect(LocationStatus.findAll().length).toBe(3);
	expect((LocationStatus.findOne({ where: { targetId: "yonshin" } })).host).toBe("c3r3s3");
	expect((LocationStatus.findOne({ where: { targetId: "ekwak" } })).host).toBe("c4r4s4");
	expect((LocationStatus.findOne({ where: { targetId: "hyeyukim" } })).host).toBe("c5r5s5");
});

