export type AlertRow = {
    id: number;
    timestamp: string;
    location: string;
    rule_id: number;
    rule_level: number;
    description: string;
    agent_id: string;
    agent_name: string;
    created_at: string | null;
    sned_email: boolean;
    send_email_time: string | null;
};

export type NotifyPayload = {
    table: string;
    op: 'INSERT' | 'UPDATE' | 'DELETE';
    id: number;
};

export type AgentItem = {
    id: string;
    group?: string[];
};
