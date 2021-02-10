# bot-whatsapp-sticker

### Inicie su propia aplicación

En Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)


Creare una cuenta gratis si es la primera vez que entras:  
https://signup.heroku.com/


- Requisitos: Dos teléfonos, o un Teléfono y una PC


Modo de uso:
![screenshot](https://i.imgur.com/1kLLs3q.png)

Funciones:

- Crea sticker adjuntando imagen/gif/video utilizando el comando !sticker.

Instalar en Linux, Windows, etc. 

- Instalar dependencias

```
pkg update && pkg install git nodejs ffmpeg python -y
```

- Clonar este repositorio

```
git clone https://github.com/ianmazurek/bot-whatsapp-sticker
```

- Navega hacía la carpeta e instale las dependencias del nodo

```
cd bot-whatsapp-sticker
npm install
```

- Incia este proyecto

```
node index.js
Se generará un código QR y tendrá que escanearlo
```

Creditos para [@jlucaso1](https://github.com/jlucaso1) y [@adiwajshing](https://github.com/adiwajshing/) por la api de WhatsApp Web
