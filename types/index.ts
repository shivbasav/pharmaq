export interface Message {
    role: "user" | "assistant" ;
}

export interface KPI {
    label: string;
    value: string;
    delta?: string;
    trend?: "up" | "down" | "neutral";
    icon: string;
}

export interface Competitor {
    name: string;
    share: number;
    nbrxShare: number;
    yoyChange: number;
    status: "growing" | "declining" | "stable";
    note?: string;
}

export interface RegionData{
    region: string;
    share: number;
    vsNational: number;
}

export interface UptakePoint {
    month: string;
    actual: number;
    plan: number;
}