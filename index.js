import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'


import databaseService from './service/database.service.js';
import userRouter from './routes/user.route.js';
import ErrorHandler from './error.handler.js';
import { tokenRequest } from './routes/token.route.js';
import itemRouter from './routes/item.route.js';

const app = express();


config()
app.use(express.json())
app.use(cors())

app.get('/user', (req, res) => {
    res.status(200).json(
        {
            message: 'hello',
            status: 200,
            data: {
                data: 'fake data'
            }
        }
    )
})
app.use('/user', userRouter)

// token

app.use('/token', tokenRequest)


// item
app.use('/item', itemRouter)

// Error callback
app.use(ErrorHandler);

// ON START
app.listen(process.env.PORT, async (err) => {
    await databaseService.connect()
    console.log(`Banh truong lanh dia\nhttp://localhost:${process.env.PORT}`)
})


// ON EXIT
process.on('SIGINT', function () {
    console.log("\nServer bị đóng bởi tổ hợp phím Ctrl + C");
    process.exit(1);
});