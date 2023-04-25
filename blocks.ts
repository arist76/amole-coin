import { createHash } from 'crypto'

import { broadcastLatest } from "./connections.js"

const BLOCK_GENERATION_INTERVAL: number = 10
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10

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
    let nextHash: string = calculateHash(nextIndex, prevBlock.hash, nextTS, blockData, 0, 0)
    return new Block(
        nextIndex, blockData, nextTS, nextHash, prevBlock.hash, 0, 0
    )
}

function calculateHash(index: number, previousHash: string, timestamp: number, data: string, difficulty: number, nonce: number): string {
    return Buffer.from(createHash('sha256').update(
        index + previousHash + timestamp + data
    ).digest('hex')).toString('base64');
}

function getLatestBlock(): any {
    blockchain[blockchain.length - 1]
}

function isValidNewBlock(newBlock: Block, prevBlock: Block): boolean {
    return (
        newBlock.index === prevBlock.index++
        && newBlock.previousHash === prevBlock.hash
        && calculateHash(
            newBlock.index,
            newBlock.previousHash,
            newBlock.timestamp,
            newBlock.data,
            newBlock.difficulty,
            newBlock.nonce
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
    return blockchain
}

function hashMatchesDifficulty(hash: string, difficulty: number): boolean {
    let hashInBinary: string = hexToBinary(hash)
    let requiredPrefix: string = '0'.repeat(difficulty)
    return hashInBinary.startsWith(requiredPrefix)
}

function hexToBinary(hash: string): string {
    throw new Error('Function not implemented.');
}

function findBlock(index: number, previousHash: string, timestamp: number, data: string, difficulty: number): Block {
    let nonce = 0
    while (true) {
        let hash: string = calculateHash(index, previousHash, timestamp, data, difficulty, nonce)
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(
                index, data, timestamp, hash, previousHash, difficulty, nonce
            )
        }
        nonce++
    }
}

function getDifficulty(aBlockchain: Block[]): number {
    const latestBlock: Block = aBlockchain[blockchain.length - 1]
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index != 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else {
        return latestBlock.difficulty
    }
}

function getAdjustedDifficulty(latestBlock: Block, aBlockchain: Block[]) {
    let prevAdjustmentBlock: Block = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL]
    let timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL
    let timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1
    } else if (timeTaken > timeExpected / 2) {
        return prevAdjustmentBlock.difficulty - 1
    } else {
        return prevAdjustmentBlock.difficulty
    }
}

function isValidTimestamp(newBlock: Block, previousBlock: Block): boolean {
    return (previousBlock.timestamp - 60 < newBlock.timestamp)
        && (newBlock.timestamp - 60) < getCurrentTimestamp()
}

function getCurrentTimestamp(): number {
    return 0
}

export {
    Block,
    generateNextBlock,
    getBlockChain
}