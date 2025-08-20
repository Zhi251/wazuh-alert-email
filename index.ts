// 設置全域 SSL 憑證忽略 - 必須在所有其他 import 之前
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

import 'dotenv/config';
import { Client } from 'pg';
import { pgConfig, MAIL } from './src/config.js';
import { AlertRow, NotifyPayload, AgentItem } from './src/types.js';
import { queryUnsentAlerts, queryAlertById, queryGroupEmails, markAlertSent } from './src/database.js';
import { getWazuhToken, getAgentList, getGroupFromAgents } from './src/wazuh.js';
import { loadTemplate, renderHtml, sendEmail } from './src/email.js';

async function processOneAlert(pg: Client, a: AlertRow, agentsCache?: AgentItem[]) {
    if (a.sned_email) {
        return;
    }
    const htmlTemplate = loadTemplate();

    // 取 Wazuh group
    const token = await getWazuhToken();
    const agents = agentsCache ?? (await getAgentList(token));
    const group = getGroupFromAgents(a.agent_id, agents) ?? 'default';

    // 取 group 對應 email
    const emails = await queryGroupEmails(pg, group);

    const html = renderHtml(a, htmlTemplate);
    await sendEmail(MAIL.defaultReceiver, emails, 'ThreatCado 警報通知', html);

    await markAlertSent(pg, a.id);
    console.log(`[OK] Alert ${a.id} sent. group=${group} cc=${emails.join(',') || '(none)'}`);
}

async function bootstrapBackfill(pg: Client) {
    const list = await queryUnsentAlerts(pg);
    if (!list.length) {
        console.log('No unsent alerts.');
        return;
    }
    console.log(`Found ${list.length} unsent alerts. Processing...`);

    const token = await getWazuhToken();
    const agents = await getAgentList(token);

    for (const a of list) {
        try {
            await processOneAlert(pg, a, agents);
        } catch (err) {
            console.error(` Backfill alert ${a.id} failed:`, (err as Error).message);
        }
    }
}

async function main() {
    // new client 專門跑查詢、更新
    const pgClient = new Client(pgConfig);
    await pgClient.connect();

    // nes client 專門 LISTEN
    const listenClient = new Client(pgConfig);
    await listenClient.connect();

    await bootstrapBackfill(pgClient);

    await listenClient.query('LISTEN alerts_changed');
    
    console.log('Waiting on channel: alerts_changed');

    listenClient.on('notification', async (msg: any) => {
        if (msg.channel !== 'alerts_changed' || !msg.payload) return;

        let payload: NotifyPayload | null = null;
        try {
            payload = JSON.parse(msg.payload);
        } catch {
            console.error('Invalid NOTIFY payload:', msg.payload);
            return;
        }

        if (!payload || payload.op !== 'INSERT') return;

        try {
            const alert = await queryAlertById(pgClient, payload.id);
            if (!alert) {
                console.warn(`[WARN] Alert id=${payload.id} not found`);
                return;
            }
            await processOneAlert(pgClient, alert);
        } catch (err) {
            console.error(`ERROR Process alert id=${payload.id} failed:`, (err as Error).message);
        }
    });

    listenClient.on('error', (e: any) => {
        console.error('LISTEN ERROR', e);
    });

    const shutdown = async () => {
        console.log('Shutting down...');
        try {
            await listenClient.end();
            await pgClient.end();
        } finally {
            process.exit(0);
        }
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

main().catch((e) => {
    console.error('FATAL', e);
    process.exit(1);
});
