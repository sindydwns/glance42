import * as dbUser from "../../api/DataBase/dbUser.js.js.js.js.js";

export async function getClientIntraId(body, event, client) {
	const slackId = body ? body.user.id : event.user;
	const seekerId = dbUser.getIntraIdbySlackId(slackId);
    return (seekerId);
}

export async function getUserNamebySlackId(client, slackId) {
	const userName = await client.users.info({
        user: slackId,
    });
	const displayName = userName.user.profile.display_name;
	const realName = userName.user.profile.real_name;
	if (displayName != "")
		return (displayName);
	else
		return (realName);
}
