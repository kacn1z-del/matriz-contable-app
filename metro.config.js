// Configuración de Metro (el empaquetador de React Native/Expo).
//
// Por qué existe este archivo: la hoja de cálculo (todo su HTML/CSS/JS)
// ahora se guarda como un ARCHIVO aparte — "assets/hoja-matriz-contable.html"
// — en vez de ir pegada como texto dentro de SheetEditor.js. Esto se hizo
// porque se comprobó (con un diagnóstico dentro de la app) que Metro
// corrompía ese texto cuando iba metido como un literal de JavaScript de
// más de 800,000 caracteres: perdía caracteres en algún punto de la
// compilación, sin avisar con ningún error. Al tratarlo como un ARCHIVO
// (igual que una imagen o el ícono de la app) en vez de como CÓDIGO, Metro
// simplemente lo copia tal cual dentro del paquete de la app, sin tener que
// interpretarlo como JavaScript — así se evita ese límite por completo.
//
// Por default, Metro solo sabe tratar como "archivo" (asset) extensiones
// como .png, .jpg, .ttf, etc. Hay que agregar ".html" a esa lista para que
// `require('../../assets/hoja-matriz-contable.html')` en SheetEditor.js
// se trate como un archivo empaquetado, y no como código a compilar.
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

config.resolver.assetExts.push('html')

module.exports = config
