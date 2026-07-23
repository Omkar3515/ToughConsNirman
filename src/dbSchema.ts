/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TOUGHCONS CORE - Database Schema Blueprints
 * Relational Schema models for PostgreSQL & SQLite (via Drizzle & Prisma)
 * Designed for Mumbai Redevelopment PMC (MHADA, SRA, SRA, etc.)
 */

// ==========================================
// 1. DRIZZLE ORM SCHEMAS (TypeScript)
// ==========================================

export const drizzleORMSchemaCode = `
import { pgTable, uuid, varchar, integer, timestamp, numeric, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';

// User Roles Enum
export const userRoleEnum = pgEnum('user_role', [
  'Director', 'Project Manager', 'Site Engineer', 'Accountant', 'Society Member', 'Developer', 'Admin'
]);

// Project Status Enum
export const projectStatusEnum = pgEnum('project_status', [
  'active', 'delayed', 'at-risk', 'completed'
]);

// 1. PROJECTS TABLE (with Mumbai Redevelopment specific PMC fields)
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  status: projectStatusEnum('status').default('active'),
  budget: numeric('budget', { precision: 15, scale: 2 }),
  stage: varchar('stage', { length: 100 }).notNull(),
  manager: varchar('manager', { length: 150 }).notNull(),
  deadline: timestamp('deadline').notNull(),
  progress: integer('progress').default(0).notNull(),
  priority: varchar('priority', { length: 50 }).default('None'),
  description: varchar('description', { length: 1000 }),
  tenantConsentPct: integer('tenant_consent_pct').default(0),
  
  // MHADA / BMC and Certifications
  mhadaStatus: varchar('mhada_status', { length: 100 }).default('Pending Submission'),
  bmcStatus: varchar('bmc_status', { length: 100 }).default('NOC Pending'),
  iodStatus: varchar('iod_status', { length: 100 }).default('Draft Stage'),
  iodDate: timestamp('iod_date'),
  ccStatus: varchar('cc_status', { length: 100 }).default('Pending Plinth'),
  ocStatus: varchar('oc_status', { length: 100 }).default('Not Started'),
  daDetails: varchar('da_details', { length: 1000 }),
  paaaStatus: varchar('paaa_status', { length: 100 }).default('Pending draft'),
  
  // Financial ledgers
  hardshipRentStatus: varchar('hardship_rent_status', { length: 100 }).default('Delayed'),
  corpusFundBalance: varchar('corpus_fund_balance', { length: 100 }),
  bankGuaranteeAmount: varchar('bank_guarantee_amount', { length: 100 }),
  bankGuaranteeExpiry: timestamp('bank_guarantee_expiry'),
  
  // Regulation & Litigation
  reraNumber: varchar('rera_number', { length: 100 }),
  reraStatus: varchar('rera_status', { length: 100 }).default('Applied'),
  litigationStatus: varchar('litigation_status', { length: 100 }).default('None'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. SOCIETIES & TENANTS TABLE
export const societies = pgTable('societies', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  memberName: varchar('member_name', { length: 255 }).notNull(),
  unitChawlNo: varchar('unit_chawl_no', { length: 100 }).notNull(),
  carpetAreaSqFt: doublePrecision('carpet_area_sq_ft').notNull(),
  consentStatus: varchar('consent_status', { length: 50 }).notNull(), // 'Signed', 'Refused', 'Pending'
  hardshipDisbursed: numeric('hardship_disbursed', { precision: 12, scale: 2 }).default('0.00'),
  contactNo: varchar('contact_no', { length: 20 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. DOCUMENTS REPOSITORY TABLE
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  folder: varchar('folder', { length: 100 }).notNull(), // 'Drawings', 'Permits', 'Contracts', 'Reports'
  size: varchar('size', { length: 50 }).notNull(),
  uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  status: varchar('status', { length: 50 }).default('Draft'),
  version: varchar('version', { length: 50 }).default('v1.0.0'),
  expiryDate: timestamp('expiry_date'),
  tags: varchar('tags', { length: 255 }), // comma separated
});

// 4. RISKS TABLE
export const risks = pgTable('risks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  probability: integer('probability').notNull(), // 1 - 5
  impact: integer('impact').notNull(), // 1 - 5
  mitigation: varchar('mitigation', { length: 1000 }).notNull(),
  owner: varchar('owner', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('OPEN'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. INVOICES TABLE (Financial tracking)
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('Unpaid'), // 'Paid', 'Unpaid', 'Overdue'
  raisedDate: timestamp('raised_date').defaultNow(),
  dueDate: timestamp('due_date').notNull(),
  description: varchar('description', { length: 500 }),
});

// 6. AUDIT TRAIL LOGS (Task 4)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  userRole: varchar('user_role', { length: 100 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  action: varchar('action', { length: 50 }).notNull(), // 'CREATE', 'UPDATE', 'DELETE'
  entity: varchar('entity', { length: 100 }).notNull(), // 'Project', 'Risk', 'Document'
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  oldValue: varchar('old_value', { length: 2000 }),
  newValue: varchar('new_value', { length: 2000 }),
  reason: varchar('reason', { length: 1000 }).notNull(),
});
`;

