module.exports = {
	root: true,
	env: {
		browser: false,
		es2021: true,
	},
	extends: ["naver", "plugin:prettier/recommended"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: [],
};
