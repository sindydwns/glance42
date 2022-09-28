/**
 *
 * @param {Object<{target_id:String, host:String}} locationInfo
 * @returns
 */
export function formatLocationStr(locationInfo) {
    let rv = "";
    locationInfo.forEach((elem) => {
        const targetId = elem.target_id;
        const location = elem.host;
        if (location) rv += `*<https://profile.intra.42.fr/users/${targetId}|✅ ${targetId}> : ${location}*\n`;
        else rv += `*<https://profile.intra.42.fr/users/${targetId}|❌ ${targetId}> : No*\n`;
    });
    return rv;
}

export async function getSeekerId(body, event, client) {
    const userId = body ? body.user.id : event.user;
    const userName = await client.users.info({
        user: userId,
    });
    return userName.user.profile.display_name;
}

export function createView(blocks) {
	return {
		type: "home",
		blocks: blocks
	};
};