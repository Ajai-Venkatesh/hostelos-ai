/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RequestCategory = 'maintenance' | 'mess' | 'complaint' | 'permission' | 'other';
export type RequestUrgency = 'low' | 'medium' | 'high' | 'critical';
export type RequestStatus = 'pending' | 'ai_evaluated' | 'approved' | 'rejected' | 'in_progress' | 'resolved';

export interface AIAssessment {
  title: string;
  category: RequestCategory;
  urgency: RequestUrgency;
  autoRecommendation: 'approve' | 'reject' | 'route_to_warden' | 'clarify';
  aiReasoning: string;
  extractedDetails: {
    item?: string;
    location?: string;
    severity?: string;
    timing?: string;
    [key: string]: string | undefined;
  };
  autoResponse: string;
}

export interface WardenAction {
  action: 'approve' | 'reject' | 'resolve' | 'assign';
  wardenNotes: string;
  actionedAt: string;
}

export interface HostelRequest {
  id: string;
  studentName: string;
  roomNumber: string;
  title: string;
  description: string;
  category: RequestCategory;
  urgency: RequestUrgency;
  status: RequestStatus;
  createdAt: string;
  aiAssessment?: AIAssessment;
  wardenAction?: WardenAction;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
