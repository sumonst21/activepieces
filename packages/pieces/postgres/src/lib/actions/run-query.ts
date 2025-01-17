import { createAction, Property } from "@activepieces/pieces-framework";
import pg from 'pg';

export const runQuery = createAction({
    name: 'run-query',
    displayName: "Run Query",
    description: "Run Query",
    props: {
        authentication: Property.CustomAuth({
            displayName: "Authentication",
            props: {
                host: Property.ShortText({
                    displayName: 'Host',
                    required: true,
                    description: " A string indicating the hostname of the PostgreSQL server to connect to."
                }),
                port: Property.ShortText({
                    displayName: 'Port',
                    defaultValue: "5432",
                    description: "An integer indicating the port of the PostgreSQL server to connect to.",
                    required: true,
                }),
                user: Property.ShortText({
                    displayName: 'User',
                    required: true,
                    description: "A string indicating the user to authenticate as when connecting to the PostgreSQL server."
                }),
                password: Property.SecretText({
                    displayName: 'Password',
                    description: "A string indicating the password to use for authentication.",
                    required: true,
                }),
                database: Property.ShortText({
                    displayName: 'Database',
                    description: "A string indicating the name of the database to connect to.",
                    required: true,
                }),
                reject_unauthorized: Property.Checkbox({
                    displayName: 'Enforce Encryption',
                    description: 'Enforce using SSL/TLS for the connection.',
                    required: true,
                    defaultValue: true
                }),
                certificate: Property.LongText({
                    displayName: 'Certificate',
                    description: 'The certificate to use for the connection.',
                    defaultValue: '',
                    required: false,
                }),
            },
            required: true
        }),
        query: Property.ShortText({
            displayName: 'Query',
            required: true,
        }),
        query_timeout: Property.Number({
            displayName: 'Query Timeout',
            description: "An integer indicating the maximum number of milliseconds to wait for a query to complete before timing out.",
            required: false,
            defaultValue: "30000"
        }),
        connection_timeout_millis: Property.Number({
            displayName: 'Connection Timeout (ms)',
            description: "An integer indicating the maximum number of milliseconds to wait for a connection to be established before timing out.",
            required: false,
            defaultValue: "30000"
        }),
        application_name: Property.ShortText({
            displayName: 'Application Name',
            description: "A string indicating the name of the client application connecting to the server.",
            required: false,
        }),
    },
    async run(context) {
        const { host, user, database, password, port, reject_unauthorized: rejectUnauthorized, certificate } = context.propsValue.authentication;
        const { query, query_timeout, application_name, connection_timeout_millis: connectionTimeoutMillis } = context.propsValue;
        const client = new pg.Client({
            host,
            port: Number(port),
            user,
            password,
            database,
            ssl: { rejectUnauthorized, ca: (certificate && certificate.length > 0) ? certificate : undefined },
            query_timeout: Number(query_timeout),
            statement_timeout: Number(query_timeout),
            application_name,
            connectionTimeoutMillis: Number(connectionTimeoutMillis),
        })
        await client.connect();

        return new Promise((resolve, reject) => {
            client.query(query, function (error: any, results: { rows: unknown; }) {
                if (error) {
                    client.end();
                    return reject(error);
                }
                resolve(results.rows);
                client.end();
            });
        })
    },
});