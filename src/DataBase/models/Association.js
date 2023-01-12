import Group from "./Group.js";
import GroupMember from "./GroupMember.js";

Group.hasMany(GroupMember, {
	as: "groupMembers",
	foreignKey: "groupId",
	// otherKey: "groupId"
});

GroupMember.belongsTo(Group, {
	as: "groups",
	foreignKey: "groupId",
});

export default {};
