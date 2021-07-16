exports.textMenu = (pushname) => {
    return `
Hola, ${pushname}! 👋️
Estas son las funciones que tiene el bot!✨

Sticker Creator:
1. *#sticker*
Envía una imagen con el título #sticker o responde a una imagen con #sticker.

2. *#gifsticker* _<Giphy URL>_
Convierte un gif en un sticker animado (Giphy Only).
Envía el comando #gifsticker seguido del gif.

3. *#translate* _<Idioma>_
Traduce el mensaje que quieras al idioma que quieras.
*Deprecated*

4. *#verdad*
Manda tocho sobre lo que no es verdad

5. *#copon*
Manda tocho del copón

4. *#audio* _<nombre>_
Envía el comando #audio seguido del nombre del audio que quieras que te devuelva el bot.
Por ejemplo: #audio hawelin

Audios disponibles:
- hawelin
- juli
- kevin
- pablo
- tururu

Se irá mejorando poco a poco!✨`
}

exports.verdad = () => {
    return `
    Sabes perfectamente que eso no es verdad. Y no contento con ello vienes aquí, al grupo, a crear crispación. Solo para regodearte de las respuestas que obtengas, evidentemente en contra de tu posicionamiento que sabes erróneo.
    No, esto no es gracioso. Tu falta de sensibilidad hacia este tema hace que mucha gente se sienta mal. De acuerdo que eso es un grupo, pero hay cosas que pueden traspasar la pantalla del ordenador y herir el orgullo de quien te lea. Tú has pasado una barrera que no debías y por eso me causas poco menos que repugnancia. 
    Voy a respetarte a nivel personal, porque sé que en definitiva, solo tratas de divertirte a costa ajena, aunque con dudoso gusto. Por otra parte, te agradecería de que dejaras de considerarte amigo mío. Un saludo, espero que recapacites y no vuelvas a hacerlo.`
}

exports.copon = () => {
    return `
    Menudo hijo de puta, tienes un cuerpazo del copón. De moreno nada, tu estás blanco. Menudas espaldas tienes, hijo de la gran puta. Olvídate de adelgazar, potencia ese físico tan espectacular que tienes, hijo de una perra sarnosa. Qué puta envidia me das! Cuida un poco el sol y tira solarium en el gim. sol y zanahoria es lo que necesitas para terminar de ponerte del copón. Menudo hijo de la gran puta eres, ya quiesiera yo ese pedazo de cuerpo. Cabronazo, hijo de mil putas, te invidio muchísimo. Insisto, cuida un poco el sol y machácate en el gim, con ese cuerpo puedes quedarte del copón, cabronazo.
Y a los que dicen que estás blanco ni puto caso, son un atajo de maricones moreno-palos que solo les gusta tomar el sol Tu, sin embargo, estás del copón, hijo de la grandísima puta. Qué suerte tenéis algunos con la genética.`
}

exports.insults = (random) => {
    let insultos = ['Pitillo chupa pija', 
    'Pitilloooooooooooo maricoooooooon', 
    'Pitillo es un subnormal', 
    'Pitillo, eres un puto pringado', 
    'Pitillo cara alfombra', 
    'Pitillo, eres un tobogán de piojos']
    return insultos[random]
}