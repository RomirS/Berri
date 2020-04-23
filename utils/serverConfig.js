const expressConfig = require("./expressConfig");
const app = expressConfig();
const http = require('http');

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
module.exports = {
    serverConfig: function(){ server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); },
    createServer: function(){ return server }
};