packer {
  required_plugins {
    googlecompute = {
      version = ">= 1.1.4"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}

source "googlecompute" "centOS_mySQL" {
  project_id            = "tf-project-csye-6225"
  source_image_family   = "centos-stream-8"
  image_name            = "custom-image-with-mysql-{{timestamp}}"
  image_family          = "custom-images"
  zone                  = "europe-central2-a"
  ssh_username          = "packer"
  service_account_email = "csye6225-service-for-packer@tf-project-csye-6225.iam.gserviceaccount.com"
  scopes                = ["https://www.googleapis.com/auth/cloud-platform"]
}

build {
  sources = [
    "source.googlecompute.centOS_mySQL"
  ]

  provisioner "shell" {
    inline = [
      "sudo dnf update -y",
      "sudo dnf install unzip -y",
      "sudo dnf install -y gcc-c++ make",
      "curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -",
      "sudo dnf install nodejs -y"
    ]
  }

  provisioner "file" {
    source      = "/tmp/webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo groupadd csye6225",
      "sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225",
      "sudo mkdir -p /opt/csye6225/webapp",
      "sudo chown -R csye6225:csye6225 /opt/csye6225",
      "sudo cp /tmp/webapp.zip /opt/csye6225/webapp/",
      "cd /opt/csye6225/webapp",
      "sudo unzip webapp.zip",
      "echo 'Unzipping done'",
      "sudo chown -R csye6225:csye6225 /opt/csye6225/webapp",
      "echo 'npm install starts'",
      "sudo npm install",
      "sudo touch /opt/csye6225/webapp/.env"
    ]
  }

  provisioner "shell" {
    inline = [
      "echo 'copying service file'",
      "sudo cp /opt/csye6225/webapp/webapp.service /etc/systemd/system/",
      "cd /etc/systemd/system",
      "sudo systemctl daemon-reload",
      "sudo systemctl start webapp.service",
      "sudo systemctl enable webapp.service",
      "sudo systemctl status webapp.service",
      "sudo chmod 700 /opt/csye6225"
    ]
  }

  provisioner "shell" {
    inline = [
      "curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh",
      "sudo bash add-google-cloud-ops-agent-repo.sh --also-install",
      "sudo mkdir -p /var/log/webapp",
      "sudo chown -R csye6225:csye6225 /var/log/webapp",
      "sudo chmod 774 /var/log/webapp",
      "sudo setfacl -d -m u::rwx /var/log/webapp",
      "sudo setfacl -d -m g::rwx /var/log/webapp",
      "sudo setfacl -d -m o::r /var/log/webapp"
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo sh -c 'cat <<EOF > /etc/google-cloud-ops-agent/config.yaml'",
      "logging:",
      "  receivers:",
      "    my-app-receiver:",
      "      type: files",
      "      include_paths:",
      "        - /var/log/webapp/combined.log",
      "      record_log_file_path: true",
      "  processors:",
      "    my-app-processor:",
      "      type: parse_json",
      "      time_key: time",
      "      time_format: \"%Y-%m-%dT%H:%M:%S.%L%Z\"",
      "      move_severity:",
      "        type: modify_fields",
      "        fields:",
      "          severity:",
      "            move_from: jsonPayload.severity",
      "    service:",
      "      pipelines:",
      "        default_pipeline:",
      "          receivers: [my-app-receiver]",
      "          processors: [my-app-processor, move_severity]",
      "EOF'",
      "sudo systemctl restart google-cloud-ops-agent"
    ]
  }
}
