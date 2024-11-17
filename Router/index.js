import express from "express";
import authrouter from "./AuthRouter/authrouter.js";
import limbahrouter from "./MenejementRouter/limbahrouter.js";
import userrouter from "./UserRouter/userrouter.js";

const Router = express();
const api = "/api/v1";

// Rute Auth
Router.use(api, authrouter);

// Rute User Admin
Router.use(api, userrouter);

// Rute Limbah
Router.use(api, limbahrouter);

export default Router;
