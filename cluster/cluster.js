let cluster = require('cluster');
let os = require('os');
let server = require('../server');

let cpus = os.cpus();

if(cluster.isMaster) {

    cpus.forEach(() => {
        cluster.fork()
    });

    cluster.on('listening', worker => {
        console.log('cluster processo %d conectado: ', worker.process.pid);
    });

    cluster.on('exit', worker => {
        console.log('cluster processo %d desconectado: ', worker.process.pid);
        cluster.fork();
    });
}
else {
    server.run();
}