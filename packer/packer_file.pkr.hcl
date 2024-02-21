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
  image_name            = "custom-image-with-mysql"
  image_family          = "custom-images"
  zone                  = "us-east1-b"
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
      "sudo systemctl start mysqld"
    ]
  }
}