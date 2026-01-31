# Deploying Web App Using Ansible (AWS EC2 + Nginx)

This project demonstrates how to deploy a web application to an **Ubuntu EC2 instance**
using **Ansible** for configuration management and **Terraform** for infrastructure
provisioning.

Terraform is responsible only for provisioning AWS resources.
Ansible installs, configures, and deploys the web application.

## Goal

Configure a remote server so that:

- Nginx is installed
- A web application is deployed to `/var/www/html`
- Page content is generated using an **Ansible Jinja2 template**
- Nginx is enabled and running
- The application is reachable over HTTP

## High-Level Architecture

Terraform provisions infrastructure → Ansible configures the server and deploys the app.

```
Local machine (Ansible control node)
|
| ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
v
EC2 instance (Ubuntu)

* install nginx
* deploy templated index.html
* ensure nginx is enabled and running
```

## Repository Structure

```
.
├── terraform/                 # AWS infrastructure provisioning
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── versions.tf
│   └── modules/
│       ├── network/
│       └── compute/
│
├── ansible/
│   ├── ansible.cfg            # Project-scoped Ansible configuration
│   ├── inventory.ini          # EC2 inventory
│   ├── playbook.yml           # Entry-point playbook
│   ├── bootstrap.yml          # Optional host bootstrap tasks
│   ├── group_vars/
│   │   └── web.yml            # Environment-specific variables
│   └── roles/
│       └── nginx/
│           ├── tasks/
│           │   └── main.yml   # Nginx installation and deployment logic
│           └── templates/
│               └── index.html.j2
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── RUNBOOK.md
│   └── ANSIBLE-TROUBLESHOOTING.md
│
└── README.md
```

## Separation of Concerns

- **Terraform**
  - Provisions VPC, subnet, security group, and EC2
  - Outputs the EC2 public IP
- **Ansible**
  - Installs and configures Nginx
  - Deploys application content
  - Manages services idempotently
- **Nginx**
  - Serves the rendered HTML page over HTTP

## Ansible Role Design

### `nginx` role responsibilities

- Update apt package cache
- Install Nginx
- Ensure the Nginx service is enabled and running
- Deploy a templated `index.html` file to `/var/www/html`

All server configuration logic is encapsulated in a reusable Ansible role.

## Variables & Templating

The web page is generated from a Jinja2 template:

```
ansible/roles/nginx/templates/index.html.j2
```

Injected variables include:

- Application name
- Environment (e.g. sandbox)
- Hostname
- Deployment timestamp

Variables are defined in:

```
ansible/group_vars/web.yml
````

This demonstrates configuration-driven deployment rather than static scripting.

## Idempotency

The Ansible playbook is **idempotent**:

- Re-running the playbook does not introduce unnecessary changes
- Verified using Ansible check mode:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --check
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --check -vv
````

## Prerequisites

* AWS credentials configured locally
* Terraform installed
* Ansible installed
* SSH key pair:

  * `deploying-web-app-using-ansible-key` (private)
  * `deploying-web-app-using-ansible-key.pub` (public)

## How to Run

### 1️⃣ Provision Infrastructure (Terraform)

```bash
cd terraform
terraform init
terraform validate
terraform plan
terraform apply
```

Terraform outputs the EC2 public IP address.

### 2️⃣ Configure Ansible Inventory

Edit:

```
ansible/inventory.ini
```

Set the EC2 public IP and SSH details.

Verify connectivity:

```bash
ansible all -i ansible/inventory.ini -m ping
```

### 3️⃣ Deploy the Web Application (Ansible)

From the repository root:

```bash
ansible-inventory -i ansible/inventory.ini --list
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

## Verification

* Visit: `http://<EC2_PUBLIC_IP>/`
* Expected result:

  * Custom web page served by Nginx
  * Page displays environment, host, and deployment timestamp

## Evidence

Execution logs and screenshots are stored externally to keep the repository clean:

```
deploying-webapp-using-ansible-screenshots/
```

## Summary

* Terraform provisions infrastructure
* Ansible configures and deploys the application
* Templates are used for dynamic content
* Deployment is repeatable and idempotent
* No manual server changes are required
