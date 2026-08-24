const schema = {
    // --- Serveur ---
    PORT:{
        obligation: false,
        type: 'number',
        default : 3001
    },
    NODE_ENV:{
        obligation: false,
        type: 'enum',
        values: ['development', 'production', 'test'],
        default : 'development'
    },

    // --- Sécutité ---
    JWT_SECRET:{
        obligation: true,
        type: 'string'
    },
    JWT_EXPIRES:{
        obligation: false,
        type: 'string',
        default : '7d'
    },

    // --- Base de donnée ---
    DATABASE_TYPE:{
        obligation: true,
        type: 'string'
    },
    DATABASE_USER:{
        obligation: true,
        type: 'string'
    },
    DATABASE_PASS:{
        obligation: true,
        type: 'string'
    },
    DATABASE_NAME:{
        obligation: true,
        type: 'string'
    },
    DATA_PORT:{
        obligation: true,
        type: 'number',
        default : 5432
    },
    SSL:{
        obligation: false,
        type: 'string'
    },

    // --- Email ---
    MAIL_HOST:{
        obligation: false,
        type: 'string'
    },
    MAIL_PORT:{
        obligation: false,
        type: 'number'
    }
}
module.exports = schema;