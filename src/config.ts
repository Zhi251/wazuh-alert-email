export const pgConfig = {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
};

export const WAZUH = {
    baseURL: process.env.WAZUH_BASE_URL!,
    username: process.env.WAZUH_USERNAME!,
    password: process.env.WAZUH_PASSWORD!,
};

export const MAIL = {
    sender: process.env.MAIL_SENDER!,
    appPassword: process.env.MAIL_APP_PASSWORD!,
    defaultReceiver: process.env.MAIL_DEFAULT_RECEIVER!,
    htmlTemplate: process.env.MAIL_HTML_TEMPLATE || './custom-email.html',
};
