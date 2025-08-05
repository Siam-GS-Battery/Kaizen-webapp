# AWS Infrastructure Guide - Kaizen Web Application

## Overview
This document outlines the recommended AWS infrastructure architecture for the Kaizen Web Application, including database, storage, compute, security, and monitoring components.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Internet                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                 CloudFront CDN                                   │
│              (Global Distribution)                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                Route 53 DNS                                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                      WAF                                         │
│            (Web Application Firewall)                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│              Application Load Balancer                          │
│                  (HTTPS/SSL)                                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼────┐ ┌──────▼───────┐
│   EC2 Web    │ │ EC2 Web │ │  EC2 Web     │
│  Instance    │ │Instance │ │  Instance    │
│  (Backend)   │ │(Backend)│ │  (Backend)   │
└───────┬──────┘ └────┬────┘ └──────┬───────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                  RDS Database                                    │
│              (MySQL/PostgreSQL)                                 │
│                   Multi-AZ                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     S3 Storage                                  │
│               (Images & Static Files)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Database Configuration

### Amazon RDS (Relational Database Service)

```yaml
Configuration:
  Engine: MySQL 8.0 LTS
  Instance Class: db.t3.medium
  vCPU: 2
  Memory: 4 GB
  Storage: 
    Type: gp3 (General Purpose SSD)
    Size: 100 GB (Initial)
    Max IOPS: 3000
    Throughput: 125 MB/s
  
Multi-AZ Deployment: Yes (Production)
Backup Configuration:
  Backup Retention: 7 days
  Backup Window: 03:00-04:00 UTC
  Maintenance Window: Sun 04:00-05:00 UTC
  
Parameter Group:
  innodb_buffer_pool_size: 2.5GB
  max_connections: 200
  query_cache_size: 64MB
  
Security:
  Encryption at Rest: Yes (AES-256)
  SSL/TLS: Required
  VPC Security Groups: Database tier only
```

### Database Schema Creation

```sql
-- Create database
CREATE DATABASE kaizen_webapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Example table creation (refer to Data Dictionary for complete schema)
CREATE TABLE users (
  user_id CHAR(36) PRIMARY KEY,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  department VARCHAR(20) NOT NULL,
  five_s_area VARCHAR(100) NOT NULL,
  project_area VARCHAR(100) NOT NULL,
  role ENUM('Admin','Manager','Supervisor','User') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_department (department),
  INDEX idx_role (role)
);
```

---

## 2. File Storage Configuration

### Amazon S3 (Simple Storage Service)

```yaml
Bucket Configuration:
  Bucket Name: kaizen-webapp-files-{environment}
  Region: ap-southeast-1 (Singapore)
  
Storage Classes:
  Standard: Active images (0-30 days)
  Standard-IA: Older images (30-365 days)  
  Glacier Flexible Retrieval: Archive (>365 days)
  
Lifecycle Policy:
  - Transition to Standard-IA after 30 days
  - Transition to Glacier after 365 days
  - Delete incomplete multipart uploads after 7 days
  
Security:
  Server-Side Encryption: AES-256
  Bucket Versioning: Enabled
  Public Access: Blocked
  
CORS Configuration:
  AllowedOrigins: ["https://your-domain.com"]
  AllowedMethods: ["GET", "POST", "PUT", "DELETE"]
  AllowedHeaders: ["*"]
  MaxAgeSeconds: 3000
```

### S3 Folder Structure

```
kaizen-webapp-files/
├── projects/
│   ├── before/
│   │   └── {project_id}/
│   │       └── {image_id}.{extension}
│   └── after/
│       └── {project_id}/
│           └── {image_id}.{extension}
├── temp/
│   └── uploads/
├── backups/
│   └── database/
└── logs/
    ├── application/
    └── access/
```

---

## 3. Compute Infrastructure

### EC2 Instances

```yaml
Web/Application Servers:
  Instance Type: t3.medium
  vCPU: 2
  Memory: 4 GB
  Storage: 50 GB gp3 EBS
  OS: Amazon Linux 2023
  
Auto Scaling Group:
  Min Instances: 1
  Max Instances: 3
  Desired Capacity: 2
  Scaling Policy: Target CPU 70%
  
Security Groups:
  Web Server SG:
    Inbound: 
      - Port 80 (HTTP) from ALB
      - Port 443 (HTTPS) from ALB
      - Port 22 (SSH) from Bastion Host
    Outbound: All traffic
```

