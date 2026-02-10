# Escrow Properties

TLDR:&#x20;

* *Single-Release → all milestones must be approved for one payout.*
* *Multi-Release → each milestone unlocks its own payout.*

Below we break down the **core properties** of every escrow, and then highlight the **differences between Single-Release and Multi-Release.**

<figure><img src="https://2074000817-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FDg2e2YCRmNlhCnxxmEb6%2Fuploads%2FEMUedeDC7yxujYlXrIIf%2Fimage.png?alt=media&#x26;token=c82ae6d1-6aa7-4bb8-bb6a-f6c9a243075f" alt=""><figcaption><p>Single Release escrow</p></figcaption></figure>

### Core Structure

* **Escrow ID**\
  The on-chain identifier of the contract (also the deposit address). This is where funds are actually sent and locked.
* **Engagement ID & Title**\
  Configurable strings that help you identify the escrow in your own system — for example, linking it to an invoice, project ID, or marketplace order.
* **Description**\
  Human-readable explanation of the escrow’s purpose. Useful for context in dashboards, audits, or dispute resolution.
* **Roles**\
  Every escrow defines who can act on it:
  * *Approver* → validates milestone completion
  * *Service Provider* → delivers the work
  * *Platform Address* → the platform itself, able to take fees or adjust config before funding
  * *Release Signer* → executes the release of funds
  * *Dispute Resolver* → arbitrates conflicts, can re-route funds
  * *Receiver* → final destination of the funds\
    👉 See Roles for full detail.
* **Amount & Platform Fee**
  * **Single-Release**: the total `amount` to be paid once conditions are met, plus an optional `platformFee` percentage sent to the platform.
  * **Multi-Release**: the total amount is distributed across milestones (each milestone defines its own `amount`). The platform fee still applies globally.
* **Trustline**\
  Defines the token being used (address and decimals). This is how Stellar escrows know which asset to accept. Typically USDC, but any Stellar-issued token is supported.
* **Flags**\
  Internal state markers that describe what’s happening:
  * `disputed` → a party raised a dispute
  * `released` → funds have already been released
  * `resolved` → a dispute has been settled
  * `approved` (Multi-Release only) → milestone has been approved by approver

***

### Milestones

Milestones define *what must be completed to unlock funds.*

* **Single-Release Escrow**
  * You can define **one or many milestones**, but the release is **all-or-nothing**.
  * Funds are only released **once all milestones are approved**.
  * Each milestone tracks:
    * `description` → what’s being delivered
    * `status` → any type of status
    * `approve` → true or false
    * `evidence` (optional) → proof of delivery
* **Multi-Release Escrow**
  * Each milestone has the same properties as the single release, plus its own amount and flags.
  * When a milestone is approved, its funds can be released without waiting for others.
  * Milestones include:
    * `amount` → how much is unlocked upon approval
    * `description` → what’s being delivered
    * `status` → any type of status
    * `flags` → released, disputed, resolved and approve
    * `receiver` → final destination of the funds

This structure allows a project to fund and release in **phases**, not all at once.

<figure><img src="https://2074000817-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FDg2e2YCRmNlhCnxxmEb6%2Fuploads%2FIUSbPB147wFbw7HYS7cG%2FScreenshot%202025-11-04%20at%202.29.59%E2%80%AFPM.png?alt=media&#x26;token=d17fa53f-6530-4ed1-bfe1-11559e5c720e" alt=""><figcaption></figcaption></figure>

***

### Putting It Together

* **Single-Release** = one payout, triggered when *all milestones are approved*.\
  Amount + release & dispute flags live at the **top level** of the escrow.
* **Multi-Release** = multiple payouts, each milestone has its own amount and flags.\
  The total escrowed amount is distributed across milestones.

Both share the same core structure — IDs, roles, description, trustline, and platform fee.\
The difference is:

* **Single-Release** → milestones are “checkpoints” for one big release.
* **Multi-Release** → milestones are “tranches,” each tied to its own release.

***

### 🚀 Next Steps

