// TEMA DE DISEÑO: NEÓN-CYBER FUTURISTA (Extraído de image_1.png)
import { APP_CONFIG } from '../constants/appConfig'; // Importamos el nombre global

export const THEME = {
  // Aquí integramos el nombre de la app para usarlo en títulos
  appTitle: APP_CONFIG.name,

  colors: {
    background: {
      deepSpace: '#04001A', // Fondo oscuro profundo, casi negro
      darkPurple: '#11022A', // Degradado secundario de fondo
    },
    primary: {
      cyanElectric: '#00FFFF', // El cian neón principal para bordes y acentos
      blueVibrant: '#1E90FF', // Azul vibrante para botones secundarios
    },
    secondary: {
      magentaNeon: '#FF00FF', // Magenta neón para efectos de 'Thinking' y premium
      pinkHot: '#FF1493',    // Rosa fuerte para alertas o juegos
    },
    text: {
      main: '#FFFFFF',       // Blanco puro para texto principal
      cyanGlow: '#CCFFFF',   // Blanco con tinte cian para texto con brillo
      subtle: '#A0A0A0',     // Gris sutil para subtextos
    },
    glow: {
      blue: 'rgba(30, 144, 255, 0.6)',
      cyan: 'rgba(0, 255, 255, 0.6)',
      magenta: 'rgba(255, 0, 255, 0.6)',
    },
  },
  typography: {
    fontFamily: 'Russo One, sans-serif', // Tipografía futurista, geométrica, de peso fuerte
    sizes: {
      header: 24,
      title: 20,
      body: 16,
      small: 12,
    },
  },
  borders: {
    radius: {
      standard: 12,   // Esquinas redondeadas suaves (como en la tarjeta de 'Menu')
      pill: 25,       // Para botones tipo píldora (como el botón 'SAVE')
    },
    width: {
      thin: 1,
      glow: 2,       // Un borde ligeramente más grueso para aplicar efectos de neón
    },
  },
  effects: {
    backdropBlur: '10px', // Efecto de desenfoque de fondo para overlays
    boxShadow: `0 0 10px rgba(0, 255, 255, 0.5)`, // Brillo neón externo estándar
  },
};