### Application Load Balancer

```yaml
Configuration:
  Type: Application Load Balancer
  Scheme: Internet-facing
  IP Address Type: IPv4
  
Listeners:
  HTTP (Port 80): Redirect to HTTPS
  HTTPS (Port 443): Forward to Target Group
  
Target Group:
  Protocol: HTTP
  Port: 3000
  Health Check:
    Path: /health
    Interval: 30 seconds
    Timeout: 5 seconds
    Healthy Threshold: 2
    Unhealthy Threshold: 3
  
SSL Certificate:
  Source: AWS Certificate Manager
  Domain: *.your-domain.com
```

---

## 4. Security Configuration

### Web Application Firewall (WAF)

```yaml
WAF Rules:
  - AWS Managed Core Rule Set
  - AWS Managed IP Reputation List
  - Rate Limiting: 2000 requests per 5 minutes
  - SQL Injection Protection
  - XSS Protection
  - Geographic Blocking (if needed)
  
Custom Rules:
  - Block common attack patterns
  - Allow only specific user agents
  - Whitelist office IP addresses
```

### IAM Roles and Policies

```yaml
EC2 Instance Role:
  Policies:
    - S3 Read/Write access to application bucket
    - CloudWatch Logs write access
    - Parameter Store read access
    - RDS Connect (if using IAM database authentication)
  
Application User Role:
  Policies:
    - S3 upload/download for specific prefixes
    - Limited CloudWatch metrics access
```

### Secrets Management

```yaml
AWS Secrets Manager:
  Database Credentials:
    - RDS master password
    - Application database user
  
  API Keys:
    - Third-party service keys
    - JWT signing keys
  
AWS Systems Manager Parameter Store:
  Application Configuration:
    - Environment variables
    - Feature flags
    - Non-sensitive configuration
```

---

## 5. Monitoring and Logging

### CloudWatch Configuration

```yaml
Metrics:
  EC2 Metrics:
    - CPU Utilization
    - Memory Usage (Custom)
    - Disk I/O
    - Network I/O
  
  RDS Metrics:
    - Database Connections
    - CPU Utilization  
    - Free Storage Space
    - Read/Write IOPS
  
  Application Metrics:
    - HTTP Response Times
    - Error Rates
    - Active Sessions
    - Form Submissions
  
Alarms:
  Critical:
    - RDS CPU > 80%
    - EC2 CPU > 85%
    - Application Error Rate > 5%
    - Database Connection > 150
  
  Warning:
    - RDS Free Storage < 20%
    - High Memory Usage > 80%
    - Long Response Times > 2s
```

### Logging Strategy

```yaml
Application Logs:
  Level: INFO (Production), DEBUG (Development)
  Format: JSON structured logging
  Rotation: Daily
  Retention: 30 days in CloudWatch

Access Logs:
  Load Balancer: Enabled to S3
  CloudFront: Enabled to S3
  Retention: 90 days

Audit Logs:
  All database changes
  User authentication events
  Admin actions
  File uploads/downloads
  Retention: 1 year
```

---

## 6. Backup and Disaster Recovery

### Database Backup

```yaml
RDS Automated Backup:
  Retention Period: 7 days
  Backup Window: 03:00-04:00 UTC
  Point-in-Time Recovery: Enabled
  
Manual Snapshots:
  Frequency: Weekly
  Retention: 30 days
  Cross-Region Copy: ap-northeast-1 (Tokyo)
  
Database Export:
  Monthly full export to S3
  Format: SQL dump + JSON data
  Encryption: Yes
```

### File Backup

```yaml
S3 Cross-Region Replication:
  Source: ap-southeast-1 (Singapore)
  Destination: ap-northeast-1 (Tokyo)
  
S3 Versioning:
  Enabled for all objects
  Lifecycle: Delete versions after 90 days
  
Backup Schedule:
  Incremental: Daily
  Full: Weekly
  Archive: Monthly
```

### Application Backup

```yaml
AMI Creation:
  Frequency: Weekly
  Retention: 4 weeks
  Automated via Lambda function
  
Configuration Backup:
  Infrastructure as Code: Terraform/CloudFormation
  Application Config: Git repository
  Database Schema: Version controlled migrations
```

---

## 7. Cost Optimization

