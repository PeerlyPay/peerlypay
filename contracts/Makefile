SHELL := /bin/bash

NETWORK ?= testnet
SOURCE ?= alice
STELLAR ?= stellar

ARTIFACTS_DIR ?= .artifacts
NETWORK_ARTIFACTS_DIR := $(ARTIFACTS_DIR)/$(NETWORK)

ESCROW_WASM_PATH ?= target/wasm32v1-none/release/escrow.wasm
ESCROW_WASM_HASH_FILE ?= $(NETWORK_ARTIFACTS_DIR)/escrow_wasm_hash.txt
ESCROW_CONTRACT_ID_FILE ?= $(NETWORK_ARTIFACTS_DIR)/escrow_contract_id.txt
ESCROW_PAYLOAD_FILE ?= $(NETWORK_ARTIFACTS_DIR)/escrow_init_payload.json

ENGAGEMENT_ID ?=
TITLE ?=
DESCRIPTION ?=
AMOUNT ?=
PLATFORM_FEE_BPS ?=
TOKEN_CONTRACT_ID ?=
APPROVER ?=
SERVICE_PROVIDER ?=
PLATFORM_ADDRESS ?=
RELEASE_SIGNER ?=
DISPUTE_RESOLVER ?=
RECEIVER ?=
RECEIVER_MEMO ?= 0
MILESTONES_JSON ?=

define require_var
	@if [[ -z "$(${1})" ]]; then \
		echo "Missing required variable: ${1}"; \
		exit 1; \
	fi
endef

.PHONY: help check-tools check-stellar check-python contract-build contract-install-escrow escrow-deploy escrow-build-payload escrow-init escrow-get run-simple-escrow-flow clean-artifacts

help:
	@echo "Peerlypay Stellar escrow commands (2-step deploy + initialize)"
	@echo
	@echo "Core flow:"
	@echo "  make contract-build"
	@echo "  make contract-install-escrow NETWORK=testnet SOURCE=alice"
	@echo "  make escrow-deploy NETWORK=testnet SOURCE=alice"
	@echo "  make escrow-build-payload NETWORK=testnet ..."
	@echo "  make escrow-init NETWORK=testnet SOURCE=alice"
	@echo
	@echo "Helpers:"
	@echo "  make escrow-get NETWORK=testnet SOURCE=alice"
	@echo "  make run-simple-escrow-flow"
	@echo "  make clean-artifacts"

check-tools: check-stellar check-python

check-stellar:
	@command -v $(STELLAR) >/dev/null 2>&1 || (echo "stellar CLI not found" && exit 1)

check-python:
	@command -v python3 >/dev/null 2>&1 || (echo "python3 not found" && exit 1)

contract-build: check-stellar
	@$(STELLAR) contract build
	@if [[ ! -f "$(ESCROW_WASM_PATH)" ]]; then \
		echo "Expected wasm not found at $(ESCROW_WASM_PATH)"; \
		echo "Update ESCROW_WASM_PATH if your output path differs."; \
		exit 1; \
	fi
	@echo "Built wasm: $(ESCROW_WASM_PATH)"

contract-install-escrow: check-stellar
	@mkdir -p "$(NETWORK_ARTIFACTS_DIR)"
	@if [[ ! -f "$(ESCROW_WASM_PATH)" ]]; then \
		echo "Wasm not found at $(ESCROW_WASM_PATH). Run make contract-build first."; \
		exit 1; \
	fi
	@HASH="$$( $(STELLAR) contract install --network "$(NETWORK)" --source "$(SOURCE)" --wasm "$(ESCROW_WASM_PATH)" )"; \
	if [[ -z "$$HASH" ]]; then \
		echo "Failed to obtain wasm hash"; \
		exit 1; \
	fi; \
	echo "$$HASH" | tee "$(ESCROW_WASM_HASH_FILE)" >/dev/null; \
	echo "Installed escrow wasm hash: $$HASH"

