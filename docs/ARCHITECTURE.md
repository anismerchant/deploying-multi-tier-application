# Architecture — Deploying Web App Using Ansible

## Purpose

Describe how infrastructure, configuration, and application layers interact
to deploy a web app on AWS EC2 using Ansible.

## System Boundaries

```
┌───────────────────────────┐
│ Local Machine             │
│ (Ansible Control Node)    │
│                           │
│ - ansible-playbook        │
│ - inventory.ini           │
│ - nginx templates         │
└─────────────┬─────────────┘
│ SSH (22)
v
┌───────────────────────────┐
│ AWS EC2                   │
│ (Managed Node)            │
│                           │
│ - Nginx                   │
│ - /var/www/<site>         │
│ - /etc/nginx/*            │
└───────────────────────────┘
```

## Layer Responsibilities

### Terraform (Infrastructure)

- Provisions EC2
- Creates security groups (22, 80)
- Attaches SSH key
- Outputs EC2 public IP

Terraform does **not** install software.

### Ansible (Configuration)

- Connects via SSH using inventory
- Installs Nginx
- Copies web app files
- Renders Nginx config from template
- Enables site and reloads Nginx

### Nginx (Runtime)

- Listens on port 80
- Serves static web app
- Routes requests to `/var/www/<site>`

## Deployment Flow

```
terraform apply
↓
EC2 instance exists
↓
Update inventory.ini with EC2 IP
↓
ansible-playbook
↓
Nginx configured and running
↓
Browser → HTTP → Web app
```

## Key Design Decisions

- Infrastructure and configuration are separated
- Ansible is idempotent (safe to re-run)
- Configuration is defined as code (templates + variables)

## Ansible Web Application Deployment Flow

This project uses Ansible to configure an Ubuntu EC2 instance and deploy
a web application served by Nginx. Ansible acts as the configuration
management and application deployment layer on top of infrastructure
provisioned by Terraform.

### High-level flow

```
Developer (Local Machine)
|
| ansible-playbook
v
Ansible Control Node
|
| SSH (key-based auth)
v
Ubuntu EC2 Instance
|
| apt / systemd
v
Nginx Web Server
|
| HTTP :80
v
Web Browser
```

### Configuration and content management

Ansible uses a role-based structure to manage the web server and application
content:

```
group_vars/web.yml
|
| variables (app_name, app_environment)
v
templates/index.html.j2
|
| template rendering
v
/var/www/html/index.html
|
| served by Nginx
v
Client Browser
```

### Key responsibilities

- **Terraform** provisions AWS infrastructure (VPC, subnet, security group, EC2)
- **Ansible** installs and manages Nginx and deploys application content
- **Nginx** serves the rendered HTML over HTTP
- **group_vars** define environment-specific values
- **templates** allow dynamic content generation without hardcoding
