const connectWalletButton = document.getElementById('connectWalletButton');
const walletInfo = document.getElementById('walletInfo');
const daoNameSpan = document.getElementById('daoName');
const totalProposalsSpan = document.getElementById('totalProposals');
const createProposalButton = document.getElementById('createProposalButton');
const proposalItems = document.getElementById('proposalItems');

// DAO Contract details
const daoContractAddress = '0x92382d1d6d19095217b4de2a8edf452f1e6c55fc'; // Replace with your contract address
const daoAbi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_member",
				"type": "address"
			}
		],
		"name": "addMember",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			}
		],
		"name": "createProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			}
		],
		"name": "ProposalCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "getProposal",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getProposalCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "members",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "proposals",
		"outputs": [
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

let provider;
let signer;
let daoContract;

// Check if Ethereum provider is available
if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
    alert("Please install MetaMask or another Web3 provider!");
}

// Connect wallet
async function connectWallet() {
    try {
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        const address = await signer.getAddress();
        
        walletInfo.textContent = `Connected: ${address}`;
        connectWalletButton.textContent = "Wallet Connected";
        connectWalletButton.disabled = true;

        connectToContract();
        loadDaoInfo();

        // Check if user is a member
        const isMember = await daoContract.members(address);
        if (!isMember) {
            alert("You are not a DAO member. Ask the owner to add you.");
            createProposalButton.disabled = true;
        } else {
            createProposalButton.disabled = false;
        }
    } catch (error) {
        console.error("Wallet connection failed:", error);
    }
}


// Connect to the DAO smart contract
function connectToContract() {
    daoContract = new ethers.Contract(daoContractAddress, daoAbi, signer);
}

// Load DAO information
async function loadDaoInfo() {
    try {
        const totalProposals = await daoContract.proposalCount();
        totalProposalsSpan.textContent = totalProposals;
        loadProposals(totalProposals);
    } catch (error) {
        console.error("Error loading DAO info:", error);
    }
}

// Create a new proposal
async function createProposal() {
    const proposalName = document.getElementById('proposalName').value;
    if (!proposalName) {
        alert("Please enter a proposal name");
        return;
    }

    try {
        const tx = await daoContract.createProposal(proposalName);
        await tx.wait();
        alert("Proposal created successfully!");
        loadDaoInfo();
    } catch (error) {
        console.error("Error creating proposal:", error);
    }
}

// Load all proposals
async function loadProposals(totalProposals) {
    proposalItems.innerHTML = ""; // Clear previous items

    for (let i = 0; i < totalProposals; i++) {
        try {
            const proposal = await daoContract.getProposal(i);
            const proposalDescription = proposal[0];
            const voteCount = proposal[1];

            // Create proposal item in the UI
            const proposalDiv = document.createElement('div');
            proposalDiv.className = 'proposal-item';
            proposalDiv.innerHTML = `
                <p><strong>Description:</strong> ${proposalDescription}</p>
                <p><strong>Votes:</strong> ${voteCount}</p>
                <button onclick="vote(${i})">Vote</button>
            `;
            proposalItems.appendChild(proposalDiv);
        } catch (error) {
            console.error("Error loading proposal:", error);
        }
    }
}

// Vote on a proposal
async function vote(proposalId) {
    try {
        const tx = await daoContract.vote(proposalId);
        await tx.wait();
        alert("Vote cast successfully!");
        loadDaoInfo(); // Refresh the DAO information to update vote counts
    } catch (error) {
        if (error.message.includes("You have already voted")) {
            alert("You have already voted on this proposal.");
        } else {
            console.error("Error voting on proposal:", error);
        }
    }
}

// Event listeners
connectWalletButton.addEventListener('click', connectWallet);
createProposalButton.addEventListener('click', createProposal);
