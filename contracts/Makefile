SHELL := /bin/bash

NETWORK ?= testnet
SOURCE ?= admin
ADMIN_ALIAS ?= admin
CONTRACTOR_ALIAS ?= contractor
FREELANCER_ALIAS ?= freelancer
CREATOR_ALIAS ?= creator
FILLER_ALIAS ?= filler
ASSET_CODE ?= USDC
ASSET_ISSUER ?= GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
P2P_ALIAS ?= p2p
ARS_RATE_BASE ?= 1475

.PHONY: help check-testnet wallets-trustline wallets-trustline-escrow wallets-trustline-p2p wallets-bootstrap wallets-bootstrap-escrow wallets-bootstrap-p2p p2p-wallet-setup escrow-build escrow-install escrow-deploy escrow-build-payload escrow-init escrow-get escrow-flow p2p-build p2p-install p2p-deploy p2p-init p2p-config p2p-create-order p2p-get-order p2p-seed-orders-small p2p-seed-orders p2p-quickstart p2p-flow clean-artifacts

define ensure_wallet
	@if stellar keys address "$(1)" >/dev/null 2>&1; then \
		echo "Alias exists: $(1)"; \
	else \
		echo "Creating alias: $(1)"; \
		stellar keys generate "$(1)" --network "$(NETWORK)"; \
	fi
	@ADDR="$$(stellar keys address "$(1)")"; \
	echo "Funding $$ADDR via Friendbot..."; \
	curl -sSf "https://friendbot.stellar.org?addr=$$ADDR" >/dev/null; \
	echo "Funded: $(1) ($$ADDR)"
endef

define ensure_trustline
	@echo "Creating trustline for $(1): $(ASSET_CODE):$(ASSET_ISSUER)"; \
	stellar tx new change-trust \
		--source-account "$(1)" \
		--line "$(ASSET_CODE):$(ASSET_ISSUER)" \
		--network "$(NETWORK)" >/dev/null; \
	echo "Trustline ready for $(1)"
endef

help:
	@echo "Peerlypay contracts commands"
	@echo
	@echo "Wallet bootstrap (testnet):"
	@echo "  make wallets-bootstrap NETWORK=testnet"
	@echo "  make wallets-bootstrap-escrow NETWORK=testnet"
	@echo "  make wallets-bootstrap-p2p NETWORK=testnet"
	@echo "  make wallets-trustline NETWORK=testnet"
	@echo
	@echo "Escrow:"
	@echo "  make escrow-build"
	@echo "  make escrow-install NETWORK=testnet SOURCE=alice"
	@echo "  make escrow-deploy NETWORK=testnet SOURCE=alice"
	@echo "  make escrow-build-payload NETWORK=testnet ..."
	@echo "  make escrow-init NETWORK=testnet SOURCE=alice"
	@echo "  make escrow-get NETWORK=testnet SOURCE=alice"
	@echo "  make escrow-flow"
	@echo
	@echo "P2P:"
	@echo "  make p2p-build"
	@echo "  make p2p-install NETWORK=testnet SOURCE=admin"
	@echo "  make p2p-deploy NETWORK=testnet SOURCE=admin"
	@echo "  make p2p-init NETWORK=testnet SOURCE=admin ADMIN=G... DISPUTE_RESOLVER=G... PAUSER=G... TOKEN_CONTRACT_ID=C..."
	@echo "  make p2p-config NETWORK=testnet SOURCE=admin"
	@echo "  make p2p-seed-orders-small NETWORK=testnet"
	@echo "  make p2p-seed-orders NETWORK=testnet"
	@echo "  make p2p-wallet-setup NETWORK=testnet"
	@echo "  make p2p-quickstart NETWORK=testnet"
	@echo "  make p2p-flow"

check-testnet:
	@if [[ "$(NETWORK)" != "testnet" ]]; then \
		echo "Friendbot funding is only supported on testnet"; \
		exit 1; \
	fi

wallets-bootstrap: check-testnet
	$(call ensure_wallet,$(ADMIN_ALIAS))
	$(call ensure_wallet,$(CONTRACTOR_ALIAS))
	$(call ensure_wallet,$(FREELANCER_ALIAS))
	$(call ensure_wallet,$(CREATOR_ALIAS))
	$(call ensure_wallet,$(FILLER_ALIAS))
	@$(MAKE) wallets-trustline NETWORK="$(NETWORK)" ASSET_CODE="$(ASSET_CODE)" ASSET_ISSUER="$(ASSET_ISSUER)"

