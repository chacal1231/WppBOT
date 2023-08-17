const qrcode = require('qrcode-terminal');
const { Client, Location, List, Buttons, LocalAuth} = require('whatsapp-web.js');
const express = require('express');
const app = express();
var axios = require("axios").default;
const port = 12310;

// Inicializo el wpp
const client = new Client({
    authStrategy: new LocalAuth({
          clientId: "client-one" //Identificador de sesion
      }),
    puppeteer: { args: ['--no-sandbox'] }
});
// Inicializo la sesión y el express
client.initialize();
app.use(express.json());

// Tomo el QR si no utilizó el localauth
client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    qrcode.generate(qr, {small: true});
});

// Cargo la sesion guardada
client.on('authenticated', (session) => {
    console.log('AUTHENTICATED');
});
// notifico
client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

/*Envio de mensaje a grupo*/
const sendMessageSoporte = async (Menssage) => {
        const chats = await client.getChats()
        for (const chat of chats) if (chat.name == "MACTELCO SOPORTE") group = chat
        group.sendMessage(Menssage)
}

/*Si el inicio de sesion fue exitoso hagale papito*/
client.on('ready', () => {
    console.log('WPP OK');

    /*Ruta para enviar mensaje a grupo*/
    app.post('/SendSMSGroup', (req, res) => {
      const { message } = req.body;
      /*Verifico Mensaje y envio al grupo de Wpp*/
      sendMessageSoporte(message);
      /*Enviar respuesta Exito*/
      res.sendStatus(200);
    });

    /*Ruta para enviar mensaje a numero*/
    app.post('/SendSMS', (req, res) => {
        const { number,message } = req.body;
        client.sendMessage(number,message);
        /*Enviar respuesta Exito*/
        res.sendStatus(200);
      });
  
    // Enviar Mac y Pin
    async function WebHook(Number,Message){
    //Llamada a la API
    const options = {
        method: 'POST',
        url: 'https://tupagina.com/Webhook',
        data: {Number: Number, Message: Message}
      };
    try{
      const res = await axios.request(options);
      return res;
    }catch(err){
      return "false";
    } 
  }

    /*Iniciar Express*/
    app.listen(port, () => {
      console.log(`API escuchando en el puerto ${port}`);
  });
});

/*Rutina cuando llegue mensajes*/
client.on('message', async msg => {
    let chat = await msg.getChat();
    // Verifico si es un grupo, si el mensaje viene de un grupo lo ignoro
    if (!chat.isGroup) {
        // No es un grupo, le doy un veido y envío la información al webhook
        chat.sendSeen();
        // Envio info al webHook
        const ResponseWebhook = await WebHook(msg.body,chat.user);
        console.log(ResponseWebhook);
        
    }
})