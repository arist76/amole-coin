import { createHash } from 'crypto';
import express from "express"
import bodyParser from 'body-parser';

class Block {
    public index: number
    public data: string
    public timestamp: number
    public hash: string
    public previousHash: string
    public difficulty: number
    public nonce: number
    constructor(
        index: number,
        data: string,
        timestamp: number,
        hash: string,
        previousHash: string,
        difficulty: number,
        nonce: number
    ) {
        this.index = index
        this.data = data
        this.timestamp = timestamp
        this.hash = hash
        this.previousHash = previousHash
        this.difficulty = difficulty
        this.nonce = nonce
    }
}

const genesisBlock: Block = new Block(
    0,
    "This is the genesis block.",
    1465154705,
    "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7",
    "",
    0,
    0
);

var blockchain: Block[] = [genesisBlock]

function generateNextBlock(blockData: string): Block {
    let prevBlock: Block = getLatestBlock();
    let nextIndex: number = prevBlock.index++;
    let nextTS: number = new Date().getTime() / 1000;
    let nextHash: string = calculateHash(nextIndex, prevBlock.hash, nextTS, blockData)
    return new Block(
        nextIndex, blockData, nextTS, nextHash, prevBlock.hash, 0, 0
    )
}

function calculateHash(index: number, previousHash: string, timestamp: number, data: string): string {
    return Buffer.from(createHash('sha256').update(
        index + previousHash + timestamp + data
    ).digest('hex')).toString('base64');
}

function getLatestBlock(): any {
    return null
}

function isValidNewBlock(newBlock: Block, prevBlock: Block): boolean {
    return (
        newBlock.index === prevBlock.index++
        && newBlock.previousHash === prevBlock.hash
        && calculateHash(
            newBlock.index,
            newBlock.previousHash,
            newBlock.timestamp,
            newBlock.data
        ) === newBlock.hash
    )
}
function isValidBlockStructure(block: Block): boolean {
    return typeof block.index === "number"
        && typeof block.hash === "string"
        && typeof block.previousHash === "string"
        && typeof block.data === "string"
        && typeof block.timestamp === "number";
}

function isValidChain(blkchain: Block[]): boolean {
    for (let i = 0, j = 1; i < blkchain.length; i++ && j++) {
        if (isValidNewBlock(blkchain[i], blkchain[j])) {
            return false
        }
    }
    return true
}

function replaceChain(newBlocks: Block[]) {
    if (isValidChain(newBlocks) && newBlocks.length > getBlockChain().length) {
        blockchain = newBlocks
        broadcastLatest()
    }
}

function getBlockChain(): Block[] {
    return []
}

function broadcastLatest() {

}

function getSockets(): [string] {
    return [""]
}

function connectToPeers(peer: any) {

}

function initHttpServer(myHttpPort: number) {
    const app = express()
    app.use(bodyParser.json())

    app.get("/blocks", (req, res) => {
        res.send(getBlockChain)
    })

    app.post("/mineBlock", (req, res) => {
        let newBlock: Block = generateNextBlock(req.body.data)
        res.send(newBlock)
    })

    app.get("/peers", (req, res) => {
        res.send(getSockets().map((s: any) =>
            s._socket.remoteAddress + ':' + s.socket.remotePort
        ))
    })

    app.post("/addPeer", (req, res) => {
        connectToPeers(req.body.peer)
        res.send()
    })

    app.listen(myHttpPort, () => {
        console.log("Listening http on port: ", myHttpPort)
    })
}

function hashMatchesDifficulty(hash: string, difficulty: number): boolean {
    let hashInBinary: string = hexToBinary(hash)
    let requiredPrefix: string = '0'.repeat(difficulty)
    return hashInBinary.startsWith(requiredPrefix)
}

function hexToBinary(hash: string): string {
    throw new Error('Function not implemented.');
}