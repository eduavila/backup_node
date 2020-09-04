const SSH = require('ssh2');
const { transferDirectory } = require('./transfer.js');
const { sendSlackMessage } = require('./slack.js');
const moment = require('moment');
const fs = require('fs');

const configuracoes = require('./configuracao.json');

configuracoes.forEach(servidor => {
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

    conn.on('ready', function() {
        // Use the transfer directory 
        var startTime = moment();
        console.log(`[${startTime.format('DD/MM/YYYY HH:mm:ss')}] Iniciando backup: ${servidor.nomeArquivoFinal}`);

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
            function(err, filePathTar) {
                if (err) {
                    throw err;
                };
                var arquivoFinal = servidor.nomeArquivoFinal + '_' + moment().format('DDMMYYYY_HHmm') + '.gz';
                var duration = moment.duration(moment().diff(startTime));
                //var minutes = duration.asMinutes();
                var minutes = convertTime(duration.asSeconds());

                console.log(`[${moment().format('DD/MM/YYYY HH:mm:ss')}] Backup arquivo ${servidor.nomeArquivoFinal} realizado com sucesso! Tempo: ${minutes}`);

                var fileBackup = fs.statSync(filePathTar);
                //var fileSizeInMegabytes =  fileBackup.size / 1000000.0;
                var size = fileBackup.size;
                // convert to human readable format.
                const i = Math.floor(Math.log(size) / Math.log(1024));
                var fileSizeInMegabytes = (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];

                sendMessage(servidor, startTime.format('DD/MM/YYYY HH:mm:ss'), arquivoFinal, minutes, fileSizeInMegabytes);

                // Finish the connection
                conn.end();
            }
        );
    }).connect(connectionSettings);
});



function sendMessage(configuracao, horaInicio, arquivoFinal, tempDuracao, tamanhoArquivo, error) {

    const userAccountNotification = {
        'username': 'Bot Backup', // This will appear as user name who posts the message
        'text': `Backup iniciado em ${horaInicio} `, // text
        'icon_emoji': ':bangbang:', // User icon, you can also use custom icons here
        'attachments': [{ // this defines the attachment block, allows for better layout usage
            'color': '#eed140', // color of the attachments sidebar.
            'fields': [ // actual fields
                {
                    'title': 'Configuração', // Custom field
                    'value': configuracao.nomeArquivoFinal, // Custom value
                    'short': true // long fields will be full width
                },
                {
                    'title': 'Arquivo Final',
                    'value': arquivoFinal,
                    'short': true
                },
                {
                    'title': 'Tempo Duração',
                    'value': tempDuracao,
                    'short': true
                },
                {
                    'title': 'Tamanho Arquivo',
                    'value': tamanhoArquivo,
                    'short': true
                }
            ]
        }]
    };

    sendSlackMessage(configuracao.url_slack, userAccountNotification)
}

function convertTime(secs) {
    var hours = Math.floor(secs / 3600);
    (hours >= 1) ? secs = secs - (hours * 3600): hours = '00';
    var min = Math.floor(secs / 60);
    (min >= 1) ? secs = secs - (min * 60): min = '00';
    (secs < 1) ? secs = '00': void 0;

    (min.toString().length == 1) ? min = '0' + min: void 0;
    (secs.toString().length == 1) ? secs = '0' + secs: void 0;

    return hours + ':' + min + ':' + secs;
}