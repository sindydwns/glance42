import dotenv from 'dotenv';
// process.cwd() 는 node가 실행되는 위치를 기준으로 한다.

const envPath = process.cwd() + "/test/.test.env";

const setTestEnv = () => dotenv.config({
    path: envPath
});
export default setTestEnv;