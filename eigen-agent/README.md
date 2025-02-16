# eigenai-quickstart 🤖

A ready-to-use scaffold that demonstrates how to build a verifiable AI agent using Layr Labs' AgentKit adapters. This project integrates:

- **Opacity** for verifiable AI inference (zkTLS proofs)
- **EigenDA** for data availability logging
- **Witnesschain** for location verification

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Layr-Labs/ai-quickstart.git
   cd ai-quickstart
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and fill in your API keys and configuration values:
   - Opacity: `OPENAI_KEY`, `OPACITY_TEAM_ID`, `OPACITY_TEAM_NAME`, `OPACITY_PROVER_URL`
   - EigenDA: `EIGENDA_PRIVATE_KEY`, `EIGENDA_API_URL`, `EIGENDA_BASE_RPC_URL`, `EIGENDA_CREDITS_CONTRACT`
   - Witnesschain: `WITNESSCHAIN_API_KEY`, `WITNESSCHAIN_API_URL`, `WITNESSCHAIN_PRIVATE_KEY`

> be sure to get the address for your private key whitelisted for the address provided for EIGENDA_PRIVATE_KEY.

4. **Run the demo**

   Express Server:
   ```bash
   npm run dev
   ```

## 🛠 Project Structure

```
eigenai-quickstart/
├── src/
│   ├── agent/
│   │   └── createAgent.ts    # Core agent implementation
│   ├── utils/
│   ├── index.ts             # CLI demo
│   └── server.ts            # Express API
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔧 Usage

### REST API

The Express server provides the following endpoints:

1. **Generate Verifiable Text**
   ```bash
   curl -X POST http://localhost:3000/api/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt": "What is the capital of France?"}'
   ```

2. **Verify Location**
   ```bash
   curl -X POST http://localhost:3000/api/verify-location \
     -H "Content-Type: application/json" \
     -d '{"latitude": 48.8566, "longitude": 2.3522}'
   ```

3. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

## 🔍 Core Components

### Agent Creation (`src/agent/createAgent.ts`)

The `createAgent.ts` file is the heart of this project. It:
- Initializes all three adapters (Opacity, EigenDA, Witnesschain)
- Provides methods for text generation and location verification
- Handles automatic logging to EigenDA
- Includes error handling and proper type definitions

### Express Server (`src/server.ts`)

The Express server provides a REST API interface to the agent's capabilities:
- CORS enabled
- JSON request body parsing
- Error handling
- Health check endpoint
- Clear API documentation

## 📝 Next Steps

Here are some ways you can extend this project:

1. **Add More Adapters**
   - Integrate Reclaim for credential verification

2. **Enhance Functionality**
   - Add rate limiting
   - Implement caching
   - Add authentication
   - Expand API endpoints

3. **Improve Developer Experience**
   - Add tests
   - Add CI/CD
   - Add API documentation (Swagger/OpenAPI)
   - Add monitoring and logging

# 💻 Formation Development Guide

Formation is a platform for building, deploying, and managing verifiable confidential VPS instances in the Formation network. This guide will walk you through the core development workflow and key concepts.

## Table of Contents
- [Getting Started](#getting-started)
- [Core Workflow](#core-workflow)
- [Writing Formfiles](#writing-formfiles)
- [Advanced Topics](#advanced-topics)
- [Troubleshooting](#troubleshooting)

## Getting Started

Formation uses a CLI tool called `form` to manage the entire development workflow. Before you begin development, you'll need to install and configure the Formation CLI.

### Installing Form

To install the official Formation CLI, run the following command:

```bash
curl https://dev.formation.cloud/install/form/install.sh | sudo bash
```

This script will download and install the latest version of the Formation CLI. The installation requires root privileges to ensure proper system integration.

### Initial Setup

1. Install the Formation CLI (installation instructions coming soon)

2. Initialize your development environment:
```bash
sudo form kit init
```

This launches an interactive wizard that will:
- Create or import a wallet for signing requests
- Set up your keystore location and configuration
- Configure your provider settings
- Set up your Formnet participation preferences

The wizard saves your configuration in `~/.config/form/config.json` by default.

#### Be sure to add one of the 2 hosts (or both):
<hr>
host 1: 3.214.9.18
<br>
host 2: 44.218.128.162
<hr>

### Joining Formnet

Formnet is Formation's peer-to-peer network that enables secure communication between instances. If you didn't join during initialization, you can join with:

```bash
sudo form manage join
sudo form manage formnet-up
```

The `formnet-up` command starts a background process that maintains your peer connections. This must be running to access your instances.

## Core Workflow

### 1. Create Your Formfile

Every Formation project needs a `Formfile` in its root directory. The Formfile defines your instance configuration and build process. See the [Writing Formfiles](#writing-formfiles) section for details.

### 2. Build Your Instance

From your project root directory:

```bash
sudo form pack build
```

This command:
- Validates your Formfile
- Creates a build context from your project
- Generates a unique build ID
- Initiates the build process

You'll receive a build ID that you'll use to track your build status:

```bash
form pack status --build-id <your-build-id>
```

### 3. Deploy Your Instance

Once your build succeeds, deploy it with:

```bash
form pack ship
```

This command must be run from the same directory as your original build.

### 4. Access Your Instance

Formation automatically creates redundant instances for reliability. Get their addresses with:

```bash
form manage get-ip --build-id <your-build-id>
```

Once you have an IP, access your instance via SSH:

```bash
ssh <username>@<formnet-ip>
```

Note: SSH access requires:
- Active Formnet membership
- Running `formnet-up` process
- Valid SSH key configured in your Formfile

## Writing Formfiles

A Formfile defines your instance configuration and build process. Here's the anatomy of a Formfile:

## Formfile Reference

A Formfile consists of several types of instructions that define your instance configuration and build process. Let's examine each component in detail.

### Build Instructions

#### RUN Command
The RUN instruction executes commands in the image as root during the build phase. Use this for any system-level configuration or setup tasks.

```
RUN apt-get update
RUN echo "custom_setting=value" >> /etc/system.conf
```

Multiple commands can be chained using && to create a single layer:
```
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

