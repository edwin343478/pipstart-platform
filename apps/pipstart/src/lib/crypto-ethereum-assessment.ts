import "server-only";
import type { AssessmentDefinition } from "./assessment";
export const cryptoEthereumQuizV1: AssessmentDefinition = {
  id: "crypto-ethereum-networks-quiz",
  version: 1,
  title: "Ethereum Contracts and Connected Networks quiz",
  scope: "module",
  learningPath: "crypto",
  courseId: "crypto-ethereum-and-networks",
  moduleId: "ethereum-contracts-and-connected-networks",
  passingPercentage: 80,
  retakeCooldownSeconds: 3,
  status: "published",
  governance: {
    author: "PipStart Curriculum Team",
    reviewer: "PipStart Course Owner",
    reviewedAt: "2026-10-05",
    nextReviewAt: "2027-04-05",
    sources: [
      "https://ethereum.org/ethereum-history-founder-and-ownership/",
      "https://ethereum.org/whitepaper/",
      "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
      "https://ethereum.org/roadmap/merge/",
      "https://ethereum.org/gas/",
      "https://ethereum.org/staking/pools/",
      "https://ethereum.org/en/history/",
      "https://ethereum.org/en/whitepaper/",
      "https://ethereum.org/en/smart-contracts/",
      "https://eips.ethereum.org/EIPS/eip-7702",
      "https://ethereum.org/roadmap/pectra/7702/",
      "https://ethereum.org/roadmap/fusaka/",
      "https://launchpad.ethereum.org/en/faq",
      "https://ethereum.org/developers/docs/transactions/",
      "https://csrc.nist.gov/pubs/ir/8202/final",
      "https://chain.link/education/blockchain-oracles",
      "https://ethereum.org/security/",
      "https://ethereum.org/en/developers/docs/gas/",
      "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/",
      "https://ethereum.org/en/developers/docs/standards/tokens/erc-721/",
      "https://ethereum.org/developers/docs/standards/tokens/",
      "https://ethereum.org/bridges/",
      "https://ethereum.org/guides/how-to-use-a-bridge/",
      "https://www.circle.com/legal/usdc-terms",
      "https://www.finra.org/investors/investing/investment-products/crypto-assets",
      "https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/",
      "https://ethereum.org/en/developers/docs/scaling/zk-rollups/",
      "https://ethereum.org/en/developers/docs/scaling/sidechains/",
      "https://ethereum.org/layer-2/",
    ],
  },
  questions: [
    {
      id: "crypto-ethereum-networks-1",
      prompt:
        'A friend says, "Ethereum and ether are the same thing." Which reply is most accurate?',
      explanation:
        "Correct choice: Ethereum is the network; ether (ETH) is its own currency, used for fees and staking.\n\nEthereum is the shared network and its record, while ether is the currency that pays for gas and is staked by validators. The answer “Ether is the network; Ethereum is a token that runs on it” reverses the two, and Ethereum has no company owner.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: 'They are the same; "ether" is the older name for Ethereum.',
        },
        {
          id: "b",
          label: "Ether is the network; Ethereum is a token that runs on it.",
        },
        {
          id: "c",
          label:
            "Ethereum is the network; ether (ETH) is its own currency, used for fees and staking.",
        },
        {
          id: "d",
          label:
            "Ethereum is a company, and ether is the share it issues to investors.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-ethereum-networks-2",
      prompt:
        "What happened to Ethereum after The DAO was exploited in June 2016?",
      explanation:
        "Correct choice: A hard fork in July 2016 moved the affected ether to a recovery contract, and the original unforked chain continued as Ethereum Classic.\n\nMost of the community chose a hard fork to return the funds, while those who rejected rewriting the record kept running the original chain as Ethereum Classic. The answer “Validators slashed the attacker's stake and returned the funds automatically” is wrong because Ethereum used proof of work in 2016, with no validators to slash.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Validators slashed the attacker's stake and returned the funds automatically.",
        },
        {
          id: "b",
          label:
            "A hard fork in July 2016 moved the affected ether to a recovery contract, and the original unforked chain continued as Ethereum Classic.",
        },
        {
          id: "c",
          label:
            "The attacker's transactions were reversed by the Ethereum Foundation without any change to the rules.",
        },
        {
          id: "d",
          label:
            "Nothing changed; the community accepted the loss and kept one chain.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-ethereum-networks-3",
      prompt:
        "A block explorer shows a value of 500,000,000,000,000,000 wei (an invented amount). How much ETH is that?",
      explanation:
        "Correct choice: 0.5 ETH\n\nOne ETH is 10^18 wei, so divide by 1,000,000,000,000,000,000: the result is 0.5 ETH. The answer “0.05 ETH” comes from miscounting one zero.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.0005 ETH",
        },
        {
          id: "b",
          label: "5 ETH",
        },
        {
          id: "c",
          label: "0.05 ETH",
        },
        {
          id: "d",
          label: "0.5 ETH",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-ethereum-networks-4",
      prompt:
        'Daniel gets a message: "Pectra is live. Enter your 12 recovery words on our site to upgrade your ETH or lose it." What is the best response?',
      explanation:
        "Correct choice: Ignore the request and enter nothing; a protocol upgrade is not a reason to give a website recovery words.\n\nThe named Ethereum upgrades did not require ordinary holders to exchange ETH by submitting a recovery phrase. Exposing recovery material can expose the authority it derives. The legitimate upgrade procedure must be checked through official documentation, without revealing secrets.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Enter the words quickly, because upgrades have deadlines.",
        },
        {
          id: "b",
          label: "Enter only the first six words to stay safe.",
        },
        {
          id: "c",
          label:
            "Ignore the request and enter nothing; a protocol upgrade is not a reason to give a website recovery words.",
        },
        {
          id: "d",
          label:
            "Send his ETH to the site's address so it can be upgraded for him.",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-ethereum-networks-5",
      prompt:
        "Which statement about The Merge on 15 September 2022 is accurate?",
      explanation:
        "Correct choice: Ethereum moved from proof of work to proof of stake, and its energy use fell by about 99.95%.\n\nThe Merge replaced miners with validators who stake ETH and cut energy use by about 99.95%. It did not make fees noticeably cheaper, because fees depend on demand for block space.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Ethereum moved from proof of work to proof of stake, and its energy use fell by about 99.95%.",
        },
        {
          id: "b",
          label:
            "Ethereum's fees became much cheaper because miners were removed.",
        },
        {
          id: "c",
          label: "Users had to swap their old ETH for new ETH.",
        },
        {
          id: "d",
          label:
            "The minimum to run a solo validator was cut from 32 ETH to 3.2 ETH.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-ethereum-networks-6",
      prompt:
        "Emily's wallet shows a transaction using 50,000 gas, a base fee of 30 gwei and a tip of 2 gwei (invented figures). What is the fee in ETH?",
      explanation:
        "Correct choice: 0.0016 ETH\n\n50,000 × (30 + 2) = 1,600,000 gwei, and dividing by 1,000,000,000 gives 0.0016 ETH. The answer “0.0015 ETH” counts only the base fee and forgets the tip.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "0.0015 ETH",
        },
        {
          id: "b",
          label: "0.016 ETH",
        },
        {
          id: "c",
          label: "0.00016 ETH",
        },
        {
          id: "d",
          label: "0.0016 ETH",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-ethereum-networks-7",
      prompt:
        "Lucas submits a ticket purchase that is included on-chain, consumes gas and then reverts because the sale has ended. What happens?",
      explanation:
        "Correct choice: The changes are undone and he keeps the ticket price, but he still pays for the gas used.\n\nThe included transaction reverts its specified state changes while charging for consumed gas under the network rules. A wallet rejection before broadcast or a transaction that never gets included is a different situation.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "The transaction fails, and he pays nothing at all.",
        },
        {
          id: "b",
          label:
            "The changes are undone and he keeps the ticket price, but he still pays for the gas used.",
        },
        {
          id: "c",
          label:
            "He receives the ticket anyway because the transaction was signed.",
        },
        {
          id: "d",
          label: "His ETH is lost permanently inside the contract.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-ethereum-networks-8",
      prompt:
        "Ana buys an NFT of a digital artwork. Without any separate licence, what has she most likely bought?",
      explanation:
        "Correct choice: The token recording that her address holds that token ID, not the copyright in the artwork\n\nAn NFT records who holds a unique token; any rights to use the image come from the licence the creator attaches. The media is often stored off-chain behind a link, so the answer “A promise that the image file will be stored on Ethereum forever” is also wrong.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A share of the artist's company",
        },
        {
          id: "b",
          label: "Full copyright, so she can sell prints of the image anywhere",
        },
        {
          id: "c",
          label:
            "A promise that the image file will be stored on Ethereum forever",
        },
        {
          id: "d",
          label:
            "The token recording that her address holds that token ID, not the copyright in the artwork",
        },
      ],
      correctChoiceIds: ["d"],
    },
    {
      id: "crypto-ethereum-networks-9",
      prompt:
        "Hyun-woo wants to swap 200 units of a stablecoin on a decentralised exchange. The app asks for an unlimited approval. What is the main risk of accepting, and a sensible alternative?",
      explanation:
        "Correct choice: If the contract is later hacked or malicious, it could spend all of that token he holds; he can approve only 200 and revoke old approvals later.\n\nAn unlimited approval lets the contract spend every unit of that token at any time until revoked. Limiting it to the amount needed, and reviewing approvals with a checker, shrinks that exposure; the answer “There is no risk, because approvals expire when he closes the website” is wrong because approvals stay on the blockchain.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "If the contract is later hacked or malicious, it could spend all of that token he holds; he can approve only 200 and revoke old approvals later.",
        },
        {
          id: "b",
          label:
            "The risk is only higher gas; he should approve twice to be safe.",
        },
        {
          id: "c",
          label:
            "There is no risk, because approvals expire when he closes the website.",
        },
        {
          id: "d",
          label:
            "The approval lets the app read his seed phrase; he should change wallets afterwards.",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-ethereum-networks-10",
      prompt:
        'On a "free token claim" site, Valentina\'s wallet asks her to sign a free message containing "spender", "value" and "deadline". What is this most likely to be?',
      explanation:
        "Correct choice: A permit-style signature that can give someone an approval to move her tokens\n\nA permit signature is an off-chain message that, once submitted, creates a token approval. A real log-in would not name a spender or an amount, so the answer “A harmless log-in that only proves she owns the address” is the dangerous assumption scammers rely on.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A harmless log-in that only proves she owns the address",
        },
        {
          id: "b",
          label: "A transaction that will cost her gas immediately",
        },
        {
          id: "c",
          label:
            "A permit-style signature that can give someone an approval to move her tokens",
        },
        {
          id: "d",
          label: "A request to back up her seed phrase",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-ethereum-networks-11",
      prompt:
        "In a lock-and-mint bridge, why is the vault on the starting network such an attractive target?",
      explanation:
        "Correct choice: The vault concentrates assets backing the destination tokens; loss of backing or release access can harm holders of those tokens.\n\nIn the supplied model, deposits are independently signed and the bridge relies on its own release authority and verification rules. A compromised vault or authority can affect many holders. This is separate from obtaining every depositor's personal private key.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "It stores users' private keys.",
        },
        {
          id: "b",
          label:
            "The vault concentrates assets backing the destination tokens; loss of backing or release access can harm holders of those tokens.",
        },
        {
          id: "c",
          label: "It is the place where new ETH is created.",
        },
        {
          id: "d",
          label: "It holds only the bridge's fees.",
        },
      ],
      correctChoiceIds: ["b"],
    },
    {
      id: "crypto-ethereum-networks-12",
      prompt: "What should be inspected in an upgradeable application?",
      explanation:
        "Correct choice: Who can change implementation and under what delay or threshold\n\nWho can change implementation and under what delay or threshold. Administrative authority can change reviewed behaviour.\n\nOnly whether its website is attractive. Appearance does not establish code or authority.\n\nOnly its first published white paper. Current deployment and permissions are needed.\n\nOnly whether yesterday's transaction succeeded. Past execution does not cover future upgrades.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label:
            "Who can change implementation and under what delay or threshold",
        },
        {
          id: "b",
          label: "Only whether its website is attractive",
        },
        {
          id: "c",
          label: "Only its first published white paper",
        },
        {
          id: "d",
          label: "Only whether yesterday's transaction succeeded",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-ethereum-networks-13",
      prompt:
        "An approval succeeds but the following swap reverts. What may remain?",
      explanation:
        "Correct choice: The approval and the fees already incurred\n\nA completed swap by definition. Receipt failure contradicts that conclusion.\n\nA guaranteed free retry. Later attempts can incur additional costs.\n\nThe approval and the fees already incurred. Separate transactions are not all reversed by the later failure.\n\nNo permission or fee from either action. This treats separate actions as one atomic event.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "A completed swap by definition",
        },
        {
          id: "b",
          label: "A guaranteed free retry",
        },
        {
          id: "c",
          label: "The approval and the fees already incurred",
        },
        {
          id: "d",
          label: "No permission or fee from either action",
        },
      ],
      correctChoiceIds: ["c"],
    },
    {
      id: "crypto-ethereum-networks-14",
      prompt: "Does NFT control automatically include commercial copyright?",
      explanation:
        "Correct choice: No rights depend on separate terms and law\n\nNo rights depend on separate terms and law. Token authority and intellectual-property rights are distinct.\n\nYes every standard includes all copyrights. Standards do not grant every outside legal right.\n\nYes if the image is expensive. Price does not determine the licence.\n\nYes if the wallet displays the image. Display does not establish ownership of copyright.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "No rights depend on separate terms and law",
        },
        {
          id: "b",
          label: "Yes every standard includes all copyrights",
        },
        {
          id: "c",
          label: "Yes if the image is expensive",
        },
        {
          id: "d",
          label: "Yes if the wallet displays the image",
        },
      ],
      correctChoiceIds: ["a"],
    },
    {
      id: "crypto-ethereum-networks-15",
      prompt: "What belongs in a bridge assessment?",
      explanation:
        "Correct choice: The source mechanism destination representation and return path\n\nOnly a matching ticker. Tickers do not establish backing or redemption.\n\nOnly transaction count. Past activity is not a complete design review.\n\nThe source mechanism destination representation and return path. Value and exit depend on the complete route.\n\nOnly the first transfer cost. Other dependencies and return conditions remain.",
      type: "single-choice",
      choices: [
        {
          id: "a",
          label: "Only a matching ticker",
        },
        {
          id: "b",
          label: "Only transaction count",
        },
        {
          id: "c",
          label:
            "The source mechanism destination representation and return path",
        },
        {
          id: "d",
          label: "Only the first transfer cost",
        },
      ],
      correctChoiceIds: ["c"],
    },
  ],
};
