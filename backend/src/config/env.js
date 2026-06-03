import dotenv from 'dotenv'
const _env = dotenv.config().parsed

console.log(11111111111, _env)

export default {
    env: _env.NODE_ENV,
    port: _env.PORT,
    db: {
        host: _env.DB_HOST,
        port: parseInt(_env.DB_PORT),
        database: _env.DB_NAME,
        username: _env.DB_USER,
        password: _env.DB_PASSWORD,
        dialect: 'mssql',
        dialectOptions: {
            options: {
                encrypt: false,
                trustServerCertificate: true,
            },
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        logging: console.log
    }
}