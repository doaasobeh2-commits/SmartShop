import { loadFoodApiConfig } from "./config";
import { startFoodApiServer } from "./app";

const config = loadFoodApiConfig();
startFoodApiServer(config);
