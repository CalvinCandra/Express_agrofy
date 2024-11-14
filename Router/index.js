import express from "express";
import authrouter from "./AuthRouter/authrouter.js";

const Router = express();
const api = "/api/v1";

Router.use(api, authrouter);

export default Router;
