import express from "express";
import authrouter from "./AuthRouter/authrouter.js";
import userrouter from "./UserRouter/userrouter.js";

const Router = express();
const api = "/api/v1";

Router.use(api, authrouter);
Router.use(api, userrouter);

export default Router;
