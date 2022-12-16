import { getIntraIdbySlackId } from "../../DataBase/utils.js";

export async function getClientSlackId(body, event, client) {
  const slackId = body ? body.user.id : event.user;

  return slackId;
}

export async function getClientIntraId(body, event, client) {
  const slackId = body ? body.user.id : event.user;
  const seekerId = getIntraIdbySlackId(slackId);

  return seekerId;
}

export async function getUserNamebySlackId(client, slackId) {
  const userName = await client.users.info({
    user: slackId,
  });
  const displayName = userName.user.profile.display_name;
  const realName = userName.user.profile.real_name;

  if (displayName != "") return displayName;
  else return realName;
}
