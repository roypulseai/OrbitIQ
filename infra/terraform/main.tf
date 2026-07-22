terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "orbitiq-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "orbitiq-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "OrbitIQ"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "orbitiq-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = var.environment != "prod"
  enable_dns_hostnames = true

  tags = {
    Environment = var.environment
  }
}

# RDS PostgreSQL
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.0.0"

  identifier = "orbitiq-${var.environment}"

  engine               = "postgres"
  engine_version       = "16.1"
  family               = "postgres16"
  major_engine_version = "16"
  instance_class       = var.rds_instance_class

  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage

  db_name  = "orbitiq"
  username = "orbitiq_admin"
  port     = 5432

  multi_az               = var.environment == "prod"
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [module.vpc.default_security_group_id]

  maintenance_window      = "Mon:00:00-Mon:03:00"
  backup_window           = "03:00-06:00"
  backup_retention_period = var.environment == "prod" ? 30 : 7

  deletion_protection = var.environment == "prod"
  skip_final_snapshot = var.environment != "prod"

  parameters = [
    {
      name  = "log_statement"
      value = "all"
    },
    {
      name  = "log_min_duration_statement"
      value = "1000"
    }
  ]
}

# ElastiCache Redis
module "redis" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "1.0.0"

  replication_group_id = "orbitiq-${var.environment}"
  description          = "OrbitIQ Redis cluster"

  node_type            = var.redis_node_type
  num_cache_clusters   = var.environment == "prod" ? 2 : 1
  port                 = 6379

  subnet_group_name    = module.vpc.elasticache_subnet_group_name
  security_group_ids   = [module.vpc.default_security_group_id]

  maintenance_window = "sun:05:00-sun:06:00"
  snapshot_window    = "06:00-07:00"
}

# EKS
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.0.0"

  cluster_name    = "orbitiq-${var.environment}"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general = {
      name = "orbitiq-${var.environment}"

      instance_types = ["t3.large"]
      capacity_type  = "ON_DEMAND"

      min_size     = var.environment == "prod" ? 3 : 2
      max_size     = var.environment == "prod" ? 10 : 4
      desired_size = var.environment == "prod" ? 3 : 2

      labels = {
        role = "general"
      }
    }

    analytics = {
      name = "orbitiq-analytics-${var.environment}"

      instance_types = ["c5.2xlarge"]
      capacity_type  = "ON_DEMAND"

      min_size     = 0
      max_size     = var.environment == "prod" ? 5 : 2
      desired_size = 0

      labels = {
        role = "analytics"
      }

      taints = [
        {
          key    = "dedicated"
          value  = "analytics"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }
}

# S3
resource "aws_s3_bucket" "extracts" {
  bucket = "orbitiq-extracts-${var.environment}"

  tags = {
    Name        = "OrbitIQ Extracts"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "extracts" {
  bucket = aws_s3_bucket.extracts.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "extracts" {
  bucket = aws_s3_bucket.extracts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "extracts" {
  bucket = aws_s3_bucket.extracts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
