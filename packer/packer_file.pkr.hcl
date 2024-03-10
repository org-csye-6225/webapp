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
      "sudo dnf install -y mysql-server",
      "sudo systemctl enable mysqld",
      "sudo systemctl start mysqld",
      "sudo dnf install unzip -y",
      "sudo dnf install -y gcc-c++ make",
      "curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -",
      "sudo dnf install nodejs -y",
      "sudo mysql -e 'CREATE DATABASE healthDB;'",
      "sudo mysql -e 'USE healthDB;'"
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
      "sudo -u csye6225 mkdir -p /opt/csye6225/webapp",
      "sudo chown -R csye6225:csye6225 /opt/csye6225",
      "sudo -u csye6225 cp /tmp/webapp.zip /opt/csye6225/webapp/",
      "cd /opt/csye6225/webapp",
      "sudo -u csye6225 unzip webapp.zip",
      "echo 'Unzipping done'",
      "sudo chown -R csye6225:csye6225 /opt/csye6225/webapp",
      "echo 'npm install starts'",
      "sudo -u csye6225 npm install",
      "sudo -u csye6225 touch /opt/csye6225/webapp/.env",
      "sudo chmod 644 /opt/csye6225/webapp/webapp.service",
      "sudo chmod 750 /opt/csye6225",
      "sudo chown -R csye6225:csye6225 /opt/csye6225",
      "sudo chmod 770 /opt/csye6225/webapp",
      "sudo chown -R csye6225:csye6225 /opt/csye6225/webapp",
      "sudo chmod 660 /opt/csye6225/webapp/*",
      "sudo chown -R csye6225:csye6225 /opt/csye6225/webapp/*"
    ]
  }
  provisioner "shell" {
    inline = [
      "echo 'copying service file'",
      "sudo -u csye6225 cp /opt/csye6225/webapp/webapp.service /etc/systemd/system/",
      "sudo chmod 744 /etc/systemd/system/webapp.service",
      "cd /etc/systemd/system",
      "sudo systemctl daemon-reload",
      "sudo systemctl start webapp.service",
      "sudo systemctl enable webapp.service",
      "sudo systemctl status webapp.service"
    ]
  }
}
