import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { MAIL } from './config.js';
import { AlertRow } from './types.js';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: MAIL.sender, pass: MAIL.appPassword },
});

export function loadTemplate(): string {
    const p = path.resolve(MAIL.htmlTemplate);
    return fs.readFileSync(p, { encoding: 'utf8' });
}

export function renderHtml(a: AlertRow, htmlTemplate: string): string {
    return htmlTemplate
        .replace(/{description}/g, escapeHtml(a.description))
        .replace(/{timestamp}/g, escapeHtml(a.timestamp))
        .replace(/{location}/g, escapeHtml(a.location))
        .replace(/{rule_id}/g, String(a.rule_id))
        .replace(/{rule_level}/g, String(a.rule_level))
        .replace(/{agent_name}/g, escapeHtml(a.agent_name))
        .replace(/{agent_id}/g, escapeHtml(a.agent_id))
        .replace(/{src_ip}/g, escapeHtml(a.src_ip || ''))
        .replace(/{dst_ip}/g, escapeHtml(a.dst_ip || ''))
        .replace(/{sig_info}/g, escapeHtml(a.sig_info || ''))
        .replace(/{device_id}/g, escapeHtml(a.device_id || ''));
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export async function sendEmail(toDefault: string, ccList: string[], subject: string, html: string) {
    await transporter.sendMail({
        from: MAIL.sender,
        to: toDefault,
        cc: ccList.length ? ccList : undefined,
        subject,
        html,
    });
}
