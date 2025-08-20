import axios from 'axios';
import * as https from 'https';
import { WAZUH } from './config.js';
import { AgentItem } from './types.js';

// 創建 HTTPS Agent 忽略自簽名憑證
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    requestCert: false
});

// 設置 axios 全局默認配置
axios.defaults.httpsAgent = httpsAgent;
axios.defaults.timeout = 30000;

export async function getWazuhToken(): Promise<string> {
    const url = `${WAZUH.baseURL}/security/user/authenticate`;
    const res = await axios.post(
        url,
        {},
        {
            auth: { username: WAZUH.username, password: WAZUH.password },
            headers: { 'Content-Type': 'application/json' },
            httpsAgent,
        }
    );
    const token = res?.data?.data?.token;
    if (!token) throw new Error('Failed to get Wazuh token');
    return token;
}

export async function getAgentList(token: string): Promise<AgentItem[]> {
    const url = `${WAZUH.baseURL}/agents`;
    const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        httpsAgent,
    });
    return res?.data?.data?.affected_items ?? [];
}

export function getGroupFromAgents(agentId: string, agents: AgentItem[]): string | null {
    for (const a of agents) {
        if (a.id === agentId) {
            return a.group?.[0] ?? 'default';
        }
    }
    return null;
}
