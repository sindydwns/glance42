export async function getSeekerId(body, event, client) {
    const userId = body ? body.user.id : event.user;
    const userName = await client.users.info({
        user: userId,
    });
	const displayName = userName.user.profile.display_name;
	const realName = userName.user.profile.real_name;
	let seekerId = null;
	if (displayName != "")
		seekerId = displayName;
	else
		seekerId = realName;
    return (seekerId);
}

export async function getClientSlackId(body, event, client) {
    const slackId = body ? body.user.id : event.user;
    return (slackId);
}

export async function getUserNamebySlackId(client, userId) {
	const userName = await client.users.info({
        user: userId,
    });
	const displayName = userName.user.profile.display_name;
	const realName = userName.user.profile.real_name;
	if (displayName != "")
		return (displayName);
	else
		return (realName);
}
