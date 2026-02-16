interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'outline' | 'cta';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

const Button = ({
  text,
  onClick,
  variant = 'default',
  type = 'button',
  className = '',
  disabled = false,
}: ButtonProps) => {
  const variantClasses = {
    default: 'btn-default',
    ghost: 'login',
    outline: 'btn-outline',
    cta: 'cta',
  };

  const baseClass = variantClasses[variant] || variantClasses.default;

  if (variant === 'cta' && !onClick) {
    return (
      <a href="#upload" className={`${baseClass} ${className}`}>
        {text}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClass} ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
