import "./test-env-import.js";
import dotenv from "dotenv";
dotenv.config();
console.log("Index TEST_VAR: ", process.env.TEST_VAR);
