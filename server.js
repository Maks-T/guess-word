const {App} = require('./src/app/app');

class Server {
   constructor() {
       this.app = new App();

       this.app.runServer();
   }
}

const server = new Server();


