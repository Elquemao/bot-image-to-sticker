const { default: translate } = require('google-translate-open-api')

/**
 * Translate Text
 * @param  {String} text
 * @param  {String} lang
 */

module.exports = doing = (text, lang) => new Promise((resolve, reject) => {
    console.log(`Translate ${text} to ${lang}...`)
    translate(text, { tld: 'es', from: 'es', to: lang })
        .then((text) => console.log(text))
        .catch((err) => reject(err))
        
})
