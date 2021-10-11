const { create, Client } = require('@open-wa/wa-automate')
const { color, messageLog } = require('./utils')
const moment = require('moment-timezone')
moment.tz.setDefault('Europe/Madrid').locale('id')
const msgHandler = require('./handler/message')
const fs = require("fs")
const CronJob = require('cron').CronJob

const start = (client = new Client()) => {
    console.log('[DEV]', color('Alejandro Ramon', 'yellow'))
    console.log('[CLIENT] CLIENT Started!')

    // Message log for analytic
    client.onAnyMessage((fn) => messageLog(fn.fromMe, fn.type))

    //Birthdays job scheduled every day at 09:00AM
    let birthdayHelper = new CronJob('00 09 * * * *', function() {
        fs.readFile("utils\\birthdays.json", function(err, data) {
            if(err) {
                throw err
            }
            
            const parsedJSON = JSON.parse(data)
            const date = new Date().toLocaleDateString().substring(0, 4)
            let birthMan = ""

            for (let i = 0; i < parsedJSON.birthdays.length; i++) {
                if(parsedJSON.birthdays[i].birthday == date) {
                    birthMan = parsedJSON.birthdays[i].name
                }
            }

            if(birthMan != "") {
                for (let i = 0; i < parsedJSON.birthdays.length; i++) {
                    if(parsedJSON.birthdays[i].birthday != date) {
                        client.sendText(parsedJSON.birthdays[i].id, "Hola " + parsedJSON.birthdays[i].name + "!! Hoy es el cumple de " + birthMan + " no te olvides de felicitarle jejeje") 
                    }
                }
                console.log('[EXEC]', color(moment(new Date()).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), 'Birthday notified to all members')
            }
            
        })
    })

    birthdayHelper.start()
    console.log('[CLIENT] Birthdays job started!')

    // Force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[Client State]', state)
        if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus()
    })

    // listening on message
    client.onMessage((message) => {
        // Cut message Cache if cache more than 3K
        client.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && client.cutMsgCache())
        // Message Handler
        msgHandler(client, message)
    })

    // listen group invitation
    client.onAddedToGroup(({ groupMetadata: { id }, contact: { name } }) =>
        client.getGroupMembersId(id)
            .then((ids) => {
                console.log('[CLIENT]', color(`Invited to Group. [ ${name} => ${ids.length}]`, 'yellow'))
                // conditions if the group members are less than 10 then the bot will leave the group
                /*if (ids.length <= 10) {
                    client.sendText(id, 'Sorry, the minimum group member is 10 user to use this bot. Bye~').then(() => client.leaveGroup(id))
                } else {
                    client.sendText(id, `Hello group members *${name}*, thank you for inviting this bot, to see the bot menu send *#menu*`)
                }*/
                client.sendText(id, `Hola *${name}*, se vienen cositas!! \nPara ver como se utiliza el bot envía *#help*`)
            }))

    // listen paricipant event on group (wellcome message)
    client.onGlobalParicipantsChanged(async (event) => {
        // const host = await client.getHostNumber() + '@c.us'
        // if (event.action === 'add' && event.who !== host) client.sendTextWithMentions(event.chat, `Hello, Welcome to the group @${event.who.replace('@c.us', '')} \n\nHave fun with us✨`)
    })

    client.onIncomingCall((callData) => {
        // client.contactBlock(callData.peerJid)
    })
}

const options = {
    sessionId: 'Imperial',
    headless: true,
    qrTimeout: 0,
    authTimeout: 0,
    inDocker: true, //Must be true on Heroku deployments (Docker)
    restartOnCrash: start,
    cacheEnabled: false,
    useChrome: true,
    killProcessOnBrowserClose: true,
    throwErrorOnTosBlock: false,
    chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disk-cache-size=0'
    ]
}

create(options)
    .then((client) => start(client))
    .catch((err) => new Error(err))