#### COPY Command
COPY transfers files from your build context to the instance. The build context is the directory containing your Formfile. The files will be placed in a temporary artifacts directory, archived, and then copied to your specified WORKDIR.

```
COPY ./app /app
COPY ./config.json /etc/myapp/config.json
```

If no source is specified, all files from the current directory will be copied.

#### INSTALL Command
INSTALL provides a simplified way to install system packages using apt-get. While this could be done with RUN, INSTALL handles update, installation, and cleanup automatically.

```
INSTALL nginx python3 postgresql
```

#### ENV Command
ENV sets environment variables with specific scopes. Unlike traditional Docker ENV instructions, Formation's ENV requires a scope specification.

Scopes can be:
- system: System-wide variables
- user:<username>: User-specific variables
- service:<service-name>: Service-specific variables

```
ENV --scope=system PATH=/usr/local/bin:$PATH
ENV --scope=user:webdev DB_PASSWORD=secret
ENV --scope=service:nginx NGINX_PORT=80
```

#### ENTRYPOINT Command
ENTRYPOINT specifies the command that runs when your instance starts. It can be specified in two formats:

JSON array format (recommended):
```
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```

Shell format:
```
ENTRYPOINT nginx -g "daemon off;"
```

#### EXPOSE Command
EXPOSE documents the ports your application uses. While it doesn't actually publish the ports, it serves as documentation and may be used by Formation's networking layer.

```
EXPOSE 80 443 8080
```

### User Configuration

The USER instruction in a Formfile supports comprehensive user account configuration. Here are all available options:

```
USER username:myuser \
     passwd:mypassword \
     ssh_authorized_keys:"ssh-rsa AAAA... user@host" \
     lock_passwd:false \
     sudo:true \
     shell:/bin/bash \
     ssh_pwauth:true \
     disable_root:true \
     chpasswd_expire:true \
     groups:docker,sudo
```

Configuration Options:

username (Required)
- Must start with a lowercase letter or underscore
- Can contain lowercase letters, numbers, underscores, or hyphens
- Maximum length of 32 characters

passwd (Required)
- Sets the user's password
- Will be appropriately hashed during instance creation
- Should meet your security requirements

ssh_authorized_keys (Optional)
- List of SSH public keys for remote access
- Multiple keys can be provided as a comma-separated list
- Required for SSH access to your instance

lock_passwd (Optional, default: false)
- When true, prevents password-based login
- Useful when enforcing SSH-only access

