import dotenv from 'dotenv';
import setTestEnv from './env.path.js';

setTestEnv();

test("env test", () => {
    expect("jest_env").toBe(process.env.TEST)
})