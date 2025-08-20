import { Client } from 'pg';
import { AlertRow } from './types.js';

export async function queryUnsentAlerts(pg: Client): Promise<AlertRow[]> {
    const sql = `SELECT * FROM alerts WHERE sned_email = FALSE ORDER BY id ASC`;
    const { rows } = await pg.query(sql);
    return rows as AlertRow[];
}

export async function queryAlertById(pg: Client, id: number): Promise<AlertRow | null> {
    const { rows } = await pg.query(`SELECT * FROM alerts WHERE id = $1`, [id]);
    return (rows[0] as AlertRow) ?? null;
}

export async function queryGroupEmails(pg: Client, groupName: string): Promise<string[]> {
    const { rows } = await pg.query(
        `SELECT email_address FROM email_groups WHERE group_name = $1`,
        [groupName]
    );
    return rows.map((r: any) => r.email_address as string);
}

export async function markAlertSent(pg: Client, id: number): Promise<void> {
    await pg.query(
        `UPDATE alerts
     SET sned_email = TRUE,
         send_email_time = CURRENT_TIMESTAMP
     WHERE id = $1`,
        [id]
    );
}
