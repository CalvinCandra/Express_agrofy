import express from "express";
import authrouter from "./AuthRouter/authrouter.js";
import userrouter from "./UserRouter/userrouter.js";
import kategorirouter from "./KategoriRouter/kategorirouter.js";

const Router = express();
const api = "/api/v1";

Router.use(api, authrouter);
Router.use(api, userrouter);
Router.use(api, kategorirouter);

export default Router;
