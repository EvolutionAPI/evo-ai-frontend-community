# Components/UI

Esta pasta contém componentes de interface reutilizáveis e de baixo nível que são os blocos de construção básicos da aplicação.

## Propósito

Armazenar componentes de UI básicos que implementam o design system da empresa. Estes componentes são:

- Atômicos e focados em uma única responsabilidade
- Altamente reutilizáveis em toda a aplicação
- Independentes de lógica de negócio
- Concentrados em apresentação e interação básica

## Convenções

- Cada componente deve estar em seu próprio arquivo
- Use PascalCase para nomes de componentes e arquivos (ex: `Button.tsx`, `Card.tsx`)
- Todos os componentes devem ter props tipadas com TypeScript usando interfaces
- Prefixar interfaces de props com "I" (ex: `IButtonProps`)
- Componentes devem ser exportados como default
- Adicione JSDoc para documentar os componentes
- Implemente validação de props quando necessário
- Use forwardRef para componentes que precisam passar referências

## Estrutura de Arquivos

```
ui/
  ├── Button/
  │    ├── Button.tsx
  │    ├── Button.test.tsx (quando aplicável)
  │    └── index.ts
  ├── Card/
  │    ├── Card.tsx
  │    ├── CardHeader.tsx
  │    ├── CardBody.tsx
  │    ├── CardFooter.tsx
  │    └── index.ts
  └── ...
```

## Exemplos de Uso

```tsx
// Button.tsx
import React from 'react';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

/**
 * Componente Button básico que segue o design system da empresa
 */
const Button: React.FC<IButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${isLoading ? 'loading' : ''} ${className || ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

## Uso em Componentes de Alto Nível

```tsx
import Button from '@/components/ui/Button';

const FormSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // lógica de submissão
    setIsSubmitting(false);
  };

  return (
    <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmit}>
      Salvar
    </Button>
  );
};
```

## Manutenção

- Mantenha os componentes simples e focados em uma única responsabilidade
- Adicione testes para garantir funcionamento consistente
- Documente props complexas e comportamentos não óbvios
- Siga as diretrizes do design system da empresa
- Considere acessibilidade em todos os componentes
