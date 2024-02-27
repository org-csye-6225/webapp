packer {
  required_plugins {
    googlecompute = {
      version = ">= 1.1.4"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}

soure "googlecompute" "centOS_mySQL" {
  project_id     = "dev-csye6225-415015"
  source_image_family   = "centos-stream-8"
  image_name            = "custom-image-with-mysql"
  image_family          = "custom-images"
  zone                  = "us-east1-b"
  ssh_username          = "packer"
  service_account_email = "dev-service@dev-csye6225-415015.iam.gserviceaccount.com"
  scopes                = ["https://www.googleapis.com/auth/cloud-platform"]
}

build {
  sources = [
    "source.googlecompute.centOS_mySQL"
  ]


  provisi "shell" {
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
      "sudo mkdir -p /opt/csye6225/webapp",
      "sudo chown -R csye6225:csye6225 /opt/csye6225",
      "sudo chmod -R 755 /opt/csye6225/webapp",
      "sudo cp /tmp/webapp.zip /opt/csye6225/webapp/",
      "cd /opt/csye6225/webapp",
      "sudo unzip webapp.zip",
      "echo 'Unzipping done'",
      "sudo chown -R csye6225:csye6225 /opt/csye6225/webapp",
      "echo 'npm install starts'",
      "sudo npm install"
    ]
  }
  provisioner "shell" {
    inline = [
      "cd /opt/csye6225/webapp",
      "echo 'making envSetup and start_webapp.sh executable'",
      "sudo chmod +x envSetup.sh",
      "sudo chmod +x start_webapp.sh",
      "echo 'copying service file'",
      "sudo cp /opt/csye6225/webapp/webapp.service /etc/systemd/system/",
      "cd /etc/systemd/system",
      "mysqladmin -u root password root",
      "sudo systemctl daemon-reload",
      "sudo systemctl start webapp.service",
      "sudo systemctl enable webapp.service",
      "sudo systemctl status webapp.service"
    ]
  }
}
