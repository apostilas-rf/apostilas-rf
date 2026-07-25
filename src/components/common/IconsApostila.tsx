interface IconProps {
  size?: number
  className?: string
}

const ICONS_PATH = '/ICONS APOSTILA'

// Mapeamento de ícones disponíveis
const IconMap = {
  estrela: 'ESTRELA VERDE.png',
  eclipseLaranja: 'ECLIPSE LARANJA FORTE.png',
  eclipseVerde: 'ECLIPSE VERDE.png',
  logoVerde: 'LOGO ICON VERDE.png',
  setaCirculoVerde: 'Seta-circulo VERDE.png',
  setaQuadradoVerde: 'Seta-quadrado VERDE.png',
  florQuadrado: 'flor-quadrado VERDE.png',
} as const

type IconName = keyof typeof IconMap

interface CustomIconProps extends IconProps {
  name: IconName
  alt?: string
}

export function Icon({ name, size = 24, className = '', alt = name }: CustomIconProps) {
  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <img
        src={`${ICONS_PATH}/${IconMap[name]}`}
        alt={alt}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  )
}

// Ícones específicos para seções (tamanho padrão 28px)
export function FotoIcon({ size = 28 }: IconProps) {
  return <Icon name="estrela" size={size} alt="Foto" />
}

export function InformacaoIcon({ size = 28 }: IconProps) {
  return <Icon name="setaCirculoVerde" size={size} alt="Informações" />
}

export function SenhaIcon({ size = 28 }: IconProps) {
  return <Icon name="florQuadrado" size={size} alt="Senha" />
}

export function PreferenciaIcon({ size = 28 }: IconProps) {
  return <Icon name="eclipseVerde" size={size} alt="Preferências" />
}

// Menu lateral (tamanho padrão 20px)
export function MenuIcon({ size = 20 }: IconProps) {
  return <Icon name="setaCirculoVerde" size={size} alt="Menu" />
}
