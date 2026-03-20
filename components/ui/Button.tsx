import type { ReactNode } from 'react';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'outline' | 'cta';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

const Button = ({
  text,
  onClick,
  variant = 'default',
  type = 'button',
  className = '',
  disabled = false,
  icon,
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
        {icon && <span className="btn-icon">{icon}</span>}
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
      {icon && <span className="btn-icon">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
