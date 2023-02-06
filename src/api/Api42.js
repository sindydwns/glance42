import axios from "axios";

class Api42Error extends Error {
	constructor(originError, ...params) {
		super(...params);
		this.originError = originError;
	}
}

class Api42 {
	constructor() {
		this.issuedToken = null;
	}

	static async getAccessToken(issuedToken) {
		if (issuedToken != null) {
			const expireAt = new Date(
				(+issuedToken.created_at + +issuedToken.expires_in) * 1000
			);
			const now = new Date();

			if (expireAt > now) return issuedToken;
		}
		try {
			return await axios({
				method: "post",
				url: `${process.env.API_FT_ENDPOINT}/oauth/token`,
				data: {
					grant_type: "client_credentials",
					client_id: process.env.API_FT_UID,
					client_secret: process.env.API_FT_SECRET,
				},
			})
				.then((x) => x.data)
				.catch((e) => {
					throw new Api42Error(e);
				});
		} catch (e) {
			throw e;
		}
	}

	async fetch(method, path, config) {
		try {
			this.issuedToken = await this.getAccessToken(this.issuedToken);
			const headers = {
				...config?.headers,
				Authorization: `Bearer ${this.issuedToken.access_token}`,
			};

			return axios({
				...config,
				method,
				url: `${process.env.API_FT_ENDPOINT}${path}`,
				headers,
				validateStatus: (status) => status === 200,
			})
				.then((x) => x.data)
				.catch((e) => {
					throw new Api42Error(e);
				});
		} catch (e) {
			throw e;
		}
	}
}

export default new Api42();
