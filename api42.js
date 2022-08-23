import axios from "axios";

let issuedToken = null;

async function getAccessToken(issuedToken) {
	if (issuedToken != null) {
		const expireAt = new Date((+issuedToken.created_at + +issuedToken.expires_in) * 1000);
		const now = new Date();
		if (expireAt > now)
			return issuedToken;
	}
	try {
		issuedToken = await axios({
			method: "post",
			url: `${process.env.API_FT_ENDPOINT}/oauth/token`,
			data: {
				grant_type: "client_credentials",
				client_id: process.env.API_FT_UID,
				client_secret: process.env.API_FT_SECRET,
			}
		}).then(x => x.data);
		return issuedToken;
	} catch(e) {throw e;}
}

export default async function api42(method, path, config) {
	try {
		issuedToken = await getAccessToken(issuedToken);
		const headers = {
			...config?.headers,
			Authorization: `Bearer ${issuedToken.access_token}`,
		};
		return axios({
			...config,
			method,
			url: `${process.env.API_FT_ENDPOINT}${path}`,
			headers,
			validateStatus: status => status < 500,
		}).then(x => x.data);
	} catch(e) {throw e;}
}
