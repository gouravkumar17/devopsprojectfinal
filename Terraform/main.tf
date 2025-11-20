provider "aws" {
  region = var.aws_region
}

# Security Group to ALLOW SSH + HTTP
resource "aws_security_group" "ssh_allow" {
  name        = "allow_ssh_http"
  description = "Allow SSH and HTTP access"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "web" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  associate_public_ip_address = true

  vpc_security_group_ids = [
    aws_security_group.ssh_allow.id
  ]

  tags = {
    Name = "Expense-Tracker"
  }
}

# OUTPUTS
output "expense_tracker_public_ip" {
  value = aws_instance.web.public_ip
}


