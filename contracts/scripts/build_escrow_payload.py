#!/usr/bin/env python3

import argparse
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build initialize_escrow payload JSON for CLI usage"
    )
    parser.add_argument("--engagement-id", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--description", required=True)
    parser.add_argument("--amount", required=True, type=int)
    parser.add_argument("--platform-fee-bps", required=True, type=int)
    parser.add_argument("--token-contract-id", required=True)
    parser.add_argument("--approver", required=True)
    parser.add_argument("--service-provider", required=True)
    parser.add_argument("--platform-address", required=True)
    parser.add_argument("--release-signer", required=True)
    parser.add_argument("--dispute-resolver", required=True)
    parser.add_argument("--receiver", required=True)
    parser.add_argument("--receiver-memo", default=0, type=int)
    parser.add_argument("--milestones-json", default="")
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def parse_milestones(milestones_json: str) -> list[dict]:
    if milestones_json.strip() == "":
        return [
            {
                "description": "Default milestone",
                "status": "Pending",
                "evidence": "",
                "approved": False,
            }
        ]

    milestones = json.loads(milestones_json)
    if not isinstance(milestones, list) or len(milestones) == 0:
        raise ValueError("milestones-json must be a non-empty JSON array")

    for milestone in milestones:
        if not isinstance(milestone, dict):
            raise ValueError("Each milestone must be a JSON object")
        if "description" not in milestone:
            raise ValueError("Milestone is missing description")
        if "status" not in milestone:
            raise ValueError("Milestone is missing status")
        if "evidence" not in milestone:
            milestone["evidence"] = ""
        if "approved" not in milestone:
            milestone["approved"] = False
        if milestone["approved"]:
            raise ValueError("Milestone approved must be false on initialization")
    return milestones


def validate(args: argparse.Namespace, milestones: list[dict]) -> None:
    if args.amount < 0:
        raise ValueError("amount must be >= 0")
    if args.platform_fee_bps < 0:
        raise ValueError("platform-fee-bps must be >= 0")
    if args.platform_fee_bps + 30 > 10_000:
        raise ValueError("platform-fee-bps + trustless-work fee exceeds 10000 bps")
    if len(milestones) > 50:
        raise ValueError("maximum 50 milestones are allowed")


def build_payload(args: argparse.Namespace, milestones: list[dict]) -> dict:
    return {
        "engagement_id": args.engagement_id,
        "title": args.title,
        "description": args.description,
        "roles": {
            "approver": args.approver,
            "service_provider": args.service_provider,
            "platform_address": args.platform_address,
            "release_signer": args.release_signer,
            "dispute_resolver": args.dispute_resolver,
            "receiver": args.receiver,
        },
        "amount": str(args.amount),
        "platform_fee": args.platform_fee_bps,
        "milestones": milestones,
        "flags": {
            "disputed": False,
            "released": False,
            "resolved": False,
        },
        "trustline": {
            "address": args.token_contract_id,
        },
        "receiver_memo": str(args.receiver_memo),
    }


def main() -> None:
    args = parse_args()
    milestones = parse_milestones(args.milestones_json)
    validate(args, milestones)
    payload = build_payload(args, milestones)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
