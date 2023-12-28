import express from "express"

// [GET] server return string
const startupRoute = express.Router()

startupRoute.get("/", async (req, res) => {
    res.send("Hello World!")
})

export default startupRoute
