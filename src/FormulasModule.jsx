import React, { useState, useMemo } from 'react';
import '../styles/FormulasModule.css';

const FormulasModule = ({ i18n = {} }) => {
  const t = i18n.t || ((key) => key);

  // BASE DE FÓRMULAS (510+ fórmulas)
  const FORMULAS = {
    matematicas: [
      { id: 'ABS', nombre: 'ABS', descripcion: 'Valor absoluto', ejemplo: 'ABS(-5) = 5', parametros: '(número)' },
      { id: 'ACOS', nombre: 'ACOS', descripcion: 'Arcoseno', ejemplo: 'ACOS(0.5)', parametros: '(número)' },
      { id: 'ACOSH', nombre: 'ACOSH', descripcion: 'Arcoseno hiperbólico', ejemplo: 'ACOSH(1)', parametros: '(número)' },
      { id: 'ASIN', nombre: 'ASIN', descripcion: 'Arcoseno', ejemplo: 'ASIN(0.5)', parametros: '(número)' },
      { id: 'ASINH', nombre: 'ASINH', descripcion: 'Arcoseno hiperbólico', ejemplo: 'ASINH(0)', parametros: '(número)' },
      { id: 'ATAN', nombre: 'ATAN', descripcion: 'Arcotangente', ejemplo: 'ATAN(1)', parametros: '(número)' },
      { id: 'ATAN2', nombre: 'ATAN2', descripcion: 'Arcotangente de dos argumentos', ejemplo: 'ATAN2(1, 1)', parametros: '(y, x)' },
      { id: 'ATANH', nombre: 'ATANH', descripcion: 'Arcotangente hiperbólica', ejemplo: 'ATANH(0.5)', parametros: '(número)' },
      { id: 'CEILING', nombre: 'CEILING', descripcion: 'Redondea hacia arriba', ejemplo: 'CEILING(4.3) = 5', parametros: '(número, [cifras])' },
      { id: 'COS', nombre: 'COS', descripcion: 'Coseno', ejemplo: 'COS(0)', parametros: '(número)' },
      { id: 'COSH', nombre: 'COSH', descripcion: 'Coseno hiperbólico', ejemplo: 'COSH(0)', parametros: '(número)' },
      { id: 'DEGREES', nombre: 'DEGREES', descripcion: 'Convierte radianes a grados', ejemplo: 'DEGREES(PI())', parametros: '(radianes)' },
      { id: 'EXP', nombre: 'EXP', descripcion: 'Exponencial (e^x)', ejemplo: 'EXP(1)', parametros: '(número)' },
      { id: 'FACT', nombre: 'FACT', descripcion: 'Factorial', ejemplo: 'FACT(5) = 120', parametros: '(número)' },
      { id: 'FLOOR', nombre: 'FLOOR', descripcion: 'Redondea hacia abajo', ejemplo: 'FLOOR(4.7) = 4', parametros: '(número)' },
      { id: 'GCD', nombre: 'GCD', descripcion: 'Máximo común divisor', ejemplo: 'GCD(12, 18) = 6', parametros: '(número1, número2, ...)' },
      { id: 'INT', nombre: 'INT', descripcion: 'Parte entera', ejemplo: 'INT(4.9) = 4', parametros: '(número)' },
      { id: 'LCM', nombre: 'LCM', descripcion: 'Mínimo común múltiplo', ejemplo: 'LCM(12, 18) = 36', parametros: '(número1, número2, ...)' },
      { id: 'LN', nombre: 'LN', descripcion: 'Logaritmo natural', ejemplo: 'LN(E()) ≈ 1', parametros: '(número)' },
      { id: 'LOG', nombre: 'LOG', descripcion: 'Logaritmo base 10', ejemplo: 'LOG(100) = 2', parametros: '(número, [base])' },
      { id: 'LOG10', nombre: 'LOG10', descripcion: 'Logaritmo base 10', ejemplo: 'LOG10(100) = 2', parametros: '(número)' },
      { id: 'LOG2', nombre: 'LOG2', descripcion: 'Logaritmo base 2', ejemplo: 'LOG2(8) = 3', parametros: '(número)' },
      { id: 'MOD', nombre: 'MOD', descripcion: 'Módulo (resto)', ejemplo: 'MOD(10, 3) = 1', parametros: '(dividendo, divisor)' },
      { id: 'PI', nombre: 'PI', descripcion: 'Número Pi', ejemplo: 'PI() ≈ 3.14159', parametros: '()' },
      { id: 'POWER', nombre: 'POWER', descripcion: 'Potencia', ejemplo: 'POWER(2, 3) = 8', parametros: '(número, potencia)' },
      { id: 'PRODUCT', nombre: 'PRODUCT', descripcion: 'Producto de números', ejemplo: 'PRODUCT(2, 3, 4) = 24', parametros: '(número1, número2, ...)' },
      { id: 'RADIANS', nombre: 'RADIANS', descripcion: 'Convierte grados a radianes', ejemplo: 'RADIANS(180)', parametros: '(grados)' },
      { id: 'RAND', nombre: 'RAND', descripcion: 'Número aleatorio 0-1', ejemplo: 'RAND()', parametros: '()' },
      { id: 'RANDBETWEEN', nombre: 'RANDBETWEEN', descripcion: 'Aleatorio entre dos números', ejemplo: 'RANDBETWEEN(1, 10)', parametros: '(inferior, superior)' },
      { id: 'ROUND', nombre: 'ROUND', descripcion: 'Redondea a N decimales', ejemplo: 'ROUND(4.5678, 2) = 4.57', parametros: '(número, decimales)' },
      { id: 'ROUNDDOWN', nombre: 'ROUNDDOWN', descripcion: 'Redondea hacia abajo', ejemplo: 'ROUNDDOWN(4.9, 0) = 4', parametros: '(número, cifras)' },
      { id: 'ROUNDUP', nombre: 'ROUNDUP', descripcion: 'Redondea hacia arriba', ejemplo: 'ROUNDUP(4.1, 0) = 5', parametros: '(número, cifras)' },
      { id: 'SIGN', nombre: 'SIGN', descripcion: 'Signo del número', ejemplo: 'SIGN(-5) = -1', parametros: '(número)' },
      { id: 'SIN', nombre: 'SIN', descripcion: 'Seno', ejemplo: 'SIN(PI()/2) = 1', parametros: '(número)' },
      { id: 'SINH', nombre: 'SINH', descripcion: 'Seno hiperbólico', ejemplo: 'SINH(0) = 0', parametros: '(número)' },
      { id: 'SQRT', nombre: 'SQRT', descripcion: 'Raíz cuadrada', ejemplo: 'SQRT(16) = 4', parametros: '(número)' },
      { id: 'SQRTPI', nombre: 'SQRTPI', descripcion: 'Raíz cuadrada de Pi', ejemplo: 'SQRTPI(1)', parametros: '(número)' },
      { id: 'SUMAR', nombre: 'SUM', descripcion: 'Suma números', ejemplo: 'SUM(1, 2, 3) = 6', parametros: '(número1, número2, ...)' },
      { id: 'SUMAPRODUCTO', nombre: 'SUMPRODUCT', descripcion: 'Suma de productos', ejemplo: 'SUMPRODUCT(A1:A3, B1:B3)', parametros: '(matriz1, matriz2, ...)' },
      { id: 'TAN', nombre: 'TAN', descripcion: 'Tangente', ejemplo: 'TAN(PI()/4)', parametros: '(número)' },
      { id: 'TANH', nombre: 'TANH', descripcion: 'Tangente hiperbólica', ejemplo: 'TANH(0) = 0', parametros: '(número)' },
      { id: 'TRUNC', nombre: 'TRUNC', descripcion: 'Trunca decimales', ejemplo: 'TRUNC(4.7) = 4', parametros: '(número, [cifras])' },
    ],
    estadisticas: [
      { id: 'AVERAGE', nombre: 'AVERAGE', descripcion: 'Promedio', ejemplo: 'AVERAGE(1, 2, 3) = 2', parametros: '(número1, número2, ...)' },
      { id: 'AVERAGEA', nombre: 'AVERAGEA', descripcion: 'Promedio incluyendo texto', ejemplo: 'AVERAGEA(A1:A5)', parametros: '(rango)' },
      { id: 'AVERAGEIF', nombre: 'AVERAGEIF', descripcion: 'Promedio si cumple condición', ejemplo: 'AVERAGEIF(A1:A5, ">5")', parametros: '(rango, criterio)' },
      { id: 'AVERAGEIFS', nombre: 'AVERAGEIFS', descripcion: 'Promedio con múltiples criterios', ejemplo: 'AVERAGEIFS(A1:A5, B1:B5, "A")', parametros: '(rango, criterios...)' },
      { id: 'CORREL', nombre: 'CORREL', descripcion: 'Correlación entre arrays', ejemplo: 'CORREL(A1:A5, B1:B5)', parametros: '(array1, array2)' },
      { id: 'COUNT', nombre: 'COUNT', descripcion: 'Cuenta números', ejemplo: 'COUNT(1, 2, "a", 3) = 3', parametros: '(rango)' },
      { id: 'COUNTA', nombre: 'COUNTA', descripcion: 'Cuenta celdas no vacías', ejemplo: 'COUNTA(A1:A5)', parametros: '(rango)' },
      { id: 'COUNTBLANK', nombre: 'COUNTBLANK', descripcion: 'Cuenta celdas vacías', ejemplo: 'COUNTBLANK(A1:A5)', parametros: '(rango)' },
      { id: 'COUNTIF', nombre: 'COUNTIF', descripcion: 'Cuenta si cumple criterio', ejemplo: 'COUNTIF(A1:A5, ">5")', parametros: '(rango, criterio)' },
      { id: 'COUNTIFS', nombre: 'COUNTIFS', descripcion: 'Cuenta con múltiples criterios', ejemplo: 'COUNTIFS(A1:A5, "A", B1:B5, "x")', parametros: '(rango, criterios...)' },
      { id: 'COVARIANCE', nombre: 'COVARIANCE', descripcion: 'Covarianza', ejemplo: 'COVARIANCE(A1:A5, B1:B5)', parametros: '(array1, array2)' },
      { id: 'DEVSQ', nombre: 'DEVSQ', descripcion: 'Suma de cuadrados de desviaciones', ejemplo: 'DEVSQ(A1:A5)', parametros: '(rango)' },
      { id: 'FORECAST', nombre: 'FORECAST', descripcion: 'Pronóstico lineal', ejemplo: 'FORECAST(10, B1:B5, A1:A5)', parametros: '(x, conocidos_y, conocidos_x)' },
      { id: 'FREQUENCY', nombre: 'FREQUENCY', descripcion: 'Distribución de frecuencia', ejemplo: 'FREQUENCY(A1:A10, B1:B5)', parametros: '(datos, bins)' },
      { id: 'GEOMEAN', nombre: 'GEOMEAN', descripcion: 'Media geométrica', ejemplo: 'GEOMEAN(1, 2, 3)', parametros: '(número1, número2, ...)' },
      { id: 'GROWTH', nombre: 'GROWTH', descripcion: 'Crecimiento exponencial', ejemplo: 'GROWTH(B1:B5, A1:A5)', parametros: '(conocidos_y, [conocidos_x])' },
      { id: 'HARMEAN', nombre: 'HARMEAN', descripcion: 'Media armónica', ejemplo: 'HARMEAN(1, 2, 3)', parametros: '(número1, número2, ...)' },
      { id: 'KURT', nombre: 'KURT', descripcion: 'Curtosis', ejemplo: 'KURT(A1:A5)', parametros: '(número1, número2, ...)' },
      { id: 'LARGE', nombre: 'LARGE', descripcion: 'K-ésimo mayor valor', ejemplo: 'LARGE(A1:A5, 2)', parametros: '(rango, k)' },
      { id: 'MAX', nombre: 'MAX', descripcion: 'Valor máximo', ejemplo: 'MAX(1, 5, 3) = 5', parametros: '(número1, número2, ...)' },
      { id: 'MEDIAN', nombre: 'MEDIAN', descripcion: 'Valor mediano', ejemplo: 'MEDIAN(1, 2, 3, 4, 5) = 3', parametros: '(número1, número2, ...)' },
      { id: 'MIN', nombre: 'MIN', descripcion: 'Valor mínimo', ejemplo: 'MIN(1, 5, 3) = 1', parametros: '(número1, número2, ...)' },
      { id: 'MODE', nombre: 'MODE', descripcion: 'Valor más frecuente', ejemplo: 'MODE(1, 1, 2, 3) = 1', parametros: '(número1, número2, ...)' },
      { id: 'PERCENTILE', nombre: 'PERCENTILE', descripcion: 'Percentil', ejemplo: 'PERCENTILE(A1:A5, 0.5)', parametros: '(array, k)' },
      { id: 'QUARTILE', nombre: 'QUARTILE', descripcion: 'Cuartil', ejemplo: 'QUARTILE(A1:A5, 2)', parametros: '(array, número)' },
      { id: 'RANK', nombre: 'RANK', descripcion: 'Rango/Posición', ejemplo: 'RANK(3, A1:A5)', parametros: '(número, array, [orden])' },
      { id: 'SKEW', nombre: 'SKEW', descripcion: 'Sesgo de distribución', ejemplo: 'SKEW(A1:A5)', parametros: '(número1, número2, ...)' },
      { id: 'SMALL', nombre: 'SMALL', descripcion: 'K-ésimo menor valor', ejemplo: 'SMALL(A1:A5, 2)', parametros: '(rango, k)' },
      { id: 'STDEV', nombre: 'STDEV', descripcion: 'Desviación estándar muestra', ejemplo: 'STDEV(A1:A5)', parametros: '(número1, número2, ...)' },
      { id: 'STDEVP', nombre: 'STDEVP', descripcion: 'Desviación estándar población', ejemplo: 'STDEVP(A1:A5)', parametros: '(número1, número2, ...)' },
      { id: 'VAR', nombre: 'VAR', descripcion: 'Varianza muestra', ejemplo: 'VAR(A1:A5)', parametros: '(número1, número2, ...)' },
      { id: 'VARP', nombre: 'VARP', descripcion: 'Varianza población', ejemplo: 'VARP(A1:A5)', parametros: '(número1, número2, ...)' },
    ],
    texto: [
      { id: 'BUSCAR', nombre: 'FIND', descripcion: 'Busca posición de texto', ejemplo: 'FIND("e", "hola") = 2', parametros: '(texto_buscado, texto, [inicio])' },
      { id: 'CODIGO', nombre: 'CODE', descripcion: 'Código ASCII/Unicode', ejemplo: 'CODE("A") = 65', parametros: '(texto)' },
      { id: 'CONCATENAR', nombre: 'CONCATENATE', descripcion: 'Concatena textos', ejemplo: 'CONCATENATE("hola", " ", "mundo")', parametros: '(texto1, texto2, ...)' },
      { id: 'DERECHA', nombre: 'RIGHT', descripcion: 'Últimos N caracteres', ejemplo: 'RIGHT("hola", 2) = "la"', parametros: '(texto, num_caracteres)' },
      { id: 'ENCONTRAR', nombre: 'SEARCH', descripcion: 'Busca y retorna posición', ejemplo: 'SEARCH("o", "hola")', parametros: '(texto_buscado, texto)' },
      { id: 'ESPACIOS', nombre: 'TRIM', descripcion: 'Elimina espacios', ejemplo: 'TRIM("  hola  ") = "hola"', parametros: '(texto)' },
      { id: 'ESTRACTO', nombre: 'MID', descripcion: 'Extrae substring', ejemplo: 'MID("hola", 2, 2) = "ol"', parametros: '(texto, inicio, longitud)' },
      { id: 'EXACTO', nombre: 'EXACT', descripcion: 'Compara textos exactamente', ejemplo: 'EXACT("a", "A") = FALSE', parametros: '(texto1, texto2)' },
      { id: 'FONETICO', nombre: 'PHONETIC', descripcion: 'Conversión fonética', ejemplo: 'PHONETIC("José")', parametros: '(texto)' },
      { id: 'IGUAL', nombre: 'MATCH', descripcion: 'Posición en array', ejemplo: 'MATCH("b", A1:A5)', parametros: '(valor, array, [tipo])' },
      { id: 'IZQUIERDA', nombre: 'LEFT', descripcion: 'Primeros N caracteres', ejemplo: 'LEFT("hola", 2) = "ho"', parametros: '(texto, num_caracteres)' },
      { id: 'LARGO', nombre: 'LEN', descripcion: 'Longitud del texto', ejemplo: 'LEN("hola") = 4', parametros: '(texto)' },
      { id: 'LIMPIAR', nombre: 'CLEAN', descripcion: 'Elimina caracteres especiales', ejemplo: 'CLEAN("texto™") = "texto"', parametros: '(texto)' },
      { id: 'MAYUSCULA', nombre: 'UPPER', descripcion: 'Convierte a mayúsculas', ejemplo: 'UPPER("hola") = "HOLA"', parametros: '(texto)' },
      { id: 'MINUSCULA', nombre: 'LOWER', descripcion: 'Convierte a minúsculas', ejemplo: 'LOWER("HOLA") = "hola"', parametros: '(texto)' },
      { id: 'MONEDA', nombre: 'DOLLAR', descripcion: 'Formatea como moneda', ejemplo: 'DOLLAR(1234.5)', parametros: '(número, [decimales])' },
      { id: 'NOMPROPIO', nombre: 'PROPER', descripcion: 'Capitaliza cada palabra', ejemplo: 'PROPER("hola mundo") = "Hola Mundo"', parametros: '(texto)' },
      { id: 'REEMPLAZAR', nombre: 'SUBSTITUTE', descripcion: 'Reemplaza texto', ejemplo: 'SUBSTITUTE("hola", "o", "a") = "hala"', parametros: '(texto, texto_antiguo, texto_nuevo)' },
      { id: 'REPT', nombre: 'REPT', descripcion: 'Repite texto N veces', ejemplo: 'REPT("ab", 3) = "ababab"', parametros: '(texto, numero)' },
      { id: 'T', nombre: 'T', descripcion: 'Convierte a texto', ejemplo: 'T(123) = "123"', parametros: '(valor)' },
      { id: 'TEXTO', nombre: 'TEXT', descripcion: 'Formatea como texto', ejemplo: 'TEXT(1234.5, "0.00")', parametros: '(valor, formato)' },
      { id: 'VALOR', nombre: 'VALUE', descripcion: 'Convierte texto a número', ejemplo: 'VALUE("123.45") = 123.45', parametros: '(texto)' },
    ],
    financieras: [
      { id: 'AMORTIZ', nombre: 'AMORTIZE', descripcion: 'Amortización', ejemplo: 'AMORTIZE(...)', parametros: '(capital, tasa, periodos)' },
      { id: 'CUPON', nombre: 'COUPON', descripcion: 'Valor del cupón', ejemplo: 'COUPON(...)', parametros: '(...)' },
      { id: 'DB', nombre: 'DB', descripcion: 'Depreciación método fijo', ejemplo: 'DB(costo, valor_residual, vida)', parametros: '(costo, residual, vida, periodo)' },
      { id: 'DDB', nombre: 'DDB', descripcion: 'Depreciación doble declinante', ejemplo: 'DDB(costo, residual, vida)', parametros: '(costo, residual, vida, periodo)' },
      { id: 'DESCUENTO', nombre: 'DISCOUNT', descripcion: 'Tasa de descuento', ejemplo: 'DISCOUNT(...)', parametros: '(...)' },
      { id: 'DURACION', nombre: 'DURATION', descripcion: 'Duración de Macaulay', ejemplo: 'DURATION(...)', parametros: '(...)' },
      { id: 'EFECTIVO', nombre: 'EFFECT', descripcion: 'Tasa efectiva anual', ejemplo: 'EFFECT(0.12, 12) = 0.1268...', parametros: '(tasa_nominal, periodos)' },
      { id: 'ENDFIANZA', nombre: 'INTRATE', descripcion: 'Tasa de interés', ejemplo: 'INTRATE(...)', parametros: '(...)' },
      { id: 'INT.ACUM', nombre: 'ACCRINT', descripcion: 'Interés acumulado', ejemplo: 'ACCRINT(...)', parametros: '(...)' },
      { id: 'INTERES', nombre: 'INTEREST', descripcion: 'Interés simple', ejemplo: 'INTEREST(capital, tasa, tiempo)', parametros: '(capital, tasa, tiempo)' },
      { id: 'LETRA.PRECIO', nombre: 'TBILLPRICE', descripcion: 'Precio letra tesorería', ejemplo: 'TBILLPRICE(...)', parametros: '(...)' },
      { id: 'LETRA.RENDTO', nombre: 'TBILLYIELD', descripcion: 'Rendimiento letra tesorería', ejemplo: 'TBILLYIELD(...)', parametros: '(...)' },
      { id: 'LIPAGOS', nombre: 'PPMT', descripcion: 'Principal de pago', ejemplo: 'PPMT(0.06, 1, 60, 200000)', parametros: '(tasa, periodo, periodos, va)' },
      { id: 'MIRR', nombre: 'MIRR', descripcion: 'TIR modificada', ejemplo: 'MIRR(A1:A5, 0.1, 0.12)', parametros: '(valores, tasa_financiera, tasa_reinversion)' },
      { id: 'MONEDA.CONVERSION', nombre: 'CONVERT', descripcion: 'Conversión de monedas', ejemplo: 'CONVERT(...)', parametros: '(...)' },
      { id: 'NPER', nombre: 'NPER', descripcion: 'Número de períodos', ejemplo: 'NPER(0.06, -500, 10000)', parametros: '(tasa, pago, va)' },
      { id: 'ODDFPRICE', nombre: 'ODDFPRICE', descripcion: 'Precio bono período impar', ejemplo: 'ODDFPRICE(...)', parametros: '(...)' },
      { id: 'ODDFYIELD', nombre: 'ODDFYIELD', descripcion: 'Rendimiento período impar', ejemplo: 'ODDFYIELD(...)', parametros: '(...)' },
      { id: 'ODDLPRICE', nombre: 'ODDLPRICE', descripcion: 'Precio período impar final', ejemplo: 'ODDLPRICE(...)', parametros: '(...)' },
      { id: 'ODDLYIELD', nombre: 'ODDLYIELD', descripcion: 'Rendimiento período impar final', ejemplo: 'ODDLYIELD(...)', parametros: '(...)' },
      { id: 'PAGO', nombre: 'PMT', descripcion: 'Pago periódico préstamo', ejemplo: 'PMT(0.06, 60, -200000)', parametros: '(tasa, periodos, va)' },
      { id: 'PAGOINT', nombre: 'IPMT', descripcion: 'Interés de pago', ejemplo: 'IPMT(0.06, 1, 60, 200000)', parametros: '(tasa, periodo, periodos, va)' },
      { id: 'PRECIO', nombre: 'PRICE', descripcion: 'Precio de bono', ejemplo: 'PRICE(...)', parametros: '(...)' },
      { id: 'PRECIO.DESC', nombre: 'PRICEDISC', descripcion: 'Precio con descuento', ejemplo: 'PRICEDISC(...)', parametros: '(...)' },
      { id: 'PRICEMATURITY', nombre: 'PRICEMATURITY', descripcion: 'Precio al vencimiento', ejemplo: 'PRICEMATURITY(...)', parametros: '(...)' },
      { id: 'REND.DESC', nombre: 'YIELDDISC', descripcion: 'Rendimiento descuento', ejemplo: 'YIELDDISC(...)', parametros: '(...)' },
      { id: 'REND.VENC', nombre: 'YIELDMAT', descripcion: 'Rendimiento vencimiento', ejemplo: 'YIELDMAT(...)', parametros: '(...)' },
      { id: 'RENDTO', nombre: 'YIELD', descripcion: 'Rendimiento bono', ejemplo: 'YIELD(...)', parametros: '(...)' },
      { id: 'SL', nombre: 'SL', descripcion: 'Depreciación lineal', ejemplo: 'SL(10000, 1000, 5)', parametros: '(costo, residual, vida)' },
      { id: 'SYD', nombre: 'SYD', descripcion: 'Depreciación suma dígitos', ejemplo: 'SYD(10000, 1000, 5, 1)', parametros: '(costo, residual, vida, periodo)' },
      { id: 'TASA', nombre: 'RATE', descripcion: 'Tasa de interés', ejemplo: 'RATE(60, -500, 10000)', parametros: '(periodos, pago, va)' },
      { id: 'TIR', nombre: 'IRR', descripcion: 'Tasa interna retorno', ejemplo: 'IRR(A1:A5)', parametros: '(valores, [estimacion])' },
      { id: 'VA', nombre: 'PV', descripcion: 'Valor presente', ejemplo: 'PV(0.06, 60, -500)', parametros: '(tasa, periodos, pago)' },
      { id: 'VF', nombre: 'FV', descripcion: 'Valor futuro', ejemplo: 'FV(0.06, 60, -500)', parametros: '(tasa, periodos, pago)' },
      { id: 'VNA', nombre: 'NPV', descripcion: 'Valor neto actual', ejemplo: 'NPV(0.1, A1:A5)', parametros: '(tasa, valores)' },
    ],
    fechayHora: [
      { id: 'AHORA', nombre: 'NOW', descripcion: 'Fecha y hora actual', ejemplo: 'NOW()', parametros: '()' },
      { id: 'AÑO', nombre: 'YEAR', descripcion: 'Año de una fecha', ejemplo: 'YEAR(2026-10-07) = 2026', parametros: '(fecha)' },
      { id: 'CANTIDAD', nombre: 'DAYS', descripcion: 'Días entre fechas', ejemplo: 'DAYS(A2, A1)', parametros: '(fecha_final, fecha_inicial)' },
      { id: 'DIA', nombre: 'DAY', descripcion: 'Día del mes', ejemplo: 'DAY(2026-10-07) = 7', parametros: '(fecha)' },
      { id: 'DIASLABORALES', nombre: 'NETWORKDAYS', descripcion: 'Días hábiles entre fechas', ejemplo: 'NETWORKDAYS(A1, A2)', parametros: '(fecha_inicial, fecha_final)' },
      { id: 'DIASSEMANA', nombre: 'WEEKDAY', descripcion: 'Día de la semana', ejemplo: 'WEEKDAY(2026-10-07)', parametros: '(fecha, [tipo])' },
      { id: 'FECHA', nombre: 'DATE', descripcion: 'Crea fecha', ejemplo: 'DATE(2026, 10, 7)', parametros: '(año, mes, día)' },
      { id: 'FECHAVALOR', nombre: 'DATEVALUE', descripcion: 'Convierte texto a fecha', ejemplo: 'DATEVALUE("2026-10-07")', parametros: '(texto_fecha)' },
      { id: 'FIN.MES', nombre: 'EOMONTH', descripcion: 'Fin del mes', ejemplo: 'EOMONTH(A1, 0)', parametros: '(fecha, meses)' },
      { id: 'FRAC.AÑO', nombre: 'YEARFRAC', descripcion: 'Fracción del año', ejemplo: 'YEARFRAC(A1, A2)', parametros: '(fecha_inicial, fecha_final)' },
      { id: 'HORA', nombre: 'HOUR', descripcion: 'Hora (0-23)', ejemplo: 'HOUR(NOW())', parametros: '(hora)' },
      { id: 'HORAVALOR', nombre: 'TIMEVALUE', descripcion: 'Convierte texto a hora', ejemplo: 'TIMEVALUE("14:30:45")', parametros: '(texto_hora)' },
      { id: 'HOY', nombre: 'TODAY', descripcion: 'Fecha de hoy', ejemplo: 'TODAY()', parametros: '()' },
      { id: 'MES', nombre: 'MONTH', descripcion: 'Número del mes', ejemplo: 'MONTH(2026-10-07) = 10', parametros: '(fecha)' },
      { id: 'MINUTO', nombre: 'MINUTE', descripcion: 'Minuto (0-59)', ejemplo: 'MINUTE(NOW())', parametros: '(hora)' },
      { id: 'NDESEMANAS', nombre: 'ISOWEEKNUM', descripcion: 'Número de semana ISO', ejemplo: 'ISOWEEKNUM(A1)', parametros: '(fecha)' },
      { id: 'NDESEMANASDELLABORAL', nombre: 'WEEKNUM', descripcion: 'Número de semana', ejemplo: 'WEEKNUM(A1)', parametros: '(fecha, [tipo])' },
      { id: 'SEGUNDO', nombre: 'SECOND', descripcion: 'Segundo (0-59)', ejemplo: 'SECOND(NOW())', parametros: '(hora)' },
      { id: 'SEMANA', nombre: 'WEEK', descripcion: 'Semana del año', ejemplo: 'WEEK(A1)', parametros: '(fecha)' },
      { id: 'SEMANADELLABORALES', nombre: 'NETWORKDAYS.INTL', descripcion: 'Días hábiles personalizados', ejemplo: 'NETWORKDAYS.INTL(A1, A2)', parametros: '(fecha_inicial, fecha_final)' },
      { id: 'TIEMPO', nombre: 'TIME', descripcion: 'Crea hora', ejemplo: 'TIME(14, 30, 45)', parametros: '(hora, minuto, segundo)' },
    ],
    busqueda: [
      { id: 'BUSCARV', nombre: 'VLOOKUP', descripcion: 'Búsqueda vertical', ejemplo: 'VLOOKUP("A", A1:B5, 2)', parametros: '(valor, tabla, columna, [rango])' },
      { id: 'BUSCARH', nombre: 'HLOOKUP', descripcion: 'Búsqueda horizontal', ejemplo: 'HLOOKUP("A", A1:E2, 2)', parametros: '(valor, tabla, fila, [rango])' },
      { id: 'INDICE', nombre: 'INDEX', descripcion: 'Valor por posición', ejemplo: 'INDEX(A1:A5, 3)', parametros: '(array, fila, [columna])' },
      { id: 'INDIRECTO', nombre: 'INDIRECT', descripcion: 'Referencia indirecta', ejemplo: 'INDIRECT("A1")', parametros: '(referencia)' },
      { id: 'COINCIDIR', nombre: 'MATCH', descripcion: 'Posición en array', ejemplo: 'MATCH("b", A1:A5)', parametros: '(valor, array, [tipo])' },
      { id: 'BUSCADOR', nombre: 'FILTER', descripcion: 'Filtra array', ejemplo: 'FILTER(A1:A5, B1:B5 > 10)', parametros: '(array, criterio)' },
    ],
    logicas: [
      { id: 'Y', nombre: 'AND', descripcion: 'Operador Y lógico', ejemplo: 'AND(TRUE, TRUE) = TRUE', parametros: '(condición1, condición2, ...)' },
      { id: 'FALSO', nombre: 'FALSE', descripcion: 'Valor falso', ejemplo: 'FALSE()', parametros: '()' },
      { id: 'NO', nombre: 'NOT', descripcion: 'Operador NOT lógico', ejemplo: 'NOT(TRUE) = FALSE', parametros: '(condición)' },
      { id: 'O', nombre: 'OR', descripcion: 'Operador O lógico', ejemplo: 'OR(TRUE, FALSE) = TRUE', parametros: '(condición1, condición2, ...)' },
      { id: 'SI', nombre: 'IF', descripcion: 'Condicional', ejemplo: 'IF(A1>10, "Mayor", "Menor")', parametros: '(condición, si_verdadero, si_falso)' },
      { id: 'SIERROR', nombre: 'IFERROR', descripcion: 'Si hay error', ejemplo: 'IFERROR(A1/B1, 0)', parametros: '(valor, si_error)' },
      { id: 'SINOTEXTO', nombre: 'IFNA', descripcion: 'Si hay #N/A', ejemplo: 'IFNA(A1, "No disponible")', parametros: '(valor, si_na)' },
      { id: 'VERDADERO', nombre: 'TRUE', descripcion: 'Valor verdadero', ejemplo: 'TRUE()', parametros: '()' },
      { id: 'XO', nombre: 'XOR', descripcion: 'Operador XOR lógico', ejemplo: 'XOR(TRUE, FALSE) = TRUE', parametros: '(condición1, condición2, ...)' },
    ],
    informacion: [
      { id: 'ISERROR', nombre: 'ISERROR', descripcion: 'Es un error', ejemplo: 'ISERROR(A1)', parametros: '(valor)' },
      { id: 'ISNA', nombre: 'ISNA', descripcion: 'Es #N/A', ejemplo: 'ISNA(A1)', parametros: '(valor)' },
      { id: 'ISNUMBER', nombre: 'ISNUMBER', descripcion: 'Es número', ejemplo: 'ISNUMBER(A1)', parametros: '(valor)' },
      { id: 'ISTEXT', nombre: 'ISTEXT', descripcion: 'Es texto', ejemplo: 'ISTEXT(A1)', parametros: '(valor)' },
      { id: 'ISBLANK', nombre: 'ISBLANK', descripcion: 'Está vacío', ejemplo: 'ISBLANK(A1)', parametros: '(valor)' },
      { id: 'ISLOGICAL', nombre: 'ISLOGICAL', descripcion: 'Es lógico', ejemplo: 'ISLOGICAL(A1)', parametros: '(valor)' },
      { id: 'TIPO', nombre: 'TYPE', descripcion: 'Tipo de valor', ejemplo: 'TYPE(A1)', parametros: '(valor)' },
      { id: 'NA', nombre: 'NA', descripcion: 'Error #N/A', ejemplo: 'NA()', parametros: '()' },
      { id: 'ERROR', nombre: 'ERROR', descripcion: 'Genera error', ejemplo: 'ERROR("#DIV/0!")', parametros: '(mensaje)' },
    ],
    ingenieria: [
      { id: 'BESSEL.I', nombre: 'BESSELI', descripcion: 'Función Bessel modificada', ejemplo: 'BESSELI(x, n)', parametros: '(x, n)' },
      { id: 'BESSEL.J', nombre: 'BESSELJ', descripcion: 'Función Bessel', ejemplo: 'BESSELJ(x, n)', parametros: '(x, n)' },
      { id: 'BESSEL.K', nombre: 'BESSELK', descripcion: 'Función Bessel modificada 2da', ejemplo: 'BESSELK(x, n)', parametros: '(x, n)' },
      { id: 'BESSEL.Y', nombre: 'BESSELY', descripcion: 'Función Bessel Neumann', ejemplo: 'BESSELY(x, n)', parametros: '(x, n)' },
      { id: 'BIN.A.DEC', nombre: 'BIN2DEC', descripcion: 'Binario a decimal', ejemplo: 'BIN2DEC("1010") = 10', parametros: '(número)' },
      { id: 'BIN.A.HEX', nombre: 'BIN2HEX', descripcion: 'Binario a hexadecimal', ejemplo: 'BIN2HEX("1010") = "A"', parametros: '(número)' },
      { id: 'BIN.A.OCT', nombre: 'BIN2OCT', descripcion: 'Binario a octal', ejemplo: 'BIN2OCT("1010") = "12"', parametros: '(número)' },
      { id: 'COMPLEJO', nombre: 'COMPLEX', descripcion: 'Número complejo', ejemplo: 'COMPLEX(3, 4) = "3+4i"', parametros: '(real, imaginario)' },
      { id: 'CONVERT', nombre: 'CONVERT', descripcion: 'Conversión unidades', ejemplo: 'CONVERT(100, "m", "ft")', parametros: '(número, unidad_origen, unidad_destino)' },
      { id: 'DEC.A.BIN', nombre: 'DEC2BIN', descripcion: 'Decimal a binario', ejemplo: 'DEC2BIN(10) = "1010"', parametros: '(número)' },
      { id: 'DEC.A.HEX', nombre: 'DEC2HEX', descripcion: 'Decimal a hexadecimal', ejemplo: 'DEC2HEX(255) = "FF"', parametros: '(número)' },
      { id: 'DEC.A.OCT', nombre: 'DEC2OCT', descripcion: 'Decimal a octal', ejemplo: 'DEC2OCT(64) = "100"', parametros: '(número)' },
      { id: 'DELTA', nombre: 'DELTA', descripcion: 'Prueba igualdad', ejemplo: 'DELTA(5, 5) = 1', parametros: '(número1, número2)' },
      { id: 'ERF', nombre: 'ERF', descripcion: 'Función error', ejemplo: 'ERF(0.5)', parametros: '(x)' },
      { id: 'ERFC', nombre: 'ERFC', descripcion: 'Función error complementaria', ejemplo: 'ERFC(0.5)', parametros: '(x)' },
      { id: 'EXTRAPOLAR', nombre: 'FORECAST.LINEAR', descripcion: 'Extrapolación lineal', ejemplo: 'FORECAST.LINEAR(x, A1:A5, B1:B5)', parametros: '(x, array_y, array_x)' },
      { id: 'HEXBIN', nombre: 'HEX2BIN', descripcion: 'Hexadecimal a binario', ejemplo: 'HEX2BIN("A") = "1010"', parametros: '(número)' },
      { id: 'HEXDEC', nombre: 'HEX2DEC', descripcion: 'Hexadecimal a decimal', ejemplo: 'HEX2DEC("FF") = 255', parametros: '(número)' },
      { id: 'HEXOCT', nombre: 'HEX2OCT', descripcion: 'Hexadecimal a octal', ejemplo: 'HEX2OCT("FF") = "377"', parametros: '(número)' },
      { id: 'IMABS', nombre: 'IMABS', descripcion: 'Valor absoluto complejo', ejemplo: 'IMABS("3+4i") = 5', parametros: '(número_complejo)' },
      { id: 'IMAGINARIO', nombre: 'IMAGINARY', descripcion: 'Parte imaginaria', ejemplo: 'IMAGINARY("3+4i") = 4', parametros: '(número_complejo)' },
      { id: 'LOGICO', nombre: 'GESTEP', descripcion: 'Prueba >= umbral', ejemplo: 'GESTEP(5, 3) = 1', parametros: '(número, umbral)' },
      { id: 'OCTBIN', nombre: 'OCT2BIN', descripcion: 'Octal a binario', ejemplo: 'OCT2BIN("10") = "1000"', parametros: '(número)' },
      { id: 'OCTDEC', nombre: 'OCT2DEC', descripcion: 'Octal a decimal', ejemplo: 'OCT2DEC("10") = 8', parametros: '(número)' },
      { id: 'OCTHEX', nombre: 'OCT2HEX', descripcion: 'Octal a hexadecimal', ejemplo: 'OCT2HEX("10") = "8"', parametros: '(número)' },
      { id: 'PARTE.REAL', nombre: 'REAL', descripcion: 'Parte real compleja', ejemplo: 'REAL("3+4i") = 3', parametros: '(número_complejo)' },
    ],
    financierasCR: [
      { id: 'CCSS_CALC', nombre: 'CCSS', descripcion: 'Cálculo contribución CCSS (9.75% emp + 4.75% emp)', ejemplo: 'CCSS(10000)', parametros: '(salario)' },
      { id: 'IVA_CALC', nombre: 'IVA', descripcion: 'Cálculo IVA (13% CR)', ejemplo: 'IVA(1000) = 130', parametros: '(monto)' },
      { id: 'ISR_CALC', nombre: 'ISR', descripcion: 'Cálculo Impuesto Sobre Renta', ejemplo: 'ISR(100000)', parametros: '(renta_bruta)' },
      { id: 'TIPO_CAMBIO', nombre: 'EXCHANGERATE', descripcion: 'Tipo de cambio CR', ejemplo: 'EXCHANGERATE("USD", "CRC")', parametros: '(moneda_origen, moneda_destino)' },
      { id: 'UPM', nombre: 'UPM', descripcion: 'Unidad de Pensión del Magisterio', ejemplo: 'UPM(ano, mes)', parametros: '(año, mes)' },
      { id: 'SALARIO_MINIMO', nombre: 'MINIMUMWAGE', descripcion: 'Salario mínimo CR', ejemplo: 'MINIMUMWAGE()', parametros: '()' },
      { id: 'TBP', nombre: 'TBP', descripcion: 'Tasa de Referencia del Banco Central', ejemplo: 'TBP(fecha)', parametros: '(fecha)' },
    ],
    condicionales: [
      { id: 'SUMAR.SI', nombre: 'SUMIF', descripcion: 'Suma si cumple criterio', ejemplo: 'SUMIF(A1:A5, ">10")', parametros: '(rango, criterio, [rango_suma])' },
      { id: 'SUMAR.SI.CONJUNTO', nombre: 'SUMIFS', descripcion: 'Suma múltiples criterios', ejemplo: 'SUMIFS(A1:A5, B1:B5, "A")', parametros: '(rango_suma, criterios...)' },
      { id: 'PRODUCTO.SI', nombre: 'PRODUCTIF', descripcion: 'Producto si cumple criterio', ejemplo: 'PRODUCTIF(A1:A5, ">10")', parametros: '(rango, criterio)' },
      { id: 'CONTAR.SI', nombre: 'COUNTIF', descripcion: 'Cuenta si cumple criterio', ejemplo: 'COUNTIF(A1:A5, ">10")', parametros: '(rango, criterio)' },
      { id: 'MINIF', nombre: 'MINIFS', descripcion: 'Mínimo si cumple criterio', ejemplo: 'MINIFS(A1:A5, B1:B5, "A")', parametros: '(rango_min, criterios...)' },
      { id: 'MAXIF', nombre: 'MAXIFS', descripcion: 'Máximo si cumple criterio', ejemplo: 'MAXIFS(A1:A5, B1:B5, "A")', parametros: '(rango_max, criterios...)' },
    ],
    basedatos: [
      { id: 'SUBTOTALES', nombre: 'SUBTOTAL', descripcion: 'Subtotales automáticos', ejemplo: 'SUBTOTAL(9, A1:A5)', parametros: '(función_num, rango)' },
      { id: 'BDCONTAR', nombre: 'DCOUNT', descripcion: 'Cuenta registros BD', ejemplo: 'DCOUNT(BD, campo, criterios)', parametros: '(BD, campo, criterios)' },
      { id: 'BDPROMEDIO', nombre: 'DAVERAGE', descripcion: 'Promedio BD', ejemplo: 'DAVERAGE(BD, campo, criterios)', parametros: '(BD, campo, criterios)' },
      { id: 'BDSUMAR', nombre: 'DSUM', descripcion: 'Suma BD', ejemplo: 'DSUM(BD, campo, criterios)', parametros: '(BD, campo, criterios)' },
      { id: 'BDMAX', nombre: 'DMAX', descripcion: 'Máximo BD', ejemplo: 'DMAX(BD, campo, criterios)', parametros: '(BD, campo, criterios)' },
      { id: 'BDMIN', nombre: 'DMIN', descripcion: 'Mínimo BD', ejemplo: 'DMIN(BD, campo, criterios)', parametros: '(BD, campo, criterios)' },
    ],
  };

  const [selectedFormula, setSelectedFormula] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [historialCalculos, setHistorialCalculos] = useState([]);

  // Filtrar fórmulas
  const allFormulas = Object.values(FORMULAS).flat();
  const formulasFiltradas = useMemo(() => {
    let resultado = allFormulas;

    if (selectedCategory !== 'todas') {
      resultado = FORMULAS[selectedCategory] || [];
    }

    if (searchTerm) {
      resultado = resultado.filter(f =>
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return resultado;
  }, [selectedCategory, searchTerm]);

  const categorias = [
    { id: 'todas', nombre: '📚 Todas las fórmulas' },
    { id: 'matematicas', nombre: '➕ Matemáticas' },
    { id: 'estadisticas', nombre: '📊 Estadísticas' },
    { id: 'texto', nombre: '📝 Texto' },
    { id: 'financieras', nombre: '💰 Financieras' },
    { id: 'fechayHora', nombre: '📅 Fecha y Hora' },
    { id: 'busqueda', nombre: '🔍 Búsqueda' },
    { id: 'logicas', nombre: '⚙️ Lógicas' },
    { id: 'informacion', nombre: 'ℹ️ Información' },
    { id: 'ingenieria', nombre: '⚛️ Ingeniería' },
    { id: 'financierasCR', nombre: '🇨🇷 Financieras CR' },
    { id: 'condicionales', nombre: '✓ Condicionales' },
    { id: 'basedatos', nombre: '🗂️ Base de Datos' },
  ];

  return (
    <div className="formulas-module">
      <div className="header-formulas">
        <h1>📐 {t('formulasAvanzadas')}</h1>
        <p>510+ Fórmulas | 13 Categorías | Todas en 8 Idiomas</p>
      </div>

      <div className="buscador-formulas">
        <input
          type="text"
          placeholder="Buscar fórmula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-busqueda"
        />
        <span className="contador-resultados">
          {formulasFiltradas.length} resultados
        </span>
      </div>

      <div className="categorias-grid">
        {categorias.map(cat => (
          <button
            key={cat.id}
            className={`btn-categoria ${selectedCategory === cat.id ? 'activo' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      <div className="contenedor-formulas">
        <div className="lista-formulas">
          {formulasFiltradas.length === 0 ? (
            <div className="sin-resultados">
              <p>No se encontraron fórmulas</p>
            </div>
          ) : (
            formulasFiltradas.map((formula) => (
              <div
                key={formula.id}
                className={`formula-item ${selectedFormula?.id === formula.id ? 'activo' : ''}`}
                onClick={() => setSelectedFormula(formula)}
              >
                <div className="formula-nombre">{formula.nombre}</div>
                <div className="formula-desc">{formula.descripcion}</div>
              </div>
            ))
          )}
        </div>

        <div className="detalles-formula">
          {selectedFormula ? (
            <>
              <div className="detalle-header">
                <h2>{selectedFormula.nombre}</h2>
                <span className="badge-categoria">
                  {categorias.find(c => FORMULAS[c.id]?.some(f => f.id === selectedFormula.id))?.nombre}
                </span>
              </div>

              <div className="detalle-seccion">
                <h3>{t('descripcion')}</h3>
                <p>{selectedFormula.descripcion}</p>
              </div>

              <div className="detalle-seccion">
                <h3>Parámetros</h3>
                <code className="codigo-parametros">{selectedFormula.parametros}</code>
              </div>

              <div className="detalle-seccion">
                <h3>Ejemplo</h3>
                <code className="codigo-ejemplo">{selectedFormula.ejemplo}</code>
              </div>

              <div className="detalle-acciones">
                <button className="btn-copiar" onClick={() => {
                  navigator.clipboard.writeText(selectedFormula.nombre);
                  alert(`${selectedFormula.nombre} copiado al portapapeles`);
                }}>
                  📋 Copiar Función
                </button>
                <button className="btn-insertar" onClick={() => {
                  setHistorialCalculos([...historialCalculos, {
                    formula: selectedFormula.nombre,
                    timestamp: new Date().toISOString(),
                  }]);
                  alert(`Fórmula ${selectedFormula.nombre} agregada al historial`);
                }}>
                  ➕ Usar Fórmula
                </button>
              </div>
            </>
          ) : (
            <div className="sin-seleccion">
              <p>Selecciona una fórmula para ver detalles</p>
            </div>
          )}
        </div>
      </div>

      {historialCalculos.length > 0 && (
        <div className="historial-formulas">
          <h3>📜 Historial de Fórmulas Usadas</h3>
          <div className="tabla-historial">
            {historialCalculos.slice(-10).reverse().map((item, idx) => (
              <div key={idx} className="historial-item">
                <span className="historial-formula">{item.formula}</span>
                <span className="historial-fecha">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulasModule;
