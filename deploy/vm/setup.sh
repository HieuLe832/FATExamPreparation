#!/usr/bin/env bash
# One-time setup of the Ubuntu 22.04 VM: Docker Engine with the compose plugin (Docker's official apt
# repository) and the /opt/fat-guide folder the deploy workflow writes to. Run it as the SSH user.
set -euo pipefail

sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
# shellcheck source=/dev/null
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker "$USER"
sudo install -d -o "$USER" -g "$USER" /opt/fat-guide

echo "Done. Log out and SSH in again so the docker group takes effect, then check: docker compose version"
