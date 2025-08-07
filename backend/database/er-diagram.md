# Kaizen Web Application - Database ER Diagram

This Mermaid ER diagram represents the complete database structure for the Kaizen Web Application.

```mermaid
erDiagram
    users {
        SERIAL id PK
        VARCHAR employee_id UK "NOT NULL"
        VARCHAR first_name "NOT NULL"
        VARCHAR last_name "NOT NULL" 
        VARCHAR department "NOT NULL"
        VARCHAR five_s_area
        VARCHAR project_area
        user_role role "DEFAULT User"
        TEXT password_hash
        BOOLEAN is_active "DEFAULT true"
        TIMESTAMP created_at "DEFAULT NOW()"
        TIMESTAMP updated_at "DEFAULT NOW()"
    }

    departments {
        SERIAL id PK
        VARCHAR code UK "NOT NULL"
        VARCHAR name "NOT NULL"
        TEXT description
        BOOLEAN is_active "DEFAULT true"
        TIMESTAMP created_at "DEFAULT NOW()"
        TIMESTAMP updated_at "DEFAULT NOW()"
    }

    five_s_groups {
        SERIAL id PK
        VARCHAR name UK "NOT NULL"
        TEXT description
        VARCHAR location
        BOOLEAN is_active "DEFAULT true"
        TIMESTAMP created_at "DEFAULT NOW()"
        TIMESTAMP updated_at "DEFAULT NOW()"
    }

    project_areas {
        SERIAL id PK
        VARCHAR name "NOT NULL"
        TEXT description
        INTEGER department_id FK
        BOOLEAN is_active "DEFAULT true"
        TIMESTAMP created_at "DEFAULT NOW()"
        TIMESTAMP updated_at "DEFAULT NOW()"
    }

    projects {
        SERIAL id PK
        VARCHAR project_name "NOT NULL"
        VARCHAR employee_id FK
        VARCHAR position "DEFAULT เจ้าหน้าที่"
        VARCHAR department "NOT NULL"
        VARCHAR five_s_group_name
        VARCHAR project_area
        DATE project_start_date "NOT NULL"
        DATE project_end_date "NOT NULL"
        TEXT problems_encountered "NOT NULL"
        TEXT solution_approach "NOT NULL"
        TEXT results_achieved
        five_s_type five_s_type "NOT NULL"
        improvement_topic improvement_topic "NOT NULL"
        sgs_smart sgs_smart
        sgs_strong sgs_strong
        sgs_green sgs_green
        VARCHAR before_project_image
        VARCHAR after_project_image
        VARCHAR created_date_th
        VARCHAR submitted_date_th
        project_status status "DEFAULT EDIT"
        form_type form_type "NOT NULL"
        TIMESTAMP created_date "DEFAULT NOW()"
        TIMESTAMP submitted_date "DEFAULT NOW()"
        TIMESTAMP updated_at "DEFAULT NOW()"
    }

    sessions {
        SERIAL id PK
        VARCHAR employee_id FK
        TIMESTAMP login_time "DEFAULT NOW()"
        TIMESTAMP logout_time
        TIMESTAMP last_activity "DEFAULT NOW()"
        INET ip_address
        TEXT user_agent
        BOOLEAN is_active "DEFAULT true"
        TIMESTAMP created_at "DEFAULT NOW()"
    }

    files {
        SERIAL id PK
        VARCHAR original_name "NOT NULL"
        VARCHAR filename UK "NOT NULL"
        VARCHAR file_path "NOT NULL"
        VARCHAR mimetype
        INTEGER size_bytes
        VARCHAR uploaded_by FK
        INTEGER project_id FK
        TIMESTAMP created_at "DEFAULT NOW()"
    }

    %% Relationships
    users ||--o{ projects : "employee_id"
    users ||--o{ sessions : "employee_id"
    users ||--o{ files : "uploaded_by"
    departments ||--o{ project_areas : "department_id"
    projects ||--o{ files : "project_id"

    %% Enum Types Documentation
    %% user_role: Admin, Manager, Supervisor, User
    %% five_s_type: ส1, ส2, ส3, ส4, ส5
    %% improvement_topic: Safety, Env, Quality, Cost, Delivery
    %% sgs_smart: People, Factory
    %% sgs_strong: Energy_3R, Workplace
    %% sgs_green: Teamwork, Branding
    %% form_type: genba, suggestion, best_kaizen
    %% project_status: EDIT, WAITING, APPROVED, REJECTED
```

## Database Schema Overview

### Core Tables
- **users**: Employee/user account information with role-based access
- **projects**: Main Kaizen project data (forms: genba, suggestion, best_kaizen)
- **departments**: Department master data
- **project_areas**: Project area classifications linked to departments
- **five_s_groups**: Five S group master data for workplace organization
- **sessions**: User session management for security tracking
- **files**: File upload tracking with project associations

### Key Relationships
1. **users → projects**: One user can create multiple projects
2. **users → sessions**: One user can have multiple active sessions
3. **users → files**: One user can upload multiple files
4. **departments → project_areas**: One department contains multiple project areas
5. **projects → files**: One project can have multiple associated files

### Enum Types
The schema uses several PostgreSQL ENUM types for data validation:
- **user_role**: Admin, Manager, Supervisor, User
- **five_s_type**: ส1, ส2, ส3, ส4, ส5
- **improvement_topic**: Safety, Env, Quality, Cost, Delivery
- **sgs_smart**: People, Factory
- **sgs_strong**: Energy_3R, Workplace
- **sgs_green**: Teamwork, Branding
- **form_type**: genba, suggestion, best_kaizen
- **project_status**: EDIT, WAITING, APPROVED, REJECTED

### Security Features
- Row Level Security (RLS) enabled on sensitive tables
- JWT-based authentication policies
- Role-based access control for data visibility and modification
- Audit trails with created_at/updated_at timestamps
- Automatic timestamp triggers for data tracking