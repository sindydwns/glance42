import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader } from "./block.js";

export default app => {
	app.event("app_home_opened", async ({ event, client, logger }) => {
		try {
			const result = await client.views.publish({
				user_id: event.user,
				view: createHomeView()
			});
			logger.info(result);
		  }
		  catch (error) {
			logger.error(error);
		  }
	});
	
	app.action("test-select-id", async ({ ack, body, client, logger }) => {
		await ack();
		memberArrTestTempXYZ = [];
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: createHomeView()
		});
	});
	
	app.action("test-action-id", async ({ ack, body, client, logger }) => {
		await ack();
		memberArrTestTempXYZ.push(body.actions[0].value);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: createHomeView()
		});
	});

	var memberArrTestTempXYZ = [];
	function createHomeView() {
    return {
        type: "home",
        blocks: [
            BlockHeader("👀 염탐하기"),
            BlockSelect("염탐할 대상을 선택해주세요", [
                { title: "과묵한동반자들", value: "value-0" },
                { title: "염탐42멤버", value: "value-1" },
                { title: "👤 워크스페이스에서 유저 선택...", value: "value-2" },
            ], "test-select-id"),
            ...memberArrTestTempXYZ.map(x => BlockMrkdwn(x)),
            BlockLabelInput("test plain text", "test-action-id"),
        ]
    }
}
}
