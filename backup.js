const SSH = require('ssh2');
const { transferDirectory } = require('./transfer.js');
const { sendSlackMessage } = require('./slack.js');
const moment = require('moment');

var listaServidores = [
    {
        host: '192.168.1.12',
        port: 22,
        // Credentials
        username: 'root',
        password: '123',

        //Detalhes backup
        diretorioRemoto: '/var/www/arquivos',
        diretorioLocal: __dirname + '/backup/',
        nomeArquivoFinal: 'backup'
    },
]

listaServidores.forEach(servidor => {
    var conn = new SSH();

    var connectionSettings = {
        // The host URL
        host: servidor.host,
        // The port, usually 22
        port: 22,
        // Credentials
        username: servidor.username,
        password: servidor.password
    };

    conn.on('ready', function () {
        // Use the transfer directory 
        var startTime = moment();
        console.log(`[${startTime.format('DD/MM/YYYY hh:mm:ss')}] Iniciando backup: ${servidor.nomeArquivoFinal}`);

        transferDirectory(
            // The SSH2 connection
            conn,
            // The remote folder of your unix server that you want to back up
            //'/var/www/sge/sge_api/files',
            servidor.diretorioRemoto,
            // Local path where the files should be saved
            servidor.diretorioLocal,
            servidor.nomeArquivoFinal,
            // Define a compression value (true for default 6) with a numerical value
            true,
            // A callback executed once the transference finishes
            function (err) {
                if (err) {
                    throw err;
                };

                var duration = moment.duration(moment().diff(startTime));
                var minutes = duration.asMinutes();

                console.log(`[${moment().format('DD/MM/YYYY hh:mm:ss')}] Backup arquivo ${servidor.nomeArquivoFinal} realizado com sucesso! Tempo: ${minutes}`);

                // Finish the connection
                conn.end();
            }
        );
    }).connect(connectionSettings);
});

// const userAccountNotification = {
//     'username': 'Error notifier', // This will appear as user name who posts the message
//     'text': 'Backup iniciado em', // text
//     'icon_emoji': ':bangbang:', // User icon, you can also use custom icons here
//     'attachments': [{ // this defines the attachment block, allows for better layout usage
//         'color': '#eed140', // color of the attachments sidebar.
//         'fields': [ // actual fields
//             {
//                 'title': 'Environment', // Custom field
//                 'value': 'Production', // Custom value
//                 'short': true // long fields will be full width
//             },
//             {
//                 'title': 'User ID',
//                 'value': '331',
//                 'short': true
//             }
//         ]
//     }]
// };

// // sendSlackMessage('',userAccountNotification)