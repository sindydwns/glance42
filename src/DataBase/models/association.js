import Group from './group.js'
import GroupMember from './groupMember.js'

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
