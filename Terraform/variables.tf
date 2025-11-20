variable "aws_region" {
  default = "ap-south-1"
}

variable "instance_type" {
  default = "t3.micro"
}

variable "ami_id" {
  default = "ami-087d1c9a513324697"
}

variable "key_name" {
  description = "Name of an EXISTING AWS Key Pair"
  type        = string
}
