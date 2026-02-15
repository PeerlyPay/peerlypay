#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
P2P_DIR="${ROOT_DIR}/contracts/p2p"

NETWORK="${NETWORK:-testnet}"
TOKEN_CONTRACT_ID="${TOKEN_CONTRACT_ID:-CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA}"

ADMIN_ALIAS="${ADMIN_ALIAS:-admin}"
CREATOR_ALIAS="${CREATOR_ALIAS:-creator}"
FILLER_ALIAS="${FILLER_ALIAS:-filler}"

MAX_DURATION_SECS="${MAX_DURATION_SECS:-2592000}"
FILLER_PAYMENT_TIMEOUT_SECS="${FILLER_PAYMENT_TIMEOUT_SECS:-1800}"

FIAT_CURRENCY_CODE="${FIAT_CURRENCY_CODE:-0}"
PAYMENT_METHOD_CODE="${PAYMENT_METHOD_CODE:-0}"
FROM_CRYPTO="${FROM_CRYPTO:-true}"
AMOUNT="${AMOUNT:-10000000}"
EXCHANGE_RATE="${EXCHANGE_RATE:-1000}"
DURATION_SECS="${DURATION_SECS:-600}"

ARTIFACTS_DIR="${ROOT_DIR}/.artifacts/${NETWORK}"
CONTRACT_ID_FILE="${ARTIFACTS_DIR}/p2p_contract_id.txt"

echo "== Resolve addresses from key aliases =="
ADMIN_ADDR="$(stellar keys address "${ADMIN_ALIAS}")"
CREATOR_ADDR="$(stellar keys address "${CREATOR_ALIAS}")"
FILLER_ADDR="$(stellar keys address "${FILLER_ALIAS}")"

echo "Network: ${NETWORK}"
echo "Admin: ${ADMIN_ADDR}"
echo "Creator: ${CREATOR_ADDR}"
echo "Filler: ${FILLER_ADDR}"
echo "Token contract: ${TOKEN_CONTRACT_ID}"

echo "== Build / install / deploy p2p contract =="
make -C "${P2P_DIR}" contract-build
make -C "${P2P_DIR}" contract-install-p2p NETWORK="${NETWORK}" SOURCE="${ADMIN_ALIAS}"
make -C "${P2P_DIR}" p2p-deploy NETWORK="${NETWORK}" SOURCE="${ADMIN_ALIAS}"

if [[ ! -f "${CONTRACT_ID_FILE}" ]]; then
  echo "Missing contract id file at ${CONTRACT_ID_FILE}"
  exit 1
fi

P2P_CONTRACT_ID="$(cat "${CONTRACT_ID_FILE}")"
echo "P2P contract id: ${P2P_CONTRACT_ID}"

echo "== Initialize p2p contract (admin) =="
make -C "${P2P_DIR}" p2p-init \
  NETWORK="${NETWORK}" \
  SOURCE="${ADMIN_ALIAS}" \
  P2P_CONTRACT_ID="${P2P_CONTRACT_ID}" \
  ADMIN="${ADMIN_ADDR}" \
  DISPUTE_RESOLVER="${ADMIN_ADDR}" \
  PAUSER="${ADMIN_ADDR}" \
  TOKEN_CONTRACT_ID="${TOKEN_CONTRACT_ID}" \
  MAX_DURATION_SECS="${MAX_DURATION_SECS}" \
  FILLER_PAYMENT_TIMEOUT_SECS="${FILLER_PAYMENT_TIMEOUT_SECS}"

echo "== Create order (creator) =="
ORDER_ID_RAW="$(stellar contract invoke \
  --network "${NETWORK}" \
  --source "${CREATOR_ALIAS}" \
  --id "${P2P_CONTRACT_ID}" \
  -- create_order_cli \
  --caller "${CREATOR_ADDR}" \
  --fiat_currency_code "${FIAT_CURRENCY_CODE}" \
  --payment_method_code "${PAYMENT_METHOD_CODE}" \
  --from_crypto "${FROM_CRYPTO}" \
  --amount "${AMOUNT}" \
  --exchange_rate "${EXCHANGE_RATE}" \
  --duration_secs "${DURATION_SECS}")"
ORDER_ID="$(echo "${ORDER_ID_RAW}" | tr -d '"[:space:]')"
echo "Order id: ${ORDER_ID}"

echo "== Take order (filler) =="
stellar contract invoke \
  --network "${NETWORK}" \
  --source "${FILLER_ALIAS}" \
  --id "${P2P_CONTRACT_ID}" \
  -- take_order \
  --caller "${FILLER_ADDR}" \
  --order_id "${ORDER_ID}"

if [[ "${FROM_CRYPTO}" == "true" ]]; then
  SUBMIT_ALIAS="${FILLER_ALIAS}"
  SUBMIT_ADDR="${FILLER_ADDR}"
  CONFIRM_ALIAS="${CREATOR_ALIAS}"
  CONFIRM_ADDR="${CREATOR_ADDR}"
else
  SUBMIT_ALIAS="${CREATOR_ALIAS}"
  SUBMIT_ADDR="${CREATOR_ADDR}"
  CONFIRM_ALIAS="${FILLER_ALIAS}"
  CONFIRM_ADDR="${FILLER_ADDR}"
fi

echo "== Submit fiat payment (${SUBMIT_ALIAS}) =="
stellar contract invoke \
  --network "${NETWORK}" \
  --source "${SUBMIT_ALIAS}" \
  --id "${P2P_CONTRACT_ID}" \
  -- submit_fiat_payment \
  --caller "${SUBMIT_ADDR}" \
  --order_id "${ORDER_ID}"

echo "== Confirm fiat payment (${CONFIRM_ALIAS}) =="
stellar contract invoke \
  --network "${NETWORK}" \
  --source "${CONFIRM_ALIAS}" \
  --id "${P2P_CONTRACT_ID}" \
  -- confirm_fiat_payment \
  --caller "${CONFIRM_ADDR}" \
  --order_id "${ORDER_ID}"

echo "== Final order state =="
stellar contract invoke \
  --network "${NETWORK}" \
  --source "${ADMIN_ALIAS}" \
  --id "${P2P_CONTRACT_ID}" \
  -- get_order \
  --order_id "${ORDER_ID}"

echo "Flow complete. Contract id: ${P2P_CONTRACT_ID}; order id: ${ORDER_ID}"
