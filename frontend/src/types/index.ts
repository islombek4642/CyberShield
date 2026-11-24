export type AttackSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface Incident {
  id: number;
  timestamp: string;
  source_ip: string;
  dest_ip: string;
  dest_port: number;
  protocol: string;
  attack_type: string;
  severity: AttackSeverity;
  confidence: number;
  status: IncidentStatus;
  reviewed_by?: string;
  resolution_notes?: string;
}

export interface IncidentSummary {
  total_incidents: number;
  new: number;
  in_review: number;
  resolved: number;
  false_positive: number;
  critical: number;
  high: number;
}

export interface LiveFlowPacket {
  type: string;
  timestamp: string;
  source_ip: string;
  dest_ip: string;
  dest_port: number;
  flow_bytes: number;
  is_attack: boolean;
  attack_type: string;
  severity: AttackSeverity;
  confidence: number;
  incident?: {
    id: number;
    attack_type: string;
    severity: string;
    confidence: number;
  };
}

export interface MLMetrics {
  dataset_type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: {
    labels: string[];
    matrix: number[][];
  };
  feature_importance: Array<{
    feature: string;
    importance: number;
  }>;
  total_samples: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}
