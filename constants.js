const scheduleObjs = {};

scheduleObjs.api42pagingParams =  {
	"page[size]": "100",
	"range[host]": "c10,c9r9s9",
	"filter[primary]": true,
}

scheduleObjs.getAllActiveLocationParams = {
	...api42pagingParams,
	"filter[active]": true,
};

scheduleObjs.getChangedLocationLoginFunc = (past, now) => ({
	...api42pagingParams,
	"filter[active]": true,
	"range[begin_at]": `${new Date(past).toISOString()},${(new Date(now)).toISOString()}`,
});

scheduleObjs.getChangedLocationLogoutFunc = (past, now) => ({
	...api42pagingParams,
	"range[begin_at]": `${new Date(0).toISOString()},${(new Date(past)).toISOString()}`,
	"range[end_at]": `${new Date(past).toISOString()},${(new Date(now)).toISOString()}`,
});

for(const params of scheduleObjs)
	Object.freeze(params);

export default scheduleObjs;