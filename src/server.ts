import app from "./app";
import env from "./utils/env";

app.listen(env.PORT, () => console.log(`Running on http://localhost:${env.PORT}`))