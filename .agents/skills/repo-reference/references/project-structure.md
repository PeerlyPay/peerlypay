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
          order.rs (209 lines)
        events/
          handler.rs (83 lines)
        storage/
          types.rs (96 lines)
        contract.rs (243 lines)
        error.rs (56 lines)
        lib.rs (32 lines)
      Cargo.toml (16 lines)
      Makefile (315 lines)
  Cargo.toml (24 lines)
  Makefile (175 lines)
  README.md (510 lines)
src/
  app/
    api/
      match-order/
        route.ts (161 lines)
    marketplace/
      MarketplaceContent.tsx (315 lines)
      page.tsx (32 lines)
    orders/
      [id]/
        ChatBox.tsx (110 lines)
        EscrowStepper.tsx (81 lines)
        OrderDetailClient.tsx (518 lines)
        page.tsx (10 lines)
      create/
        CreateOrderClient.tsx (79 lines)
        CreateOrderForm.tsx (278 lines)
        OrderTypeSelector.tsx (38 lines)
        page.tsx (10 lines)
      dashboard/
        page.tsx (175 lines)
      mine/
        page.tsx (169 lines)
      page.tsx (1034 lines)
    profile/
      page.tsx (247 lines)
    trade/
      confirm/
        page.tsx (204 lines)
      enable-usdc/
        page.tsx (238 lines)
      payment/
        page.tsx (177 lines)
      success/
        page.tsx (325 lines)
      waiting/
        page.tsx (313 lines)
      page.tsx (18 lines)
    globals.css (485 lines)
    layout.tsx (33 lines)
    manifest.ts (36 lines)
    page.tsx (22 lines)
    providers.tsx (48 lines)
  components/
    icons/
      ConfirmTradeIcon.tsx (12 lines)
    profile/
      EditProfileDrawer.tsx (158 lines)
      ProfileAvatarModal.tsx (48 lines)
      ShareProfileDrawer.tsx (137 lines)
    trade/
      TradeChatDrawer.tsx (141 lines)
    BalanceCard.tsx (42 lines)
    BottomCTA.tsx (27 lines)
    BottomNav.tsx (44 lines)
    CompactEscrowStepper.tsx (329 lines)
    DepositModal.tsx (151 lines)
    EmptyState.tsx (36 lines)
    FadeIn.tsx (18 lines)
    FilterTabs.tsx (58 lines)
    Header.tsx (29 lines)
    HowItWorks.tsx (54 lines)
    LayoutShell.tsx (35 lines)
    MiniProgressBar.tsx (79 lines)
    OrderCard.tsx (107 lines)
    OrderCardSkeleton.tsx (33 lines)
    OrderDetailCard.tsx (103 lines)
    OrderHistoryCard.tsx (253 lines)
    QuickActions.tsx (89 lines)
    QuickTradeInput.tsx (396 lines)
    RecentActivity.tsx (49 lines)
    RecentTransactions.tsx (93 lines)
    SendModal.tsx (206 lines)
    StatsCards.tsx (86 lines)
    TradeDrawer.tsx (29 lines)
    WalletButton.tsx (253 lines)
    WalletConnection.tsx (261 lines)
    WalletModal.tsx (185 lines)
  contexts/
    TradeHistoryContext.tsx (81 lines)
    UserContext.tsx (52 lines)
  types/
    index.ts (157 lines)
    user.ts (5 lines)
.env.example (4 lines)
AGENTS.md (166 lines)
package.json (46 lines)
README.md (168 lines)
```