import * as dbUser from "../../../DataBase/dbUser.js";


양식
/**
 * @param {}
 * @brief 
 * @return {} 
 */


 /**
  * @param {} body
  * @param {} event
  * @param {} client
  * @brief body의 user.id를 반환. body자리에 null을 넣으면 event의 user가 반환하는 함수.
  * @return {} slackId
  */ 
export async function getClientSlackId(body, event, client) {
	const slackId = body ? body.user.id : event.user;

	return slackId;
}

/**
 * @param {}
 * @brief 
 * @return {} 
 */
export async function getClientIntraId(body, event, client) {
	const slackId = body ? body.user.id : event.user;
	const seekerId = dbUser.getIntraIdbySlackId(slackId);

	return seekerId;
}

/**
 * @param {}
 * @brief 
 * @return {} 
 */
export async function getUserNamebySlackId(client, slackId) {
	const userName = await client.users.info({
		user: slackId,
	});
	const displayName = userName.user.profile.display_name;
	const realName = userName.user.profile.real_name;

	if (displayName != "") return displayName;
	else return realName;
}
