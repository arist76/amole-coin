import { WebSocketServer, WebSocket } from 'ws'
import express from "express"
import bodyParser from 'body-parser'
import { Block, generateNextBlock, getBlockChain } from "./blocks"

function broadcastLatest() {

}


let sockserver = new WebSocketServer({ port: 8000 })

sockserver.on("connection", ws => {
    console.log("new client connected!")

    ws.on("close", () => console.log("closed!!!"))
    ws.on("message", (d: any) => console.log`"message recieved,${d}`)
    ws.onerror = function () {
        console.log("websocket error")
    }
})

function getSockets() {
    return Array.from(sockserver.clients)
}

function connectToPeers(peer: any) {

}

function initHttpServer(myHttpPort: number) {
    const app = express()
    app.use(bodyParser.json())

    app.get("/blocks", (req, res) => {
        res.send(getBlockChain())
    })

    app.post("/mineBlock", (req, res) => {
        let newBlock: Block = generateNextBlock(req.body.data)
        res.send(newBlock)
    })

    app.get("/peers", (req, res) => {
        res.send(getSockets().map((s) =>
            s.url + " : " + s.protocol
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

export {
    broadcastLatest,
    initHttpServer
}