sudo (Optional, default: false)
- Grants sudo privileges to the user
- When true, adds user to sudo group

shell (Optional, default: /bin/bash)
- Specifies the user's login shell
- Must be an absolute path

ssh_pwauth (Optional, default: true)
- Enables or disables SSH password authentication
- Consider setting to false when using SSH keys exclusively

disable_root (Optional, default: true)
- Controls whether root login is disabled
- Best practice is to leave enabled and use sudo

chpasswd_expire (Optional, default: true)
- When true, forces password change on first login
- Useful for generating secure initial passwords

groups (Optional)
- Additional groups for the user
- Provided as comma-separated list
- Common groups: docker, sudo, users

### Required Fields

- `NAME`: Identifier for your instance (auto-generated if omitted)
- `USER`: At least one user configuration
- System Resources:
  - `VCPU`: 1-128 cores (default: 1)
  - `MEM`: 512-256000 MB (default: 512)
  - `DISK`: 5-65535 GB

### User Configuration

The `USER` directive supports multiple options:

```
USER username:myuser \
     passwd:mypassword \
     sudo:true \
     ssh_authorized_keys:"ssh-rsa ..." \
     lock_passwd:false \
     shell:/bin/bash \
     ssh_pwauth:true \
     disable_root:true \
     groups:docker,users
```

### Example: Simple Web Server

```
NAME hello-server

USER username:webdev passwd:webpass123 sudo:true ssh_authorized_keys:"ssh-rsa ..."

VCPU 2
MEM 2048
DISK 5

COPY ./app /app
INSTALL python3

WORKDIR /app
ENTRYPOINT ["python3", "server.py"]
```

## Advanced Topics

### Resource Limits

Development Network Limits:
- VCPU: Max 2 cores
- Memory: 512-4096 MB
- Disk: Max 5 GB

These limits will be higher on testnet and mainnet.

### Nginx Configuration

Formation instances come with a pre-installed nginx server. Your configuration needs will depend on your deployment architecture.

#### Option 1: Using the System Nginx

For simple deployments, you can replace the default nginx configuration:

```
COPY ./my-nginx.conf /etc/nginx/nginx.conf
RUN sudo systemctl restart nginx
```

This approach works well when:
- Your application doesn't use containerized nginx
- You need a simple reverse proxy or static file server
- You want to maintain the standard system service

#### Option 2: Containerized Nginx with Docker Networking

When using docker-compose or container deployments that rely on Docker's internal networking (e.g., using `proxy_pass http://container-name`), you'll need to manage the system nginx service. There are two approaches:

You can manage the system nginx service directly in your Formfile using the `RUN` command:

1. To stop nginx for the current session:
   ```
   RUN sudo systemctl stop nginx
   ```

2. To permanently disable nginx on boot:
   ```
   RUN sudo systemctl stop nginx && sudo systemctl disable nginx
   ```

Including these commands in your Formfile automates the service management as part of your deployment.

Important Considerations:
- If your nginx configuration uses Docker container names in `proxy_pass` directives, you must use a containerized nginx instance
- The system nginx service must be stopped to avoid port conflicts
- Even with `disable`, you may need to SSH into the instance after initial deployment
- Future updates to Formation may provide more automated solutions for this workflow

Example docker-compose nginx configuration:
```yaml
services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

With corresponding nginx.conf:
```nginx
http {
    upstream app {
        server app:3000;  # Docker network allows using container name
    }
    server {
        listen 80;
        location / {
            proxy_pass http://app;
        }
    }
}
```

These container-based deployments require careful consideration of service orchestration and may need additional deployment steps.

### Build Context

The build context is determined by the directory containing your Formfile. All `COPY` commands are relative to this directory.

## Troubleshooting

### Common Issues

1. Cannot SSH into instance
   - Verify `formnet-up` is running
   - Confirm you've joined Formnet
   - Check your SSH key configuration

2. Build fails
   - Verify your resource requests are within limits
   - Check your Formfile syntax
   - Ensure all copied files exist in your build context

3. Deployment issues
   - Confirm you're in the same directory as your build
   - Verify your network connection
   - Check your provider status

### Getting Help

Join our community:
- GitHub: github.com/formthefog/formation
- Twitter: @formthefog


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
