## Script backup via SSH 

###  Rodar backup.

``npm install``

``node backup.js``

### Configurar lista de servidores para realizar backups.

* Editar lista no arquivo ``backup.js``, 

~~~

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
];

~~~