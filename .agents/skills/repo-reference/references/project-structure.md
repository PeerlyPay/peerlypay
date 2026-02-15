# Directory Structure

```
contracts/
  contracts/
    p2p/
      src/
        core/
          validators/
            admin.rs (39 lines)
            dispute.rs (18 lines)
            order.rs (77 lines)
          admin.rs (88 lines)
          dispute.rs (79 lines)
          order.rs (205 lines)
        events/
          handler.rs (81 lines)
        storage/
          types.rs (72 lines)
        contract.rs (200 lines)
        error.rs (56 lines)
        lib.rs (32 lines)
      Cargo.toml (16 lines)
      Makefile (249 lines)
  Cargo.toml (24 lines)
  Makefile (72 lines)
  README.md (388 lines)
src/
  app/
    api/
      match-order/
        route.ts (136 lines)
    marketplace/
      MarketplaceContent.tsx (315 lines)
      page.tsx (32 lines)
    orders/
      [id]/
        ChatBox.tsx (110 lines)
        EscrowStepper.tsx (81 lines)
        OrderDetailClient.tsx (509 lines)
        page.tsx (10 lines)
      create/
        CreateOrderClient.tsx (79 lines)
        CreateOrderForm.tsx (268 lines)
        OrderTypeSelector.tsx (38 lines)
        page.tsx (10 lines)
      mine/
        page.tsx (161 lines)
      page.tsx (1024 lines)
    pro/
      page.tsx (38 lines)
    profile/
      page.tsx (246 lines)
    trade/
      confirm/
        page.tsx (160 lines)
      enable-usdc/
        page.tsx (235 lines)
      payment/
        page.tsx (144 lines)
      success/
        page.tsx (407 lines)
      waiting/
        page.tsx (175 lines)
      page.tsx (7 lines)
    globals.css (446 lines)
    layout.tsx (33 lines)
    page.tsx (22 lines)
    providers.tsx (35 lines)
  components/
    icons/
      ConfirmTradeIcon.tsx (12 lines)
    profile/
      EditProfileDrawer.tsx (158 lines)
      ProfileAvatarModal.tsx (48 lines)
      ShareProfileDrawer.tsx (137 lines)
    ui/
      alert.tsx (66 lines)
      badge.tsx (42 lines)
      button.tsx (64 lines)
      card.tsx (92 lines)
      collapsible.tsx (33 lines)
      drawer.tsx (131 lines)
      dropdown-menu.tsx (257 lines)
      input.tsx (21 lines)
      label.tsx (24 lines)
      select.tsx (190 lines)
      separator.tsx (28 lines)
      sheet.tsx (123 lines)
      skeleton.tsx (16 lines)
      sonner.tsx (40 lines)
    BalanceCard.tsx (40 lines)
    BottomCTA.tsx (27 lines)
    BottomNav.tsx (44 lines)
    CompactEscrowStepper.tsx (329 lines)
    DepositModal.tsx (150 lines)
    EmptyState.tsx (36 lines)
    FadeIn.tsx (18 lines)
    FilterTabs.tsx (58 lines)
    Header.tsx (29 lines)
    HowItWorks.tsx (54 lines)
    LayoutShell.tsx (27 lines)
    MiniProgressBar.tsx (79 lines)
    OrderCard.tsx (106 lines)
    OrderCardSkeleton.tsx (33 lines)
    OrderDetailCard.tsx (102 lines)
    OrderHistoryCard.tsx (253 lines)
    QuickActions.tsx (102 lines)
    QuickTradeInput.tsx (373 lines)
    RecentActivity.tsx (49 lines)
    RecentTransactions.tsx (90 lines)
    SendModal.tsx (206 lines)
    StatsCards.tsx (86 lines)
    TradeDrawer.tsx (29 lines)
    WalletButton.tsx (232 lines)
    WalletConnection.tsx (261 lines)
    WalletModal.tsx (185 lines)
  contexts/
    BalanceContext.tsx (84 lines)
    TradeHistoryContext.tsx (80 lines)
    UserContext.tsx (52 lines)
  types/
    index.ts (101 lines)
    user.ts (5 lines)
AGENTS.md (150 lines)
env.example (1 lines)
package.json (44 lines)
README.md (154 lines)
```