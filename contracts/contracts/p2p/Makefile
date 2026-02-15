SHELL := /bin/bash

NETWORK ?= testnet
SOURCE ?= admin
STELLAR ?= stellar

ARTIFACTS_DIR ?= ../../.artifacts
NETWORK_ARTIFACTS_DIR := $(ARTIFACTS_DIR)/$(NETWORK)

P2P_WASM_PATH ?= ../../target/wasm32v1-none/release/p2p.wasm
P2P_WASM_HASH_FILE ?= $(NETWORK_ARTIFACTS_DIR)/p2p_wasm_hash.txt
P2P_CONTRACT_ID_FILE ?= $(NETWORK_ARTIFACTS_DIR)/p2p_contract_id.txt
P2P_LAST_ORDER_ID_FILE ?= $(NETWORK_ARTIFACTS_DIR)/p2p_last_order_id.txt

ADMIN ?=
DISPUTE_RESOLVER ?=
PAUSER ?=
TOKEN_CONTRACT_ID ?=
MAX_DURATION_SECS ?= 2592000
FILLER_PAYMENT_TIMEOUT_SECS ?= 1800

CREATOR ?=
FIAT_CURRENCY_CODE ?=0
PAYMENT_METHOD_CODE ?=0
FROM_CRYPTO ?=true
AMOUNT ?=10000000
EXCHANGE_RATE ?=1000
DURATION_SECS ?=600

ORDER_ID ?=
FILLER ?=
CALLER ?=
FIAT_TRANSFER_CONFIRMED ?=true

ADMIN_ALIAS ?= admin
CREATOR_ALIAS ?= creator
FILLER_ALIAS ?= filler

define require_var
	@if [[ -z "$(${1})" ]]; then \
		echo "Missing required variable: ${1}"; \
		exit 1; \
	fi
endef

define require_alias
	@if ! $(STELLAR) keys address "${1}" >/dev/null 2>&1; then \
		echo "Missing Stellar key alias: ${1}"; \
		echo "Create it: make wallets-bootstrap NETWORK=$(NETWORK)"; \
		echo "Or manually: stellar keys generate --global ${1} --network $(NETWORK)"; \
		exit 1; \
	fi
endef

.PHONY: help check-stellar check-wallets-p2p contract-build contract-install-p2p p2p-deploy p2p-init p2p-get-config p2p-create-order p2p-get-order p2p-take-order p2p-submit-fiat-payment p2p-confirm-fiat-payment p2p-dispute p2p-resolve run-simple-p2p-flow clean-artifacts

help:
	@echo "P2P contract commands"
	@echo
	@echo "Core flow:"
	@echo "  make contract-build"
	@echo "  make contract-install-p2p NETWORK=testnet SOURCE=admin"
	@echo "  make p2p-deploy NETWORK=testnet SOURCE=admin"
	@echo "  make p2p-init NETWORK=testnet SOURCE=admin ADMIN=G... DISPUTE_RESOLVER=G... PAUSER=G... TOKEN_CONTRACT_ID=C..."
	@echo "  make p2p-get-config NETWORK=testnet SOURCE=admin"
	@echo
	@echo "Order helpers:"
	@echo "  make p2p-create-order NETWORK=testnet SOURCE=creator CREATOR=G... FIAT_CURRENCY_CODE=0 PAYMENT_METHOD_CODE=0"
	@echo "  make p2p-get-order NETWORK=testnet SOURCE=admin ORDER_ID=0"
	@echo "  make run-simple-p2p-flow"

check-stellar:
	@command -v $(STELLAR) >/dev/null 2>&1 || (echo "stellar CLI not found" && exit 1)

check-wallets-p2p: check-stellar
	$(call require_alias,$(ADMIN_ALIAS))
	$(call require_alias,$(CREATOR_ALIAS))
	$(call require_alias,$(FILLER_ALIAS))

contract-build: check-stellar
	@$(STELLAR) contract build
	@if [[ ! -f "$(P2P_WASM_PATH)" ]]; then \
		echo "Expected wasm not found at $(P2P_WASM_PATH)"; \
		echo "Update P2P_WASM_PATH if your output path differs."; \
		exit 1; \
	fi
	@echo "Built wasm: $(P2P_WASM_PATH)"