// ==========================================
// 2. RAW SQL DDL (PostgreSQL Dialect)
// ==========================================

export const rawSQLDDLCode = `
-- TOUGHCONS PMC POSTGRESQL DDL SCHEMAS
-- Execute in AWS RDS / Cloud SQL PostgreSQL instances

CREATE TYPE user_role AS ENUM (
  'Director', 'Project Manager', 'Site Engineer', 'Accountant', 'Society Member', 'Developer', 'Admin'
);

CREATE TYPE project_status AS ENUM (
  'active', 'delayed', 'at-risk', 'completed'
);

-- Projects PMC Redevelopment Ledger
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  status project_status DEFAULT 'active',
  budget NUMERIC(15, 2),
  stage VARCHAR(100) NOT NULL,
  manager VARCHAR(150) NOT NULL,
  deadline DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority VARCHAR(50) DEFAULT 'None',
  description TEXT,
  
  -- Mumbai redevelopment specifiche
  tenant_consent_pct INTEGER DEFAULT 0 CHECK (tenant_consent_pct >= 0 AND tenant_consent_pct <= 100),
  mhada_status VARCHAR(100) DEFAULT 'Pending Submission',
  bmc_status VARCHAR(100) DEFAULT 'NOC Pending',
  iod_status VARCHAR(100) DEFAULT 'Draft Stage',
  iod_date DATE,
  cc_status VARCHAR(100) DEFAULT 'Pending Plinth',
  oc_status VARCHAR(100) DEFAULT 'Not Started',
  da_details TEXT,
  paaa_status VARCHAR(100) DEFAULT 'Pending draft',
  
  -- Escrows & Guarantees
  hardship_rent_status VARCHAR(100) DEFAULT 'Delayed',
  corpus_fund_balance VARCHAR(100),
  bank_guarantee_amount VARCHAR(100),
  bank_guarantee_expiry DATE,
  rera_number VARCHAR(100),
  rera_status VARCHAR(100) DEFAULT 'Applied',
  litigation_status VARCHAR(100) DEFAULT 'None',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Ledger for strict accountability (Task 4)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT NOT NULL
);

-- Society Redevelopment Tenant Ledger
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  member_name VARCHAR(255) NOT NULL,
  unit_chawl_no VARCHAR(100) NOT NULL,
  carpet_area_sq_ft DOUBLE PRECISION NOT NULL,
  consent_status VARCHAR(50) NOT NULL CHECK (consent_status IN ('Signed', 'Refused', 'Pending')),
  hardship_disbursed NUMERIC(12, 2) DEFAULT 0.00,
  contact_no VARCHAR(20)
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
`;
