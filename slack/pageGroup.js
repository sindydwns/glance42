import { getGls, addGroup, delGroup } from "../DataBase/utils.js";
import { getSeekerId, createView } from "./utils.js";
import { BlockSelect, BlockMrkdwn, BlockLabelInput, BlockHeader, BlockButtons, BlockDivider, BlockList, ModalTemplate } from "./block.js";
import { createHomeView } from "./pageHome.js";
import { createMemberManageView } from "./pageMember.js";

export default (app) => {
	app.action("goBackHome", async ({ack, body, client, logger}) => {
		await ack();
		const seekerId = await getSeekerId(body, null, client);
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await createHomeView(seekerId)
			})
		}
	);

    app.action("OpenModalAddGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);

        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await ModalTemplate(
                    "그룹 추가",
                    "추가할 그룹명을 입력해주세요",
                    null,
                    "callbackAddGroup"
                ),
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.action("OpenModalDelGroup", async ({ ack, body, client, logger }) => {
        await ack();
        const seekerId = await getSeekerId(body, null, client);
        const gls = await getGls(seekerId);
		
        try {
            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: await ModalTemplate(
                    "그룹 삭제",
                    "삭제할 그룹을 선택해주세요.",
                    gls.map((v) => ({ text: v.group_name, value: v.group_id, selected: v.selected })),
                    "callbackDelGroup"
                ),
            });
        } catch (error) {
            logger.error(error);
        }
    });

	app.action("modalAddGroup", async ({ ack, body, client, logger}) => {
		await ack();
		console.log("Maybe this is for error check of selected value?");
		// 선택한 워크스페이스 유저에 대한 valid check하기 (user_list에 속한 id인지 확인)
	});

	app.view({ callback_id: 'callbackAddGroup', type: 'view_submission' }, async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]["modalAddGroup"]['value'];
        const seekerId = await getSeekerId(body, null, client);
		
		let msg = '';
		const result = await addGroup(seekerId, inputVal);
		// if (result)
		// 	msg = "그룹이 정상적으로 추가되었습니다";
		// else 
		// 	msg = "그룹 추가 중 오류가 발생했습니다";
		// await client.chat.postMessage({
		//   channel: body['user']['id'],
		//   text: msg
		// });

		try {
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await createGroupManageView(seekerId),
			});
        } catch (e) {
            logger.error(e);
        }
	});

	// app.view({ callback_id: 'callbackAddGroup', type: 'view_closed' }, async ({ ack, body, view, client, logger }) => {
    //     console.log("창 닫힘 동작완료");
	// 	await ack();

	// 	try {
    //         const seekerId = await getSeekerId(body, null, client);
    //         await client.views.update({
    //             view_id: body.view.id,
    //             hash: body.view.hash,
    //             view: await createGroupManageView(seekerId),
    //         });
    //     } catch (error) {
    //         logger.error(error);
    //     }
	// });


	app.view('callbackDelGroup', async ({ack, body, view, client, logger}) => {
		await ack();
		const inputVal = view['state']['values'][view.blocks[0].block_id]["modalDelGroup"]['selected_option']['text']['text'];
        const seekerId = await getSeekerId(body, null, client);

		let msg = '';
		const result = await delGroup(seekerId, inputVal);
		// if (result)
		// 	msg = "그룹이 정상적으로 삭제되었습니다";
		// else 
		// 	msg = "그룹 삭제 중 오류가 발생했습니다";
		// await client.chat.postMessage({
		//   channel: body['user']['id'],
		//   text: msg
		// });
		try {
            const seekerId = await getSeekerId(body, null, client);
            const result = await client.views.update({
				view_id: client.previous_view_id,
				view: await createGroupManageView(seekerId),
			});
        } catch (e) {
            logger.error(e);
        }
	});

	app.action("goPageMember", async ({ack, body, client}) => {
		await ack();
		const groupId = '1';
		await client.views.update({
			view_id: body.view.id,
			hash: body.view.hash,
			view: await createMemberManageView(groupId)
		})
	});
};

export async function createGroupManageView(seekerId) {
	const gls_ = await getGls(seekerId);
	console.log(gls_);
	const gls = gls_.map(x=>x.group_name);
	return (createView([
		...BlockHeader("그룹 관리"),
		...BlockButtons([{text:"< back", value:"뒤로가기", actionId:"goBackHome"}]),
		...BlockDivider(),
		...BlockHeader("등록된 그룹 리스트"),
		...BlockList(gls),
		...BlockButtons([
			{text:"그룹 추가", value:"그룹 추가", actionId:"OpenModalAddGroup"},
			{text:"그룹 삭제", value:"그룹 삭제", actionId:"OpenModalDelGroup"},
			{text:"멤버 관리", value:"멤버 관리", actionId:"goPageMember"}
		]),
	]));
}