contract-install-p2p: check-stellar
	@mkdir -p "$(NETWORK_ARTIFACTS_DIR)"
	@if [[ ! -f "$(P2P_WASM_PATH)" ]]; then \
		echo "Wasm not found at $(P2P_WASM_PATH). Run make contract-build first."; \
		exit 1; \
	fi
	@HASH="$$( $(STELLAR) contract install --network "$(NETWORK)" --source "$(SOURCE)" --wasm "$(P2P_WASM_PATH)" )"; \
	if [[ -z "$$HASH" ]]; then \
		echo "Failed to obtain wasm hash"; \
		exit 1; \
	fi; \
	echo "$$HASH" | tee "$(P2P_WASM_HASH_FILE)" >/dev/null; \
	echo "Installed p2p wasm hash: $$HASH"

p2p-deploy: check-stellar
	@mkdir -p "$(NETWORK_ARTIFACTS_DIR)"
	@WASM_HASH="$${P2P_WASM_HASH:-}"; \
	if [[ -z "$$WASM_HASH" && -f "$(P2P_WASM_HASH_FILE)" ]]; then \
		WASM_HASH="$$(cat "$(P2P_WASM_HASH_FILE)")"; \
	fi; \
	if [[ -z "$$WASM_HASH" ]]; then \
		echo "Missing P2P_WASM_HASH and no cached hash file found at $(P2P_WASM_HASH_FILE)"; \
		exit 1; \
	fi; \
	CONTRACT_ID="$$( $(STELLAR) contract deploy --network "$(NETWORK)" --source "$(SOURCE)" --wasm-hash "$$WASM_HASH" )"; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Failed to deploy p2p contract"; \
		exit 1; \
	fi; \
	echo "$$CONTRACT_ID" | tee "$(P2P_CONTRACT_ID_FILE)" >/dev/null; \
	echo "Deployed p2p contract id: $$CONTRACT_ID"

p2p-init: check-stellar
	$(call require_var,ADMIN)
	$(call require_var,DISPUTE_RESOLVER)
	$(call require_var,PAUSER)
	$(call require_var,TOKEN_CONTRACT_ID)
	@CONTRACT_ID="$${P2P_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(P2P_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(P2P_CONTRACT_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Missing P2P_CONTRACT_ID and no cached contract id at $(P2P_CONTRACT_ID_FILE)"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- initialize --admin "$(ADMIN)" --dispute_resolver "$(DISPUTE_RESOLVER)" --pauser "$(PAUSER)" --token "$(TOKEN_CONTRACT_ID)" --max_duration_secs "$(MAX_DURATION_SECS)" --filler_payment_timeout_secs "$(FILLER_PAYMENT_TIMEOUT_SECS)"

p2p-get-config: check-stellar
	@CONTRACT_ID="$${P2P_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(P2P_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(P2P_CONTRACT_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Missing P2P_CONTRACT_ID and no cached contract id at $(P2P_CONTRACT_ID_FILE)"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- get_config

p2p-create-order: check-stellar
	$(call require_var,CREATOR)
	@mkdir -p "$(NETWORK_ARTIFACTS_DIR)"
	@CONTRACT_ID="$${P2P_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(P2P_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(P2P_CONTRACT_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Missing P2P_CONTRACT_ID and no cached contract id at $(P2P_CONTRACT_ID_FILE)"; \
		exit 1; \
	fi; \
	ORDER_ID_RAW="$$( $(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- create_order_cli --caller "$(CREATOR)" --fiat_currency_code "$(FIAT_CURRENCY_CODE)" --payment_method_code "$(PAYMENT_METHOD_CODE)" --from_crypto "$(FROM_CRYPTO)" --amount "$(AMOUNT)" --exchange_rate "$(EXCHANGE_RATE)" --duration_secs "$(DURATION_SECS)" )"; \
	ORDER_ID="$$(echo "$$ORDER_ID_RAW" | tr -d '"[:space:]')"; \
	echo "$$ORDER_ID" | tee "$(P2P_LAST_ORDER_ID_FILE)" >/dev/null; \
	echo "Created order id: $$ORDER_ID"

