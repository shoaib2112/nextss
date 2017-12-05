'use strict';
var configjs = {
    NEXTGRID_WEBSERVER_PORT:80
    ,login: {
        user: 'nextgridapp',
        password: 'NoDE2017`',
    },
    webServers: [
        // Windows 2008 does not ship w/ sftp support! yay
        // {
        //     name: 'nextgriddemo',
        //     host: 'goxsa1781',
        //     username: 'nextgridapp',
        //     password: 'NoDE2017`',
        //     dest: '\\goxsa1781\d$\node\deploy'
        // },
        {
            name: 'prod1',
            host: 'nextgrid1',  // goxsd4067
            port: 8080,
            username: 'nextgridapp',
            password: 'this1sSoSoSoSoLame`',
            //dest: '/home/nextgridapp/deploy/'
            dest: '/var/node/nextgrid/'

        },
        {
            name: 'prod2',
            host: 'nextgrid2',  // goxsd4068
            port: 8080,
            username: 'nextgridapp',
            password: 'this1sSoSoSoSoLame`',
            dest: '/var/node/nextgrid/'
        },
        {
            name: 'dr',
            host: 'lcdsd984',  // lcdsd984
            port: 8080,
            username: 'nextgridapp',
            password: 'this1sSoSoSoSoLame`',
            dest: '/var/node/nextgrid/'
        },
        {
            name: 'dev',
            host: 'nextgriddev',  // goxsd4588
            port: 80,
            username: 'nextgridapp',
            password: 'this1sSoSoSoSoLame`',
            dest: '/var/node/nextgrid/'
        },
        // {
        //     name: 'dev',
        //     host: 'lcdsd984',  // goxsd4588
        //     port: 8081,
        //     username: 'nextgridapp',
        //     password: 'NoDE2017`',
        //     dest: '/var/node/nextgriddev/'
        // },
        {
            name: 'qa',
            host: 'nextgridqa',  // goxsd4587
            port: 80,
            username: 'nextgridapp',
            password: 'this1sSoSoSoSoLame`',
            dest: '/var/node/nextgrid/'
        }

        ]
    ,
    activeDirectory: {
        url: 'ldap://globalcatalog:3268/',
        domain: 'fplnt',
        grpdomain: 'fplu.fpl.com'
    },
    // Set cluster to true only for prod servers
    cluster: (process.env.NODE_ENV === 'production'),
    // Set limit to null to run on ALL cores available
    threadLimit: 3,
    //NEXTGRID_WEBSERVER_PORT:80,
    conditionAssessment: {
        url: 'http://pdradar/oraamsservice/oraservice.asmx/NextGridCAFindingsQuery?feeders='
    },
    amsgss: {
        url: 'http://amsgss:8080/gss/native?service=searchAsset&method=searchAssets&search_field_name=ddb_coordinate&search_field_value='
    },
    hvt: {
        url: 'http://pdimrestdev.fpl.com/hvt/transformer/'
        //url: 'http://pdimrestdev.fpl.com/hvt/transformer/20170809?format=json'
    },
    // psc_interval: 1000 * 60 * 720,
    // als_interval: 1000 * 60 * 120,
    mongoEnvironment: function () {
        var env = process.env.NODE_ENV;

        if (!env)
            console.log('NODE_ENV not passed, you can set NODE_ENV=[production,dev,qa] in Webstorm or command line')

        switch (env) {
            case 'production':
            default:
                console.log('Mongo environment: production');
                return {
                    mongoHost: 'nxtgp01',
                    mongoHost2: 'nxtgp03',
                    mongoHost3: 'nxtgp05',
                    mongoPort: 10040,
                    mongoDatabase: 'Magog',
                    mongoUser: 'MagogUser',
                    mongoPassword: 'WWCrMS7YE'
                };
                break;
            case 'qa':
                console.log('Mongo environment: qa');
                return {
                    mongoHost: 'nxtg01',
                    mongoHost2: 'nxtg01',
                    mongoHost3: 'nxtg01',
                    mongoPort: 10040,
                    mongoDatabase: 'Magog_QA',
                    mongoUser: 'MagogUser',
                    mongoPassword: 'fr33B!rd',
                };
                break;
            case 'dev':
            //default:
                console.log('Mongo environment: dev');
                return {
                    mongoHost: 'nxtg01',
                    mongoHost2: 'nxtg01',
                    mongoHost3: 'nxtg01',
                    mongoPort: 10040,
                    mongoDatabase: 'Magog', // or Magog_DEV?
                    mongoUser: 'MagogUser',
                    mongoPassword: 'fr33B!rd',
                };
                break;

        }
    },
    //mongodevurl: 'mongodb://localhost:27017/smartgridtools',
    // mongodemoHost:'goxsd3396',
    // mongodemoPort: 10040,
    // mongodemoDatabase: 'Magog',
    // mongodemoUser:'MagogUser',
    // mongodemoPassword:'fr33B!rd',
    sqlprod: {
        user: 'dpdc',
        password: 'dpdcadmin',
        server: 'DPDCSQL',
        database: 'Distribution',
        requestTimeout: 60000,
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            useUTC: false,  // Huge! times were getting converted incorrectly
            encrypt: false // Use this if you're on Windows Azure
        }
    },
    sqldev: { user: 'sa', password: 'Ferret55', server: 'localhost', database: 'Distribution' },
    oracleAmsUser: "amsread",
    oracleAmsPassword: "amsread",
    oracleAmsConnectString: "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=amsprod)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=psamsp)))",
    oracleDwUser: "dpdc_apps",
    oracleDwPassword: "dpdc!2011",
    oracleDwConnectString: "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=psdwdmpdb)(PORT=1751)(Pooling=false)(Validate Connection=true))(CONNECT_DATA=(SERVICE_NAME=psdwdmp)))",
    pstactp: {
        user: 'psbpt_apps', password: 'bptpsd', 
        connectString: '( DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = pstactpdb)(PORT = 1744)(Pooling = false)(Validate Connection=true))(CONNECT_DATA = (SERVICE_NAME = pstactp)))'
    },
    pssynep: {
        user: 'eod_read', password: 'read2011', 
        connectString: '( DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = pstactpdb)(PORT = 1748)(Pooling = false)(Validate Connection=true))(CONNECT_DATA = (SERVICE_NAME = pssynep)))'
    }
};

module.exports = configjs;