wallets-bootstrap-escrow: check-testnet
	$(call ensure_wallet,$(ADMIN_ALIAS))
	$(call ensure_wallet,$(CONTRACTOR_ALIAS))
	$(call ensure_wallet,$(FREELANCER_ALIAS))
	@$(MAKE) wallets-trustline-escrow NETWORK="$(NETWORK)" ASSET_CODE="$(ASSET_CODE)" ASSET_ISSUER="$(ASSET_ISSUER)"

wallets-bootstrap-p2p: check-testnet
	$(call ensure_wallet,$(ADMIN_ALIAS))
	$(call ensure_wallet,$(CREATOR_ALIAS))
	$(call ensure_wallet,$(FILLER_ALIAS))
	@$(MAKE) wallets-trustline-p2p NETWORK="$(NETWORK)" ASSET_CODE="$(ASSET_CODE)" ASSET_ISSUER="$(ASSET_ISSUER)"

wallets-trustline: check-testnet
	$(call ensure_trustline,$(ADMIN_ALIAS))
	$(call ensure_trustline,$(CONTRACTOR_ALIAS))
	$(call ensure_trustline,$(FREELANCER_ALIAS))
	$(call ensure_trustline,$(CREATOR_ALIAS))
	$(call ensure_trustline,$(FILLER_ALIAS))

wallets-trustline-escrow: check-testnet
	$(call ensure_trustline,$(ADMIN_ALIAS))
	$(call ensure_trustline,$(CONTRACTOR_ALIAS))
	$(call ensure_trustline,$(FREELANCER_ALIAS))

wallets-trustline-p2p: check-testnet
	$(call ensure_trustline,$(ADMIN_ALIAS))
	$(call ensure_trustline,$(CREATOR_ALIAS))
	$(call ensure_trustline,$(FILLER_ALIAS))

escrow-build:
	@$(MAKE) -C contracts/escrow contract-build

escrow-install:
	@$(MAKE) -C contracts/escrow contract-install-escrow

escrow-deploy:
	@$(MAKE) -C contracts/escrow escrow-deploy

escrow-build-payload:
	@$(MAKE) -C contracts/escrow escrow-build-payload

escrow-init:
	@$(MAKE) -C contracts/escrow escrow-init

escrow-get:
	@$(MAKE) -C contracts/escrow escrow-get

escrow-flow:
	@$(MAKE) -C contracts/escrow run-simple-escrow-flow

p2p-build:
	@$(MAKE) -C contracts/p2p contract-build

p2p-install:
	@$(MAKE) -C contracts/p2p contract-install-p2p

p2p-deploy:
	@$(MAKE) -C contracts/p2p p2p-deploy

p2p-init:
	@$(MAKE) -C contracts/p2p p2p-init

p2p-config:
	@$(MAKE) -C contracts/p2p p2p-get-config

p2p-create-order:
	@$(MAKE) -C contracts/p2p p2p-create-order

p2p-get-order:
	@$(MAKE) -C contracts/p2p p2p-get-order

p2p-seed-orders-small:
	@$(MAKE) -C contracts/p2p p2p-seed-orders-small

p2p-seed-orders:
	@$(MAKE) -C contracts/p2p p2p-seed-orders

p2p-wallet-setup: check-testnet
	@$(MAKE) wallets-bootstrap-p2p NETWORK="$(NETWORK)" ASSET_CODE="$(ASSET_CODE)" ASSET_ISSUER="$(ASSET_ISSUER)"

p2p-quickstart: check-testnet
	@$(MAKE) p2p-build NETWORK="$(NETWORK)"
	@$(MAKE) p2p-install NETWORK="$(NETWORK)" SOURCE="$(SOURCE)"
	@$(MAKE) p2p-deploy NETWORK="$(NETWORK)" SOURCE="$(SOURCE)" P2P_ALIAS="$(P2P_ALIAS)"
	@$(MAKE) p2p-init NETWORK="$(NETWORK)" SOURCE="$(SOURCE)" P2P_ALIAS="$(P2P_ALIAS)"
	@$(MAKE) p2p-seed-orders NETWORK="$(NETWORK)" P2P_ALIAS="$(P2P_ALIAS)" ARS_RATE_BASE="$(ARS_RATE_BASE)"

p2p-flow:
	@$(MAKE) -C contracts/p2p run-simple-p2p-flow

clean-artifacts:
	@rm -rf .artifacts
	@echo "Removed .artifacts"
