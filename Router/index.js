import express from "express";
import authrouter from "./AuthRouter/authrouter.js";
import limbahrouter from "./MenejementRouter/limbahrouter.js";

const Router = express();
const api = "/api/v1";

// Rute Auth
Router.use(api, authrouter);

// Rute Limbah
Router.use(api, limbahrouter);

export default Router;