p2p-get-order: check-stellar
	@CONTRACT_ID="$${P2P_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(P2P_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(P2P_CONTRACT_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Missing P2P_CONTRACT_ID and no cached contract id at $(P2P_CONTRACT_ID_FILE)"; \
		exit 1; \
	fi; \
	ORDER="$${ORDER_ID:-}"; \
	if [[ -z "$$ORDER" && -f "$(P2P_LAST_ORDER_ID_FILE)" ]]; then \
		ORDER="$$(cat "$(P2P_LAST_ORDER_ID_FILE)")"; \
	fi; \
	if [[ -z "$$ORDER" ]]; then \
		echo "Missing ORDER_ID and no cached order id at $(P2P_LAST_ORDER_ID_FILE)"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- get_order --order_id "$$ORDER"

p2p-take-order: check-stellar
	$(call require_var,FILLER)
	@CONTRACT_ID="$${P2P_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(P2P_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(P2P_CONTRACT_ID_FILE)")"; \
	fi; \
	ORDER="$${ORDER_ID:-}"; \
	if [[ -z "$$ORDER" && -f "$(P2P_LAST_ORDER_ID_FILE)" ]]; then \
		ORDER="$$(cat "$(P2P_LAST_ORDER_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" || -z "$$ORDER" ]]; then \
		echo "Missing P2P_CONTRACT_ID or ORDER_ID"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- take_order --caller "$(FILLER)" --order_id "$$ORDER"

p2p-submit-fiat-payment: check-stellar
	$(call require_var,CALLER)
	@CONTRACT_ID="$${P2P_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(P2P_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(P2P_CONTRACT_ID_FILE)")"; \
	fi; \
	ORDER="$${ORDER_ID:-}"; \
	if [[ -z "$$ORDER" && -f "$(P2P_LAST_ORDER_ID_FILE)" ]]; then \
		ORDER="$$(cat "$(P2P_LAST_ORDER_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" || -z "$$ORDER" ]]; then \
		echo "Missing P2P_CONTRACT_ID or ORDER_ID"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- submit_fiat_payment --caller "$(CALLER)" --order_id "$$ORDER"

p2p-confirm-fiat-payment: check-stellar
	$(call require_var,CALLER)
	@CONTRACT_ID="$${P2P_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(P2P_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(P2P_CONTRACT_ID_FILE)")"; \
	fi; \
	ORDER="$${ORDER_ID:-}"; \
	if [[ -z "$$ORDER" && -f "$(P2P_LAST_ORDER_ID_FILE)" ]]; then \
		ORDER="$$(cat "$(P2P_LAST_ORDER_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" || -z "$$ORDER" ]]; then \
		echo "Missing P2P_CONTRACT_ID or ORDER_ID"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- confirm_fiat_payment --caller "$(CALLER)" --order_id "$$ORDER"

p2p-dispute: check-stellar
	$(call require_var,CALLER)
	@CONTRACT_ID="$${P2P_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(P2P_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(P2P_CONTRACT_ID_FILE)")"; \
	fi; \
	ORDER="$${ORDER_ID:-}"; \
	if [[ -z "$$ORDER" && -f "$(P2P_LAST_ORDER_ID_FILE)" ]]; then \
		ORDER="$$(cat "$(P2P_LAST_ORDER_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" || -z "$$ORDER" ]]; then \
		echo "Missing P2P_CONTRACT_ID or ORDER_ID"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- dispute_fiat_payment --caller "$(CALLER)" --order_id "$$ORDER"

p2p-resolve: check-stellar
	$(call require_var,CALLER)
	@CONTRACT_ID="$${P2P_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(P2P_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(P2P_CONTRACT_ID_FILE)")"; \
	fi; \
	ORDER="$${ORDER_ID:-}"; \
	if [[ -z "$$ORDER" && -f "$(P2P_LAST_ORDER_ID_FILE)" ]]; then \
		ORDER="$$(cat "$(P2P_LAST_ORDER_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" || -z "$$ORDER" ]]; then \
		echo "Missing P2P_CONTRACT_ID or ORDER_ID"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- resolve_dispute --caller "$(CALLER)" --order_id "$$ORDER" --fiat_transfer_confirmed "$(FIAT_TRANSFER_CONFIRMED)"

run-simple-p2p-flow: check-stellar check-wallets-p2p
	@../../scripts/run_simple_p2p_flow.sh

clean-artifacts:
	@rm -rf "$(ARTIFACTS_DIR)"
	@echo "Removed $(ARTIFACTS_DIR)"
