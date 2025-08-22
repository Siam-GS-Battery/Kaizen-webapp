# ER Diagram - Kaizen Web Application

## Overview
This document describes the Entity-Relationship Diagram for the Kaizen Web Application database structure. The system manages employee data, project forms (Genba and Suggestion), workflow approvals, and administrative functions.

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        string user_id PK
        string employee_id UK
        string first_name
        string last_name
        string department
        string five_s_area
        string project_area
        enum role "Admin,Manager,Supervisor,User"
        timestamp created_at
        timestamp updated_at
        boolean is_active
    }
    
    SESSIONS {
        string session_id PK
        string user_id FK
        timestamp login_time
        timestamp last_activity
        timestamp logout_time
        string ip_address
        boolean is_active
    }
    
    PROJECTS {
        string project_id PK
        string employee_id FK
        string project_name
        date project_start_date
        date project_end_date
        text problems_encountered
        text solution_approach
        text standard_certification
        text results_achieved
        enum five_s_type "ส1,ส2,ส3,ส4,ส5"
        enum improvement_topic "Safety,Env,Quality,Cost,Delivery"
        enum sgs_smart "People,Factory"
        enum sgs_strong "Energy_3R,Workplace"
        enum sgs_green "Teamwork,Branding"
        enum form_type "genba,suggestion,best_kaizen"
        timestamp created_date
        timestamp submitted_date
        string created_by
    }
    
    PROJECT_IMAGES {
        string image_id PK
        string project_id FK
        enum image_type "before,after"
        string file_name
        string file_path
        string s3_key
        integer file_size
        string mime_type
        timestamp uploaded_at
    }
    
    PROJECT_STATUS_TRANSITIONS {
        string transition_id PK
        string project_id FK
        enum status_from "DRAFT,WAITING,EDIT,APPROVED,REJECTED,DELETED"
        enum status_to "DRAFT,WAITING,EDIT,APPROVED,REJECTED,DELETED"
        string changed_by FK
        text comment
        timestamp transition_date
    }
    
    PROJECT_HISTORY {
        string history_id PK
        string project_id FK
        string employee_id FK
        enum action "CREATED,SUBMITTED,APPROVED,REJECTED,EDITED,DELETED"
        text description
        timestamp action_date
        string performed_by FK
    }
    
    DEPARTMENTS {
        string department_id PK
        string department_code UK
        string department_name
        string description
        boolean is_active
    }
    
    FIVE_S_GROUPS {
        string group_id PK
        string group_name UK
        string description
        string location
        boolean is_active
    }
    
    PROJECT_AREAS {
        string area_id PK
        string area_name UK
        string department_id FK
        string description
        boolean is_active
    }
    
    ADMIN_USERS {
        string admin_id PK
        string user_id FK
        string assigned_by FK
        timestamp assigned_date
        boolean is_active
    }

    %% Relationships
    USERS ||--o{ SESSIONS : "has"
    USERS ||--o{ PROJECTS : "creates"
    USERS ||--o{ PROJECT_STATUS_TRANSITIONS : "changes_status"
    USERS ||--o{ PROJECT_HISTORY : "performs_action"
    USERS ||--o{ ADMIN_USERS : "can_be_admin"
    USERS ||--o{ ADMIN_USERS : "assigns_admin"
    
    PROJECTS ||--o{ PROJECT_IMAGES : "has"
    PROJECTS ||--o{ PROJECT_STATUS_TRANSITIONS : "transitions"
    PROJECTS ||--o{ PROJECT_HISTORY : "has_history"
    
    DEPARTMENTS ||--o{ USERS : "belongs_to"
    DEPARTMENTS ||--o{ PROJECT_AREAS : "contains"
    
    FIVE_S_GROUPS ||--o{ USERS : "member_of"
    PROJECT_AREAS ||--o{ USERS : "works_in"
```

## Key Design Principles

### 1. User Management
- **USERS**: Core employee data with role-based access control
- **SESSIONS**: Session management for login/logout tracking
- **ADMIN_USERS**: Separate table for admin role assignment

### 2. Project Management
- **PROJECTS**: Main project data from Genba and Suggestion forms
- **PROJECT_IMAGES**: Separate table for image storage with S3 integration
- **PROJECT_STATUS_TRANSITIONS**: Complete audit trail of status changes
- **PROJECT_HISTORY**: Historical record of all project activities

### 3. Master Data
- **DEPARTMENTS**: Department reference data
- **FIVE_S_GROUPS**: 5S group reference data
- **PROJECT_AREAS**: Project area reference data

### 4. Form Type Differences
- **Genba Form**: Includes both `before` and `after` images
- **Suggestion Form**: Includes only `before` images
- **Best Kaizen**: Special category for approved excellent projects

### 5. Status Workflow
```
DRAFT → WAITING → APPROVED
  ↓       ↓         ↓
DELETED  EDIT → WAITING → APPROVED/REJECTED
```

## Security Considerations

1. **Role-Based Access Control**: Admin, Manager, Supervisor, User roles
2. **Audit Trail**: Complete tracking of all changes and actions
3. **Session Management**: Secure session handling with timeout
4. **File Security**: S3 integration with proper access controls

## Scalability Features

1. **UUID Primary Keys**: Ensures uniqueness across distributed systems
2. **Separate Image Storage**: Optimized for file handling
3. **History Tables**: Maintains performance while keeping complete audit trail
4. **Master Data Tables**: Normalized structure for easy maintenance

## Next Steps

1. Implement database schema in MySQL/PostgreSQL
2. Set up AWS S3 bucket for image storage
3. Create database indexes for performance optimization
4. Implement backup and recovery procedures