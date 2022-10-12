//optional defines .env variables so nest/vscode recognises them
declare namespace NodeJS {
    export interface ProcessEnv{
        POSTGRES_HOST?: string;
        POSTGRES_USER?: string;
        POSTGRES_NAME?: string;
        POSTGRES_PASS?: string;
        POSTGRES_PORT?: string;
        PORT?: string;

        INTRA_CLIENT_ID?: string;
        INTRA_CALLBACK_URL?: string;
        INTRA_CLIENT_SECRET?: string;
    }
}