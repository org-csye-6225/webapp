# variables.pkr.hcl
variable "MYSQL_ROOT_PASSWORD" {
 description = "MYSQL_ROOT_PASSWORD"
}

variable "SQL_USER" {
  description = "The user variable"
}

variable "SQL_PSWD" {
  description = "The password variable"
}

variable "AUTH_USER" {
  description = "The authentication user variable"
}

variable "AUTH_PSWD" {
  description = "The authentication password variable"
}