* Choose [Escrow Type](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/escrow-types)
* Assign [Roles](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/roles-in-trustless-work)
* Follow [Lifecycle Phases](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/escrow-lifecycle)
* Test configs in [deploy in dApp](https://docs.trustlesswork.com/trustless-work/oss-dapps/backoffice)
# Escrow Properties

TLDR:&#x20;

* *Single-Release → all milestones must be approved for one payout.*
* *Multi-Release → each milestone unlocks its own payout.*

Below we break down the **core properties** of every escrow, and then highlight the **differences between Single-Release and Multi-Release.**

<figure><img src="https://2074000817-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FDg2e2YCRmNlhCnxxmEb6%2Fuploads%2FEMUedeDC7yxujYlXrIIf%2Fimage.png?alt=media&#x26;token=c82ae6d1-6aa7-4bb8-bb6a-f6c9a243075f" alt=""><figcaption><p>Single Release escrow</p></figcaption></figure>

### Core Structure

* **Escrow ID**\
  The on-chain identifier of the contract (also the deposit address). This is where funds are actually sent and locked.
* **Engagement ID & Title**\
  Configurable strings that help you identify the escrow in your own system — for example, linking it to an invoice, project ID, or marketplace order.
* **Description**\
  Human-readable explanation of the escrow’s purpose. Useful for context in dashboards, audits, or dispute resolution.
* **Roles**\
  Every escrow defines who can act on it:
  * *Approver* → validates milestone completion
  * *Service Provider* → delivers the work
  * *Platform Address* → the platform itself, able to take fees or adjust config before funding
  * *Release Signer* → executes the release of funds
  * *Dispute Resolver* → arbitrates conflicts, can re-route funds
  * *Receiver* → final destination of the funds\
    👉 See Roles for full detail.
* **Amount & Platform Fee**
  * **Single-Release**: the total `amount` to be paid once conditions are met, plus an optional `platformFee` percentage sent to the platform.
  * **Multi-Release**: the total amount is distributed across milestones (each milestone defines its own `amount`). The platform fee still applies globally.
* **Trustline**\
  Defines the token being used (address and decimals). This is how Stellar escrows know which asset to accept. Typically USDC, but any Stellar-issued token is supported.
* **Flags**\
  Internal state markers that describe what’s happening:
  * `disputed` → a party raised a dispute
  * `released` → funds have already been released
  * `resolved` → a dispute has been settled
  * `approved` (Multi-Release only) → milestone has been approved by approver

***

### Milestones

Milestones define *what must be completed to unlock funds.*

* **Single-Release Escrow**
  * You can define **one or many milestones**, but the release is **all-or-nothing**.
  * Funds are only released **once all milestones are approved**.
  * Each milestone tracks:
    * `description` → what’s being delivered
    * `status` → any type of status
    * `approve` → true or false
    * `evidence` (optional) → proof of delivery
* **Multi-Release Escrow**
  * Each milestone has the same properties as the single release, plus its own amount and flags.
  * When a milestone is approved, its funds can be released without waiting for others.
  * Milestones include:
    * `amount` → how much is unlocked upon approval
    * `description` → what’s being delivered
    * `status` → any type of status
    * `flags` → released, disputed, resolved and approve
    * `receiver` → final destination of the funds

This structure allows a project to fund and release in **phases**, not all at once.

<figure><img src="https://2074000817-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FDg2e2YCRmNlhCnxxmEb6%2Fuploads%2FIUSbPB147wFbw7HYS7cG%2FScreenshot%202025-11-04%20at%202.29.59%E2%80%AFPM.png?alt=media&#x26;token=d17fa53f-6530-4ed1-bfe1-11559e5c720e" alt=""><figcaption></figcaption></figure>

***

### Putting It Together

* **Single-Release** = one payout, triggered when *all milestones are approved*.\
  Amount + release & dispute flags live at the **top level** of the escrow.
* **Multi-Release** = multiple payouts, each milestone has its own amount and flags.\
  The total escrowed amount is distributed across milestones.

Both share the same core structure — IDs, roles, description, trustline, and platform fee.\
The difference is:

* **Single-Release** → milestones are “checkpoints” for one big release.
* **Multi-Release** → milestones are “tranches,” each tied to its own release.

***

### 🚀 Next Steps

* Choose [Escrow Type](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/escrow-types)
* Assign [Roles](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/roles-in-trustless-work)
* Follow [Lifecycle Phases](https://docs.trustlesswork.com/trustless-work/introduction/technology-overview/escrow-lifecycle)
* Test configs in [deploy in dApp](https://docs.trustlesswork.com/trustless-work/oss-dapps/backoffice)
