import { useWindowDimensions } from 'react-native'

// ─── Puntos de quiebre compartidos por toda la app ───────────────
// phone:   < 600   (celular, en vertical u horizontal)
// tablet:  600–1023 (iPad, celular grande acostado)
// desktop: >= 1024  (laptop, PC de escritorio, navegador ancho)
const BREAKPOINT_TABLET = 600
const BREAKPOINT_DESKTOP = 1024

// Hook central de responsividad. Usa useWindowDimensions (no
// Dimensions.get, que se congela en el valor que tenía al cargar el
// módulo) para que la app reaccione en vivo a rotar el celular o a
// redimensionar la ventana en escritorio/navegador.
export function useResponsive() {
  const { width, height } = useWindowDimensions()

  const isPhone = width < BREAKPOINT_TABLET
  const isTablet = width >= BREAKPOINT_TABLET && width < BREAKPOINT_DESKTOP
  const isDesktop = width >= BREAKPOINT_DESKTOP
  const isLandscape = width > height

  // Ancho máximo de contenido: en celular ocupa todo el ancho: en
  // tablet/escritorio se limita para que no se vea estirado de borde
  // a borde, y el contenido queda centrado.
  const maxContentWidth = isDesktop ? 960 : isTablet ? 720 : width

  // Columnas sugeridas para grillas de tarjetas (Inicio, Funciones).
  const columns = isDesktop ? 4 : isTablet ? 3 : 2

  return { width, height, isPhone, isTablet, isDesktop, isLandscape, maxContentWidth, columns }
}
