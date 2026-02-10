# Directory Structure

```
app/
  create-order/
    CreateOrderClient.tsx (36 lines)
    page.tsx (10 lines)
  my-orders/
    page.tsx (157 lines)
  orders/
    [id]/
      OrderDetailClient.tsx (522 lines)
      page.tsx (10 lines)
    page.tsx (95 lines)
  profile/
    page.tsx (45 lines)
  globals.css (334 lines)
  layout.tsx (36 lines)
  page.tsx (53 lines)
components/
  ui/
    alert.tsx (66 lines)
    button.tsx (64 lines)
    card.tsx (92 lines)
    dropdown-menu.tsx (257 lines)
    input.tsx (21 lines)
    label.tsx (24 lines)
    select.tsx (190 lines)
    separator.tsx (28 lines)
    sheet.tsx (123 lines)
    skeleton.tsx (16 lines)
    sonner.tsx (40 lines)
  BalanceCard.tsx (58 lines)
  BottomCTA.tsx (27 lines)
  BottomNav.tsx (59 lines)
  ChatBox.tsx (112 lines)
  CreateOrderForm.tsx (283 lines)
  EmptyState.tsx (31 lines)
  EscrowStepper.tsx (81 lines)
  FadeIn.tsx (18 lines)
  Header.tsx (96 lines)
  OrderCard.tsx (106 lines)
  OrderCardSkeleton.tsx (33 lines)
  OrderTypeSelector.tsx (38 lines)
  QuickActions.tsx (34 lines)
contracts/
  .stellar/
    contract-ids/
      escrow.json (1 lines)
  contracts/
    escrow/
      src/
        core/
          validators/
            dispute.rs (72 lines)
            escrow.rs (192 lines)
            milestone.rs (47 lines)
          dispute.rs (94 lines)
          escrow.rs (148 lines)
          milestone.rs (75 lines)
        events/
          handler.rs (63 lines)
        modules/
          fee/
            calculator.rs (51 lines)
          math/
            basic.rs (18 lines)
            safe.rs (17 lines)
        storage/
          types.rs (65 lines)
        contract.rs (199 lines)
        error.rs (183 lines)
        lib.rs (46 lines)
      Cargo.toml (16 lines)
  Cargo.toml (24 lines)
  CONTRIBUTORS_GUIDELINE.md (69 lines)
  GIT_GUIDELINE.md (56 lines)
  README.md (243 lines)
types/
  index.ts (39 lines)
package.json (40 lines)
README.md (109 lines)
```