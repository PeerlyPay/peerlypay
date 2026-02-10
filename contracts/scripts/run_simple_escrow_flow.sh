#!/usr/bin/env bash
set -euo pipefail

NETWORK="${NETWORK:-testnet}"
TOKEN_CONTRACT_ID="${TOKEN_CONTRACT_ID:-CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA}"

ADMIN_ALIAS="${ADMIN_ALIAS:-admin}"
CONTRACTOR_ALIAS="${CONTRACTOR_ALIAS:-contractor}"
FREELANCER_ALIAS="${FREELANCER_ALIAS:-freelancer}"

AMOUNT="${AMOUNT:-10000000}"
PLATFORM_FEE_BPS="${PLATFORM_FEE_BPS:-100}"
ENGAGEMENT_ID="${ENGAGEMENT_ID:-order_$(date +%s)}"
TITLE="${TITLE:-Escrow order}"
DESCRIPTION="${DESCRIPTION:-Simple single-release test}"
MILESTONE_STATUS="${MILESTONE_STATUS:-Completed}"
MILESTONE_EVIDENCE="${MILESTONE_EVIDENCE:-Delivered test artifact}"

ARTIFACTS_DIR=".artifacts/${NETWORK}"
PAYLOAD_FILE="${ARTIFACTS_DIR}/escrow_init_payload.json"
CONTRACT_ID_FILE="${ARTIFACTS_DIR}/escrow_contract_id.txt"

echo "== Resolve addresses from key aliases =="
ADMIN_ADDR="$(stellar keys address "${ADMIN_ALIAS}")"
CONTRACTOR_ADDR="$(stellar keys address "${CONTRACTOR_ALIAS}")"
FREELANCER_ADDR="$(stellar keys address "${FREELANCER_ALIAS}")"

TW_FEE_ADDR="${TW_FEE_ADDR:-${ADMIN_ADDR}}"

echo "Network: ${NETWORK}"
echo "Admin: ${ADMIN_ADDR}"
echo "Contractor: ${CONTRACTOR_ADDR}"
echo "Freelancer: ${FREELANCER_ADDR}"
echo "Token contract: ${TOKEN_CONTRACT_ID}"

echo "== Build / install / deploy escrow contract =="
make contract-build
make contract-install-escrow NETWORK="${NETWORK}" SOURCE="${ADMIN_ALIAS}"
make escrow-deploy NETWORK="${NETWORK}" SOURCE="${ADMIN_ALIAS}"

if [[ ! -f "${CONTRACT_ID_FILE}" ]]; then
  echo "Missing contract id file at ${CONTRACT_ID_FILE}"
  exit 1
fi

ESCROW_CONTRACT_ID="$(cat "${CONTRACT_ID_FILE}")"
echo "Escrow contract id: ${ESCROW_CONTRACT_ID}"

echo "== Build escrow payload =="
make escrow-build-payload \
  NETWORK="${NETWORK}" \
  ENGAGEMENT_ID="${ENGAGEMENT_ID}" \
  TITLE="${TITLE}" \
  DESCRIPTION="${DESCRIPTION}" \
  AMOUNT="${AMOUNT}" \
  PLATFORM_FEE_BPS="${PLATFORM_FEE_BPS}" \
  TOKEN_CONTRACT_ID="${TOKEN_CONTRACT_ID}" \
  APPROVER="${CONTRACTOR_ADDR}" \
  SERVICE_PROVIDER="${FREELANCER_ADDR}" \
  PLATFORM_ADDRESS="${ADMIN_ADDR}" \
  RELEASE_SIGNER="${CONTRACTOR_ADDR}" \
  DISPUTE_RESOLVER="${ADMIN_ADDR}" \
  RECEIVER="${FREELANCER_ADDR}" \
  MILESTONES_JSON='[{"description":"Deliver work","status":"Pending","evidence":"","approved":false}]'

echo "== Initialize escrow (admin) =="
make escrow-init NETWORK="${NETWORK}" SOURCE="${ADMIN_ALIAS}"

if [[ ! -f "${PAYLOAD_FILE}" ]]; then
  echo "Missing payload file at ${PAYLOAD_FILE}"
  exit 1
fi

EXPECTED_ESCROW="$(python3 -c 'import json,sys; print(json.dumps(json.load(open(sys.argv[1])), separators=(",",":")))' "${PAYLOAD_FILE}")"
EVIDENCE_JSON="$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "${MILESTONE_EVIDENCE}")"

echo "== Fund escrow (contractor) =="
stellar contract invoke \
  --network "${NETWORK}" \
  --source "${CONTRACTOR_ALIAS}" \
  --id "${ESCROW_CONTRACT_ID}" \
  -- fund_escrow \
  --signer "${CONTRACTOR_ADDR}" \
  --expected_escrow "${EXPECTED_ESCROW}" \
  --amount "${AMOUNT}"

echo "== Milestone completed (freelancer) =="
stellar contract invoke \
  --network "${NETWORK}" \
  --source "${FREELANCER_ALIAS}" \
  --id "${ESCROW_CONTRACT_ID}" \
  -- change_milestone_status \
  --milestone_index 0 \
  --new_status "${MILESTONE_STATUS}" \
  --new_evidence "${EVIDENCE_JSON}" \
  --service_provider "${FREELANCER_ADDR}"

echo "== Milestone approved (contractor) =="
stellar contract invoke \
  --network "${NETWORK}" \
  --source "${CONTRACTOR_ALIAS}" \
  --id "${ESCROW_CONTRACT_ID}" \
  -- approve_milestone \
  --milestone_index 0 \
  --approver "${CONTRACTOR_ADDR}"

echo "== Release funds (contractor) =="
stellar contract invoke \
  --network "${NETWORK}" \
  --source "${CONTRACTOR_ALIAS}" \
  --id "${ESCROW_CONTRACT_ID}" \
  -- release_funds \
  --release_signer "${CONTRACTOR_ADDR}" \
  --trustless_work_address "${TW_FEE_ADDR}"

echo "== Final escrow state =="
stellar contract invoke \
  --network "${NETWORK}" \
  --source "${ADMIN_ALIAS}" \
  --id "${ESCROW_CONTRACT_ID}" \
  -- get_escrow

echo "Flow complete. Contract id: ${ESCROW_CONTRACT_ID}"