escrow-deploy: check-stellar
	@mkdir -p "$(NETWORK_ARTIFACTS_DIR)"
	@WASM_HASH="$${ESCROW_WASM_HASH:-}"; \
	if [[ -z "$$WASM_HASH" && -f "$(ESCROW_WASM_HASH_FILE)" ]]; then \
		WASM_HASH="$$(cat "$(ESCROW_WASM_HASH_FILE)")"; \
	fi; \
	if [[ -z "$$WASM_HASH" ]]; then \
		echo "Missing ESCROW_WASM_HASH and no cached hash file found at $(ESCROW_WASM_HASH_FILE)"; \
		exit 1; \
	fi; \
	CONTRACT_ID="$$( $(STELLAR) contract deploy --network "$(NETWORK)" --source "$(SOURCE)" --wasm-hash "$$WASM_HASH" )"; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Failed to deploy escrow contract"; \
		exit 1; \
	fi; \
	echo "$$CONTRACT_ID" | tee "$(ESCROW_CONTRACT_ID_FILE)" >/dev/null; \
	echo "Deployed escrow contract id: $$CONTRACT_ID"

escrow-build-payload: check-python
	$(call require_var,ENGAGEMENT_ID)
	$(call require_var,TITLE)
	$(call require_var,DESCRIPTION)
	$(call require_var,AMOUNT)
	$(call require_var,PLATFORM_FEE_BPS)
	$(call require_var,TOKEN_CONTRACT_ID)
	$(call require_var,APPROVER)
	$(call require_var,SERVICE_PROVIDER)
	$(call require_var,PLATFORM_ADDRESS)
	$(call require_var,RELEASE_SIGNER)
	$(call require_var,DISPUTE_RESOLVER)
	$(call require_var,RECEIVER)
	@mkdir -p "$(NETWORK_ARTIFACTS_DIR)"
	@python3 scripts/build_escrow_payload.py \
		--engagement-id "$(ENGAGEMENT_ID)" \
		--title "$(TITLE)" \
		--description "$(DESCRIPTION)" \
		--amount "$(AMOUNT)" \
		--platform-fee-bps "$(PLATFORM_FEE_BPS)" \
		--token-contract-id "$(TOKEN_CONTRACT_ID)" \
		--approver "$(APPROVER)" \
		--service-provider "$(SERVICE_PROVIDER)" \
		--platform-address "$(PLATFORM_ADDRESS)" \
		--release-signer "$(RELEASE_SIGNER)" \
		--dispute-resolver "$(DISPUTE_RESOLVER)" \
		--receiver "$(RECEIVER)" \
		--receiver-memo "$(RECEIVER_MEMO)" \
		--milestones-json '$(MILESTONES_JSON)' \
		--output "$(ESCROW_PAYLOAD_FILE)"
	@echo "Wrote payload: $(ESCROW_PAYLOAD_FILE)"

escrow-init: check-tools
	@CONTRACT_ID="$${ESCROW_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(ESCROW_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(ESCROW_CONTRACT_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Missing ESCROW_CONTRACT_ID and no cached contract id at $(ESCROW_CONTRACT_ID_FILE)"; \
		exit 1; \
	fi; \
	if [[ ! -f "$(ESCROW_PAYLOAD_FILE)" ]]; then \
		echo "Missing payload file $(ESCROW_PAYLOAD_FILE). Run make escrow-build-payload first."; \
		exit 1; \
	fi; \
	PAYLOAD="$$(python3 -c 'import json,sys; print(json.dumps(json.load(open(sys.argv[1])), separators=(",",":")))' "$(ESCROW_PAYLOAD_FILE)")"; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- initialize_escrow --escrow_properties "$$PAYLOAD"

escrow-get: check-stellar
	@CONTRACT_ID="$${ESCROW_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(ESCROW_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(ESCROW_CONTRACT_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Missing ESCROW_CONTRACT_ID and no cached contract id at $(ESCROW_CONTRACT_ID_FILE)"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- get_escrow

run-simple-escrow-flow: check-tools
	@./scripts/run_simple_escrow_flow.sh

clean-artifacts:
	@rm -rf "$(ARTIFACTS_DIR)"
	@echo "Removed $(ARTIFACTS_DIR)"