### Monthly Cost Estimate (Singapore Region)

```yaml
Compute:
  EC2 (2 x t3.medium): $60-80
  Load Balancer: $20-25
  
Database:
  RDS (db.t3.medium): $50-70
  Storage (100GB): $12-15
  Backup Storage: $5-10
  
Storage:
  S3 Standard (100GB): $2-3
  S3 Transfer: $5-10
  
Network:
  CloudFront: $10-20
  Data Transfer: $10-20
  
Security:
  WAF: $5-10
  Certificate Manager: Free
  
Monitoring:
  CloudWatch: $10-20
  
Total Estimated: $189-283/month
```

### Cost Optimization Strategies

```yaml
Reserved Instances:
  EC2: 1-year term, 30% savings
  RDS: 1-year term, 35% savings
  
Spot Instances:
  Development/Testing: 70% savings
  Non-critical workloads
  
S3 Optimization:
  Lifecycle policies: 20-50% savings
  Intelligent Tiering: Automatic optimization
  
Monitoring:
  AWS Cost Explorer: Track spending
  Budgets: Set spending alerts
  Right-sizing: Regular instance review
```

---

## 8. Deployment Strategy

### Infrastructure as Code

```yaml
Terraform Configuration:
  Provider: AWS
  State Backend: S3 + DynamoDB
  Modules:
    - VPC and Networking
    - Security Groups
    - RDS Database
    - EC2 Auto Scaling
    - Load Balancer
    - S3 Buckets
    - CloudWatch
```

### CI/CD Pipeline

```yaml
GitHub Actions:
  Triggers:
    - Push to main branch
    - Pull request creation
  
  Stages:
    1. Code Quality Check
    2. Security Scan
    3. Build Application
    4. Run Tests
    5. Build Docker Image
    6. Deploy to Staging
    7. Integration Tests
    8. Deploy to Production
  
  Deployment Strategy:
    Blue-Green Deployment
    Rolling Updates
    Automatic Rollback on Failure
```

---

## 9. Environment Setup

### Development Environment

```yaml
Resources:
  EC2: t3.micro (1 instance)
  RDS: db.t3.micro (Single-AZ)
  S3: Standard storage only
  
Cost: ~$40-60/month
Purpose: Feature development and testing
```

### Staging Environment

```yaml
Resources:
  EC2: t3.small (1 instance)  
  RDS: db.t3.small (Single-AZ)
  S3: Standard + lifecycle policies
  
Cost: ~$80-120/month
Purpose: Integration testing and UAT
```

### Production Environment

```yaml
Resources:
  EC2: t3.medium (2+ instances)
  RDS: db.t3.medium (Multi-AZ)
  S3: Full lifecycle management
  
Cost: ~$189-283/month
Purpose: Live application serving users
```

---

## 10. Security Best Practices

### Network Security

```yaml
VPC Configuration:
  Private Subnets: Database tier
  Public Subnets: Web tier only
  NAT Gateway: For outbound internet access
  
Security Groups:
  Principle of Least Privilege
  No 0.0.0.0/0 access except for web tier
  Database access only from application tier
```

### Data Security

```yaml
Encryption:
  At Rest: All RDS and S3 data
  In Transit: HTTPS/TLS everywhere
  Keys: AWS KMS managed
  
Access Control:
  IAM Roles: No long-term access keys
  MFA: Required for admin access
  Session Tokens: Time-limited
```

### Compliance

```yaml
Audit Requirements:
  CloudTrail: All API calls logged
  Config: Configuration compliance
  GuardDuty: Threat detection
  
Data Privacy:
  Personal data encryption
  Access logging
  Data retention policies
  GDPR compliance considerations
```

---

## Next Steps

1. **Infrastructure Setup**
   - Create AWS account and configure billing
   - Set up Terraform/CloudFormation templates
   - Deploy development environment first

2. **Database Migration**
   - Create database schema from Data Dictionary
   - Set up migration scripts
   - Import initial master data

3. **Application Deployment**
   - Containerize application with Docker
   - Set up CI/CD pipeline
   - Configure monitoring and alerting

4. **Security Implementation**
   - Enable all security services
   - Configure IAM roles and policies
   - Set up backup and disaster recovery

5. **Testing and Optimization**
   - Load testing
   - Security penetration testing
   - Performance optimization
   - Cost optimization review