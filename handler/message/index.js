require('dotenv').config()
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const moment = require('moment-timezone')
moment.tz.setDefault('Europe/Madrid').locale('id')
const {meme, translate, getLocationData } = require('../../lib')
const { msgFilter, color, processTime, is } = require('../../utils')
const mentionList = require('../../utils/mention')
const { uploadImages } = require('../../utils/fetcher')
const fs = require('fs')
const { menuEs, menuEn } = require('./text') // Spanish & English menu

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, isGif, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const bodyWithoutFilter = (type === 'chat') ? body.toLowerCase() : ''

        // Bot Prefix
        const prefix = '#'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const url = args.length !== 0 ? args[0] : ''
        const uaOverride = process.env.UserAgent
        // Avoid Spam Message (5s of delay)
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { 
            return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) 
        }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { 
            return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) 
        }
        
        // Logging method
        /*
            [RECV] --> Received messages
            [EXEC] --> Executed commands from server
        */
        if (bodyWithoutFilter.includes('piti') || bodyWithoutFilter.includes('pitillo') || bodyWithoutFilter.includes('antonio')) { 
            let random = Math.floor(Math.random() * 6)
            console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color('Message send it', color), 'from', color(pushname))
            return client.reply(from, menuEs.insults(random), id)
        }
        if (bodyWithoutFilter.includes('alfon') || bodyWithoutFilter.includes('alfonso')) { 
            console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color('Message send it'), 'from', color(pushname))
            return client.reply(from, 'Alonso rapido y furioso', id)
        } 
        if (!isCmd && !isGroupMsg) { 
            return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) 
        }
        if (!isCmd && isGroupMsg) { 
            return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { 
            console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) 
        }
        if (isCmd && isGroupMsg) { 
            console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) 
        }

        switch (command) {
        // Menu
        case 'ping':
            await client.sendText(from, `Ping: ${processTime(t, moment())}s`)
            break
        case 'menu':
        case 'help':
            await client.sendText(from, menuEs.textMenu(pushname))
            break
        case 'verdad':
            await client.sendText(from, menuEs.verdad())
            break
        case 'copon':
            await client.sendText(from, menuEs.copon())
            break
        case 'casa':
            await client.sendLocation(from, 38.993441, -1.853568, 'Bindi Albacete')
            break
        // Sticker Creator
        case 'sticker': {
            if ((isMedia || isQuotedImage) && args.length === 0) {
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                client.sendImageAsSticker(from, imageBase64, {keepScale: true}).then(() => {
                    client.reply(from, 'Pa\' ti hijo de la gran puta', id)
                    console.log(`Sticker Processed in ${processTime(t, moment())}s`)
                })
            } else if (args.length === 1) {
                if (!is.Url(url)) { await client.reply(from, 'Envía un enlace válido anda', id) }
                client.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                    ? client.sendText(from, 'El enlace no tiene ninguna imagen')
                    : client.reply(from, 'Pa\' ti hijo de la gran puta', id)).then(() => console.log(`Sticker Processed in ${processTime(t, moment())}s`))
            } else {
                await client.reply(from, 'Escribe bien el comando', id)
            }
            break
        }
        case 'gifsticker': {
            if (args.length !== 1) return client.reply(from, 'Escribe bien el comando', id)
            if (is.Giphy(url)) {
                const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                if (!getGiphyCode) { return client.reply(from, 'El gif tiene que ser de Giphy', id) }
                const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'Pa\' ti')
                    console.log(`Sticker Processed in ${processTime(t, moment())} s`)
                }).catch((err) => console.log(err))
            } else if (is.MediaGiphy(url)) {
                const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                if (!gifUrl) { return client.reply(from, 'El gif tiene que ser de Giphy', id) }
                const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'Pa\' ti', id)
                    console.log(`Sticker Processed in ${processTime(t, moment())}s`)
                }).catch((err) => console.log(err))
            } else {
                await client.reply(from, 'Solo se admite Giphy para los gifs', id)
            }
            break
        }
        //Commented until module is working --> https://travis-ci.org/github/hua1995116/google-translate-open-api/builds/744098517
        /* case 'translate':
            if (args.length != 1) return client.reply(from, 'Escribe bien el comando', id)
            if (!quotedMsg) return client.reply(from, 'Escribe bien el comando', id)
            const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
            translate(quoteText, args[0])
                .then((result) => client.sendText(from, result))
                .catch(() => client.sendText(from, 'Código de idioma incorrecto o fallo de conexión con el servidor'))
            break*/
        case 'botstat': {
            const loadedMsg = await client.getAmountOfLoadedMessages()
            const chatIds = await client.getAllChatIds()
            const groups = await client.getAllGroups()
            client.sendText(from, `Estadísiticas:\n- *${loadedMsg}* Mensajes leídos\n- *${groups.length}* Grupos\n- *${chatIds.length - groups.length}* Individuales\n- *${chatIds.length}* Chats totales`)
            break
        }
        case 'audio':
            if(args.length != 1) {
                return client.reply(from, 'Escribe bien el comando', id)
            }

            let audioPath = 'handler\\message\\audio\\' + args[0].toLowerCase() + '.ogg'

            fs.access(audioPath, fs.F_OK, (err) => {
                if(err) {
                    console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`File ${args[0]} not found`, 'red'), 'from', color(pushname, 'red')) 
                    return client.reply(from, 'Ese audio no existe', id)
                }

                client.sendAudio(from, audioPath, id)
                .then(() => {
                    console.log(`Audio Processed in ${processTime(t, moment())} s`)
                })
                .catch((err) => console.log(err))
            })
            break
        //ON DEVELOPMENT
        /*case 'meme':
            if ((isMedia || isQuotedImage) && args.length >= 2) {
                const top = arg.split('|')[0]
                const bottom = arg.split('|')[1]
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const getUrl = await uploadImages(mediaData, false)
                const ImageBase64 = await meme.custom(getUrl, top, bottom)
                client.sendFile(from, ImageBase64, 'image.png', '', null, true)
                    .then((serialized) => console.log(`Success sending file with id: ${serialized}, processing time was ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            } else if (arg.split(" ")[0] == 'random') {
                const ImageBase64 = meme.random(arg.split(" ")[1])
                client.sendFile(from, ImageBase64, 'image.png', '', null, true)
                    .then((serialized) => console.log(`Success sending file with id: ${serialized}, processing time was ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            } else {
                await client.reply(from, 'Introduce bien el comando!! \nSi tienes dudas pon el comando #help', id)
            }
            break*/
        default:
            console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
            break
        }
    } catch (err) {
        console.error(color(err, 'red'))
    }
}
