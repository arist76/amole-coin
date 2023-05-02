
class TxOut {
    public address: string; // what is this address?
    public amount: number;
    constructor(address: string, amount: number) {
        this.address = address
        this.amount = amount
    }
}

class TxIn {
    public txOutId: string; // probably TxOut.address
    public txOutIndex: number // what is this index?
    public signature: string // what is this signature?
}

class Transaction {
    public id: string
    public txIns: TxIn[]
    public txOuts: TxOut[]
}

function getTransactionId(transaction: Transaction): string {
    const txInContent: string = transaction.txIns
        .map((txIn: TxIn) => txIn.txOutId + txIn.txOutIndex)
        .reduce((a,b) => a+b, '')

    const txOutContent: string = transaction.txOuts
        .map((txOut: TxOut) => txOut.address + txOut.amount)
        .reduce((a,b) => a+b, '')
    
    return CryptoJS.SHA256(txInContent + txOutContent).toString()
}

function signTxIn(transaction : Transaction, txInIndex: number, 
    privateKey: string, aUnspentTxOuts: UnspentTxOut[]) : string {
        return ''
}