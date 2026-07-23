/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TOUGHCONS CORE - Backend Express + TypeScript Middlewares
 * Implementations for:
 * 1. RBAC (Role-Based Access Control) verification at the API boundary
 * 2. Audit Trail automatic middleware logging
 */

import { Request, Response, NextFunction } from 'express';

export const backendMiddlewareTSCode = `
import { Request, Response, NextFunction } from 'express';
import { db } from './db'; // database instance
import { auditLogs } from './db/schema'; // Drizzle schema

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    role: 'Director' | 'Project Manager' | 'Site Engineer' | 'Accountant' | 'Society Member' | 'Developer' | 'Admin';
    email: string;
  };
}

// ==========================================
// 1. ROLE-BASED ACCESS CONTROL MIDDLEWARE
// ==========================================

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication Required', 
        message: 'Please provide valid session credentials to proceed.' 
      });
    }

    const hasPermission = allowedRoles.includes(req.user.role);
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access Denied: Insufficient Privileges',
        message: \`Your current role '\${req.user.role}' is not authorized to execute this operation. Required: [\${allowedRoles.join(', ')}]\`
      });
    }

    return next();
  };
}

// Example usage on Express route:
// router.post('/api/projects/:id/approve', requireRole(['Director', 'Admin']), handleProjectApproval);
// router.post('/api/projects/:id/site-photos', requireRole(['Site Engineer', 'Project Manager']), uploadSitePhotos);


// ==========================================
// 2. AUDIT TRAIL RECORDING LOGIC (Task 4)
// ==========================================

interface LogAuditOptions {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESOLVE' | 'APPROVE' | 'ESCALATE' | 'REASSIGN';
  entity: 'Project' | 'Risk' | 'Approval' | 'Document' | 'Invoice' | 'Meeting' | 'Consent' | 'Profile' | 'Partner' | 'Site Log';
  entityId: string;
  getOldValue?: (req: Request) => Promise<any>;
  getNewValue?: (req: Request) => Promise<any>;
}

export function auditTrailLogger(options: LogAuditOptions) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Check if change reason is provided in header or request body
    const changeReason = req.body.changeReason || req.headers['x-change-reason'];
    
    if (['CREATE', 'UPDATE', 'DELETE'].includes(options.action) && !changeReason) {
      return res.status(400).json({
        error: 'Audit Trail Constraint Violated',
        message: 'A mandatory changeReason/comment is required for auditing PMC modifications.'
      });
    }

    // Capture old value before handler executes (e.g. from DB)
    let oldValueString = '';
    if (options.getOldValue) {
      try {
        const oldVal = await options.getOldValue(req);
        oldValueString = JSON.stringify(oldVal);
      } catch (err) {
        console.error('Audit pre-fetch failed:', err);
      }
    }

    // Intercept response to log only on successful operation
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend; // restore
      
      // Only audit successful 2xx state transitions
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let newValueString = '';
        if (options.getNewValue) {
          options.getNewValue(req).then(newVal => {
            newValueString = JSON.stringify(newVal);
            saveAuditLog();
          }).catch(() => saveAuditLog());
        } else {
          newValueString = typeof body === 'string' ? body : JSON.stringify(body);
          saveAuditLog();
        }

        async function saveAuditLog() {
          try {
            await db.insert(auditLogs).values({
              userId: req.user?.id || 'anonymous_user',
              userName: req.user?.name || 'Anonymous PMC User',
              userRole: req.user?.role || 'Guest',
              action: options.action,
              entity: options.entity,
              entityId: options.entityId || req.params.id || 'N/A',
              oldValue: oldValueString || null,
              newValue: newValueString || null,
              reason: changeReason || 'System triggered background adjustment.',
            });
            console.log('Audit ledger synced securely.');
          } catch (dbErr) {
            console.error('Failed to commit audit entry to ledger:', dbErr);
          }
        }
      }

      return res.send(body);
    };

    next();
  };
}
`;
