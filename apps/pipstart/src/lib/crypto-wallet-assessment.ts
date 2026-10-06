import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoWalletQuizV1: AssessmentDefinition = {
  id: "crypto-wallet-security-quiz",
  version: 1,
  title: "Wallets and Personal Security quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "wallets-and-security",
  moduleId: "wallet-and-personal-security",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
      "https://ethereum.org/security/",
      "https://www.finra.org/investors/investing/investment-products/crypto-assets",
      "https://bitcoin.org/bitcoin.pdf",
      "https://developer.bitcoin.org/devguide/transactions.html",
      "https://developer.bitcoin.org/devguide/wallets.html",
      "https://ethereum.org/en/wallets/",
      "https://bitcoin.org/en/secure-your-wallet",
      "https://www.ledger.com/academy/topics/crypto/types-of-crypto-wallets",
      "https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account",
      "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
      "https://bitcoin.org/en/faq",
      "https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself",
      "https://www.ic3.gov/PSA/2022/PSA220208",
      "https://www.ledger.com/academy/topics/security/what-are-address-poisoning-attacks-in-crypto-and-how-to-avoid-them",
      "https://support.kraken.com/articles/360000672643-how-to-deposit-cryptocurrencies-to-your-kraken-account?mode=consumerapp",
      "https://ethereum.org/guides/how-to-use-a-bridge/",
      "https://ethereum.org/developers/docs/transactions/",
      "https://ethereum.org/developers/docs/standards/tokens/",
      "https://www.ic3.gov/PSA/2025/PSA250226",
      "https://www.ledger.com/academy/cryptos-greatest-weakness-blind-signing-explained",
      "https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device",
      "https://support.metamask.io/stay-safe/safety-in-web3/what-is-a-token-approval/",
      "https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/",
      "https://ethereum.org/en/developers/docs/gas/",
      "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/",
      "https://ethereum.org/en/developers/docs/standards/tokens/erc-721/",
      "https://eips.ethereum.org/EIPS/eip-7702",
      "https://ethereum.org/roadmap/pectra/7702/",
      "https://ethereum.org/roadmap/fusaka/",
      "https://launchpad.ethereum.org/en/faq",
      "https://www.fca.org.uk/investsmart/investing-crypto",
    ],
  },
  questions: [
    {
      id: "crypto-wallet-security-1",
      prompt:
        "Aiko in Kyoto drops her phone, which held her only wallet app, into a lake. Where is her crypto now?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Inside the phone, so it is lost with the phone",
        },
        {
          id: "b",
          label: "Held by the wallet app's company until she proves who she is",
        },
        {
          id: "c",
          label:
            "Still recorded on the blockchain; she can reach it again if she has a working backup of her keys",
        },
        {
          id: "d",
          label:
            "Returned automatically to the address that last sent it to her",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice: Still recorded on the blockchain; she can reach it again if she has a working backup of her keys\n\nA wallet holds keys, not coins; the coins are recorded on the blockchain. With a working recovery-phrase backup she can restore access on a new device. The answer “Held by the wallet app's company until she proves who she is” is tempting, but in self-custody no company holds her keys or can restore them.",
    },
    {
      id: "crypto-wallet-security-2",
      prompt: "What is the defining feature of a custodial wallet?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The wallet can show balances but can never send funds",
        },
        {
          id: "b",
          label: "The private keys are kept offline on a hardware device",
        },
        {
          id: "c",
          label:
            "You hold the private keys and a recovery phrase that only you know",
        },
        {
          id: "d",
          label:
            "A company, such as an exchange, controls the private keys and you reach your balance through an account it runs",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice: A company, such as an exchange, controls the private keys and you reach your balance through an account it runs\n\nCustody is about who controls the keys. The answer “The private keys are kept offline on a hardware device” describes a cold wallet, which can be self-custody, and the answer “The wallet can show balances but can never send funds” describes a watch-only wallet.",
    },
    {
      id: "crypto-wallet-security-3",
      prompt:
        'A stranger shows Marco in Turin a watch-only wallet with a large balance and says he can have it if he first pays a fee to "unlock" it. What is the best reading of this?',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "A fair deal, because the balance is visible on the blockchain",
        },
        {
          id: "b",
          label: "Safe if the wallet app is downloaded from an official store",
        },
        {
          id: "c",
          label: "Safe if the fee is paid in crypto rather than cash",
        },
        {
          id: "d",
          label:
            "A likely scam: viewing an address in a watch-only app does not give Marco signing authority, and paying an unlock fee does not create it.",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice: A likely scam: viewing an address in a watch-only app does not give Marco signing authority, and paying an unlock fee does not create it.\n\nA watch-only arrangement displays public information. The visible balance does not establish Marco's right or ability to spend. Assess authority rather than trusting a screen or an advance-fee request.",
    },
    {
      id: "crypto-wallet-security-4",
      prompt:
        "A BIP-39 word list has 2,048 words, so each word represents 11 bits. A 12-word phrase uses 4 of its bits as a checksum. How many bits of randomness does it carry?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "132",
        },
        {
          id: "b",
          label: "128",
        },
        {
          id: "c",
          label: "144",
        },
        {
          id: "d",
          label: "120",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice: 128\n\n12 × 11 = 132 bits in total, minus 4 checksum bits, leaves 128 bits of randomness. The answer “132” forgets to remove the checksum.",
    },
    {
      id: "crypto-wallet-security-5",
      prompt:
        "Lucy in Liverpool adds an optional BIP-39 passphrase to her wallet and later forgets it. What happens?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The wallet company can reset it after an identity check",
        },
        {
          id: "b",
          label:
            "There is no provider reset; the phrase alone normally derives a different wallet, while the intended wallet needs the exact passphrase or another valid recovery arrangement.",
        },
        {
          id: "c",
          label:
            "Her seed phrase alone still opens the same wallet with all her funds",
        },
        {
          id: "d",
          label: "The wallet shows a hint after three wrong attempts",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice: There is no provider reset; the phrase alone normally derives a different wallet, while the intended wallet needs the exact passphrase or another valid recovery arrangement.\n\nUnder BIP 39, the passphrase participates in seed derivation. A missing passphrase is not repaired by resetting an app password. A documented backup or other valid arrangement may help; the provider cannot simply reset the derivation.",
    },
    {
      id: "crypto-wallet-security-6",
      prompt:
        "A family in Adelaide uses a 2-of-3 multisig wallet and retains its complete descriptor, backup information and recovery procedure. One of the three signing keys is lost. What is the situation?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The funds are lost, because all three keys are needed",
        },
        {
          id: "b",
          label: "The network will issue a replacement key automatically",
        },
        {
          id: "c",
          label: "Anyone who finds the lost key can now move the funds alone",
        },
        {
          id: "d",
          label:
            "The two remaining keys can still sign, so the funds can be moved to a new set-up",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice: The two remaining keys can still sign, so the funds can be moved to a new set-up\n\nUnder the supplied two-of-three policy, the two remaining keys and complete wallet information support recovery and signing. The descriptor and required scripts or metadata must not be forgotten. One key alone does not meet the threshold.",
    },
    {
      id: "crypto-wallet-security-7",
      prompt:
        'Carlos in Córdoba posts that a withdrawal is delayed. An account using his exchange\'s logo replies with a link and asks him to "verify" his wallet by entering his recovery phrase. What should he do?',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Enter the phrase, since the account uses the official logo",
        },
        {
          id: "b",
          label:
            "Ignore it and contact the exchange only through its own app or website; real support never asks for a recovery phrase",
        },
        {
          id: "c",
          label: "Send the phrase by direct message instead of on the website",
        },
        {
          id: "d",
          label: "Enter only the first 12 words of the phrase to be safe",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice: Ignore it and contact the exchange only through its own app or website; real support never asks for a recovery phrase\n\nNo genuine company or support agent ever needs a seed phrase, and logos and profile pictures can be faked. Any part of the phrase helps an attacker, so the answer “Enter only the first 12 words of the phrase to be safe” is also dangerous.",
    },
    {
      id: "crypto-wallet-security-8",
      prompt: "What does a clipboard hijacker do?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Moves your phone number to a new SIM card",
        },
        {
          id: "b",
          label: "Locks your files and demands payment to unlock them",
        },
        {
          id: "c",
          label: "Sends you zero-value transfers from look-alike addresses",
        },
        {
          id: "d",
          label:
            "Replaces a crypto address you copy with the attacker's address, so the pasted address differs from the original",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice: Replaces a crypto address you copy with the attacker's address, so the pasted address differs from the original\n\nA clipper is malware that swaps addresses between copy and paste. The answer “Sends you zero-value transfers from look-alike addresses” describes address poisoning, which needs no malware on your device.",
    },
    {
      id: "crypto-wallet-security-9",
      prompt:
        "What specific weakness makes SMS authentication vulnerable to a SIM-swap attack?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Text messages always arrive too late to be used",
        },
        {
          id: "b",
          label: "SMS codes only work on exchanges, not on email accounts",
        },
        {
          id: "c",
          label:
            "In a SIM swap, a criminal takes over your phone number, so the codes go to them",
        },
        {
          id: "d",
          label:
            "Phone companies are legally required to share codes with third parties",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice: In a SIM swap, a criminal takes over your phone number, so the codes go to them\n\nA phone-number takeover can redirect text codes or account recovery. Phishing-resistant authentication and protected recovery routes address different parts of the problem. An authenticator code can also be phished, so changing the code source alone does not remove every attack.",
    },
    {
      id: "crypto-wallet-security-10",
      prompt:
        "Ayşe in Ankara wants to send a token to a friend's exchange account. Her wallet offers two networks for that token; the friend's deposit page lists only one. What should she do?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Send on the cheaper network, because the token has the same name on both",
        },
        {
          id: "b",
          label: "Send on the network listed on the friend's deposit page",
        },
        {
          id: "c",
          label: "Split the amount between both networks",
        },
        {
          id: "d",
          label:
            "Send on either, because an address that the wallet accepts must be correct",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice: Send on the network listed on the friend's deposit page\n\nThe sender and receiver must use the same network for the same token; a transfer on an unsupported network can be lost. The answer “Send on either, because an address that the wallet accepts must be correct” is the trap: many networks share address formats, so a wallet may accept an address the receiver will never watch.",
    },
    {
      id: "crypto-wallet-security-11",
      prompt:
        'An exchange\'s deposit page for a token shows a deposit address and, in a separate box, a "destination tag". Which statement is correct?',
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The tag is optional and only speeds up the deposit",
        },
        {
          id: "b",
          label: "The tag replaces the address, so only the tag is needed",
        },
        {
          id: "c",
          label:
            "The exchange uses one shared address, and the tag tells it which customer to credit; leaving it out can delay the deposit or make it impossible to retrieve",
        },
        {
          id: "d",
          label: "The tag is only needed when sending from another exchange",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice: The exchange uses one shared address, and the tag tells it which customer to credit; leaving it out can delay the deposit or make it impossible to retrieve\n\nShared-address services rely on the tag or memo to identify the customer. If the receiving page asks for one, it is mandatory, whoever is sending.",
    },
    {
      id: "crypto-wallet-security-12",
      prompt:
        "A recipient requires a 10-unit minimum and a memo. What makes a useful test?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "A valid amount meeting the rules with the exact required memo",
        },
        {
          id: "b",
          label: "Two units without a memo",
        },
        {
          id: "c",
          label: "A different token with the same logo",
        },
        {
          id: "d",
          label: "A screenshot saying sent",
        },
      ],
      correctChoiceIds: ["a"],
      explanation:
        "Correct choice: A valid amount meeting the rules with the exact required memo\n\nA valid amount meeting the rules with the exact required memo. The test must exercise the intended supported crediting process.\n\nTwo units without a memo. Both supplied requirements are missed.\n\nA different token with the same logo. Asset identity must also match.\n\nA screenshot saying sent. Status alone does not establish recipient credit.",
    },
    {
      id: "crypto-wallet-security-13",
      prompt: "After disconnecting a site, what can remain?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A guaranteed refund",
        },
        {
          id: "b",
          label: "An existing token allowance",
        },
        {
          id: "c",
          label: "No authority of any kind",
        },
        {
          id: "d",
          label: "A new private key automatically",
        },
      ],
      correctChoiceIds: ["b"],
      explanation:
        "Correct choice: An existing token allowance\n\nA guaranteed refund. It does not reverse transfers.\n\nAn existing token allowance. Disconnection usually changes the interface connection, not the on-chain permission.\n\nNo authority of any kind. That conclusion requires actual permission review.\n\nA new private key automatically. Disconnection does not generate independent authority.",
    },
    {
      id: "crypto-wallet-security-14",
      prompt: "Which fields are central to a token-approval review?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Only the current token price",
        },
        {
          id: "b",
          label: "Only whether gas is free",
        },
        {
          id: "c",
          label: "Token spender amount and applicable persistence",
        },
        {
          id: "d",
          label: "Only the website colour",
        },
      ],
      correctChoiceIds: ["c"],
      explanation:
        "Correct choice: Token spender amount and applicable persistence\n\nOnly the current token price. Price does not identify spending authority.\n\nOnly whether gas is free. Fee absence does not prove a harmless permission.\n\nToken spender amount and applicable persistence. They describe the authority granted.\n\nOnly the website colour. Visual branding does not define permissions.",
    },
    {
      id: "crypto-wallet-security-15",
      prompt: "Why can adding gas to a compromised address cause another loss?",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Gas always repairs exposed keys",
        },
        {
          id: "b",
          label: "Every network cancels theft after a deposit",
        },
        {
          id: "c",
          label: "A larger deposit proves the owner's identity",
        },
        {
          id: "d",
          label: "An automated sweeper may take the new funds",
        },
      ],
      correctChoiceIds: ["d"],
      explanation:
        "Correct choice: An automated sweeper may take the new funds\n\nGas always repairs exposed keys. Fee funds do not change authority.\n\nEvery network cancels theft after a deposit. No general automatic recovery exists.\n\nA larger deposit proves the owner's identity. Ownership proof does not stop an attacker with usable authority.\n\nAn automated sweeper may take the new funds. Compromised authority can be monitored and used rapidly.",
    },
  ],
};
