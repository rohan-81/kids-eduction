#!/usr/bin/env python3
"""
KidsZone S3 Media Asset Deployment & CDN Cache Synchronizer.

Deploys all backend/media/ assets to AWS S3 & CloudFront with modern best practices:
1. CloudFront Origin Access Control (OAC) compliant: Keeps bucket private.
   Only cloudfront.amazonaws.com is allowed via AWS:SourceArn condition.
2. Synchronizes all 4 media subfolders:
   - media/characters/ (WebP + PNG 3D renders): immutable 1-year cache
   - media/stories/ (Story illustrations): immutable 1-year cache
   - media/audio/animals/ (Animal SFX): immutable 1-year cache
   - media/rhymes/audio/ (Rhyme MP3s only): 1-day must-revalidate cache
3. Auto-detected MIME content-types: Does not force image/webp on PNGs.
4. Excludes non-audio files (ensures zero markdown/legal documents uploaded as audio).
5. CloudFront Cache Policy & Invalidation with strict exit-code error handling.
6. Guarded --apply-policy: Refuses to apply policies containing unpopulated
   placeholders to prevent accidental 403 media outages.
7. Safe ASCII logging for cross-platform redirected stdout / Windows charmap terminals.

Usage:
    python backend/scripts/deploy_media_s3.py --bucket <BUCKET> [--distribution-id <ID>] [--account-id <ACCOUNT_ID>] [--apply-policy] [--dry-run]
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

# Windows redirected-stdout / charmap encoding safety
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

BACKEND_DIR = Path(__file__).resolve().parent.parent
MEDIA_DIR = BACKEND_DIR / 'media'
SCRIPTS_DIR = BACKEND_DIR / 'scripts'
POLICY_FILE = SCRIPTS_DIR / 's3_bucket_policy.json'
CLOUDFRONT_POLICY_FILE = SCRIPTS_DIR / 'cloudfront_cache_policy.json'


def resolve_aws_account_id(account_id_arg: str | None) -> str | None:
    """Resolves AWS Account ID via argument, env var, or aws sts get-caller-identity."""
    if account_id_arg and account_id_arg.strip() and account_id_arg != "AWS_ACCOUNT_ID":
        return account_id_arg.strip()
    env_acc = os.getenv("AWS_ACCOUNT_ID", "").strip()
    if env_acc and env_acc != "AWS_ACCOUNT_ID":
        return env_acc
    try:
        res = subprocess.run(
            ["aws", "sts", "get-caller-identity", "--query", "Account", "--output", "text"],
            capture_output=True,
            text=True,
            timeout=6
        )
        if res.returncode == 0 and res.stdout.strip() and not res.stdout.strip().startswith("None"):
            return res.stdout.strip()
    except Exception:
        pass
    return None


def generate_cloudfront_oac_bucket_policy(bucket_name: str, dist_id: str = "DISTRIBUTION_ID", account_id: str = "AWS_ACCOUNT_ID") -> dict:
    """
    Generates AWS CloudFront Origin Access Control (OAC) S3 bucket policy.
    Keeps bucket private and restricts access strictly to the CloudFront distribution.
    """
    return {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowCloudFrontServicePrincipalReadOnly",
                "Effect": "Allow",
                "Principal": {
                    "Service": "cloudfront.amazonaws.com"
                },
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{bucket_name}/media/*",
                "Condition": {
                    "StringEquals": {
                        "AWS:SourceArn": f"arn:aws:cloudfront::{account_id}:distribution/{dist_id}"
                    }
                }
            }
        ]
    }


def generate_cloudfront_cache_policy() -> dict:
    """Generates CloudFront CachePolicy configured to include query strings (?v=)."""
    return {
        "Name": "KidsZone-Media-CachePolicy",
        "Comment": "Forward all query strings to bust CDN edge cache on asset version bump",
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "MinTTL": 0,
        "ParametersInCacheKeyAndForwardedToOrigin": {
            "EnableAcceptEncodingGzip": True,
            "EnableAcceptEncodingBrotli": True,
            "HeadersConfig": {"HeaderBehavior": "none"},
            "CookiesConfig": {"CookieBehavior": "none"},
            "QueryStringsConfig": {
                "QueryStringBehavior": "all"
            }
        }
    }


def deploy_media(
    bucket_name: str,
    region: str = "ap-south-1",
    dist_id: str | None = None,
    account_id: str | None = None,
    apply_policy: bool = False,
    dry_run: bool = False
) -> bool:
    if not MEDIA_DIR.exists():
        print(f"Error: media directory not found at {MEDIA_DIR}")
        return False

    print("==================================================")
    print("KidsZone S3 / CloudFront Media Deployer")
    print(f"Target Bucket:   s3://{bucket_name}/media/")
    print(f"Region:          {region}")
    print(f"Distribution ID: {dist_id or '(none provided)'}")
    print(f"Mode:            {'DRY RUN (preview only)' if dry_run else 'LIVE DEPLOY'}")
    print("==================================================")

    # Resolve Account ID
    resolved_account = resolve_aws_account_id(account_id)
    effective_dist_id = dist_id or "DISTRIBUTION_ID"
    effective_account = resolved_account or "AWS_ACCOUNT_ID"

    # Outage Guard: Refuse --apply-policy if placeholders remain
    if apply_policy:
        if not dist_id or dist_id == "DISTRIBUTION_ID":
            print("Error: --apply-policy requires a valid CloudFront distribution ID (--distribution-id).")
            print("Refusing to apply a policy with placeholder distribution ID that would cause a 403 media outage.")
            return False
        if not resolved_account:
            print("Error: --apply-policy requires a valid AWS Account ID.")
            print("Could not resolve via --account-id, AWS_ACCOUNT_ID, or 'aws sts get-caller-identity'.")
            print("Refusing to apply policy that would cause a 403 media outage.")
            return False

    # 1. Reference Policy Generation (Only written when --apply-policy is active to keep git tree clean)
    oac_policy = generate_cloudfront_oac_bucket_policy(bucket_name, effective_dist_id, effective_account)
    cf_policy = generate_cloudfront_cache_policy()

    if not dry_run and apply_policy:
        with open(POLICY_FILE, 'w', encoding='utf-8') as f:
            json.dump(oac_policy, f, indent=2)
        with open(CLOUDFRONT_POLICY_FILE, 'w', encoding='utf-8') as f:
            json.dump(cf_policy, f, indent=2)
        print(f"[OK] Written OAC S3 Bucket Policy: {POLICY_FILE.name}")
        print(f"[OK] Written CloudFront Cache Policy: {CLOUDFRONT_POLICY_FILE.name}")

        print(f"\nApplying S3 Bucket Policy to s3://{bucket_name}...")
        res_pol = subprocess.run([
            "aws", "s3api", "put-bucket-policy",
            "--bucket", bucket_name,
            "--policy", f"file://{POLICY_FILE}",
            "--region", region
        ])
        if res_pol.returncode != 0:
            print("Error: Failed to apply S3 bucket policy.")
            return False
        print("[OK] S3 bucket policy applied successfully.")
    elif dry_run:
        print("[OK] [DRY RUN] Generated OAC S3 Bucket Policy & CloudFront Policy in memory.")

    # 2. Sync characters/ (WebP + PNG 3D renders)
    # Note: No forced --content-type; AWS CLI automatically detects image/webp and image/png from file extension!
    chars_dir = MEDIA_DIR / 'characters'
    if chars_dir.exists():
        print("\n[1/4] Syncing 3D Character Renders (WebP + PNG)...")
        cmd_chars = [
            "aws", "s3", "sync",
            str(chars_dir),
            f"s3://{bucket_name}/media/characters/",
            "--cache-control", "public, max-age=31536000, immutable",
            "--region", region,
        ]
        print("Command:", " ".join(cmd_chars))
        if not dry_run:
            res = subprocess.run(cmd_chars)
            if res.returncode != 0:
                print("Error syncing character renders.")
                return False

    # 3. Sync stories/ (Story illustration visuals)
    stories_dir = MEDIA_DIR / 'stories'
    if stories_dir.exists():
        print("\n[2/4] Syncing Story Visual Illustrations...")
        cmd_stories = [
            "aws", "s3", "sync",
            str(stories_dir),
            f"s3://{bucket_name}/media/stories/",
            "--cache-control", "public, max-age=31536000, immutable",
            "--region", region,
        ]
        print("Command:", " ".join(cmd_stories))
        if not dry_run:
            res = subprocess.run(cmd_stories)
            if res.returncode != 0:
                print("Error syncing story visuals.")
                return False

    # 4. Sync audio/animals/ (Animal Sound Effects)
    animals_dir = MEDIA_DIR / 'audio' / 'animals'
    if animals_dir.exists():
        print("\n[3/4] Syncing Animal Sound Effects (SFX)...")
        cmd_animals = [
            "aws", "s3", "sync",
            str(animals_dir),
            f"s3://{bucket_name}/media/audio/animals/",
            "--cache-control", "public, max-age=31536000, immutable",
            "--region", region,
        ]
        print("Command:", " ".join(cmd_animals))
        if not dry_run:
            res = subprocess.run(cmd_animals)
            if res.returncode != 0:
                print("Error syncing animal sound effects.")
                return False

    # 5. Sync rhymes/audio/ (Nursery Rhyme Audio Tracks - MP3 only, 1-day revalidation cache)
    # Uses --exclude "*" --include "*.mp3" so non-audio files (like markdown notes) are never uploaded.
    # --delete mirrors removals: a track withdrawn for licensing (AUDIO_PROVENANCE.md) must stop
    # being served by the CDN too, not linger in the bucket. Filters scope it to *.mp3 in this prefix.
    rhymes_dir = MEDIA_DIR / 'rhymes' / 'audio'
    if rhymes_dir.exists():
        print("\n[4/4] Syncing Nursery Rhyme Audio Tracks (MP3 only, 1-day revalidation, removals mirrored)...")
        cmd_rhymes = [
            "aws", "s3", "sync",
            str(rhymes_dir),
            f"s3://{bucket_name}/media/rhymes/audio/",
            "--delete",
            "--exclude", "*",
            "--include", "*.mp3",
            "--cache-control", "public, max-age=86400, must-revalidate",
            "--region", region,
        ]
        print("Command:", " ".join(cmd_rhymes))
        if not dry_run:
            res = subprocess.run(cmd_rhymes)
            if res.returncode != 0:
                print("Error syncing rhyme audio tracks.")
                return False

    # 6. CloudFront Cache Invalidation with strict exit-code check
    if dist_id:
        print(f"\n[CloudFront] Invalidating edge cache (Distribution: {dist_id})...")
        cmd_inval = [
            "aws", "cloudfront", "create-invalidation",
            "--distribution-id", dist_id,
            "--paths", "/media/*",
        ]
        print("Command:", " ".join(cmd_inval))
        if not dry_run:
            res_inval = subprocess.run(cmd_inval)
            if res_inval.returncode != 0:
                print("Error: CloudFront cache invalidation failed.")
                return False
            print("[OK] CloudFront cache invalidation request submitted successfully.")
    else:
        print("\n[CloudFront] Skipping invalidation (pass --distribution-id to invalidate CDN cache).")

    print("\n[OK] Media deployment completed successfully.")
    return True


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="KidsZone S3 / CloudFront Media Deployer")
    parser.add_argument('--bucket', default=os.getenv('KIDSZONE_S3_BUCKET', 'kidszone-production-media'),
                        help="Target AWS S3 bucket name")
    parser.add_argument('--region', default=os.getenv('AWS_REGION', 'ap-south-1'),
                        help="AWS Region (default: ap-south-1)")
    parser.add_argument('--distribution-id', default=os.getenv('CLOUDFRONT_DISTRIBUTION_ID', None),
                        help="CloudFront Distribution ID for OAC policy and cache invalidation")
    parser.add_argument('--account-id', default=os.getenv('AWS_ACCOUNT_ID', None),
                        help="AWS Account ID for CloudFront SourceArn condition in OAC policy")
    parser.add_argument('--apply-policy', action='store_true',
                        help="Apply OAC bucket policy via aws s3api put-bucket-policy")
    parser.add_argument('--dry-run', action='store_true',
                        help="Preview sync and invalidation commands without executing")

    args = parser.parse_args()
    success = deploy_media(
        bucket_name=args.bucket,
        region=args.region,
        dist_id=args.distribution_id,
        account_id=args.account_id,
        apply_policy=args.apply_policy,
        dry_run=args.dry_run
    )
    sys.exit(0 if success else 1)
