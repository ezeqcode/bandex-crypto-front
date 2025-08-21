# Orientações inicias

Esse projeto contempla o frontend do bitpix.

## Siga o desenvolvimento seguindo os seguintes padrões

- Gerais
  - Versão do nodejs v20.12.1
  - Nomes de arquivos e pastas sempre com a primeira letra minuscula, salvo os arquivos .tsx que devem ter sua primeira letra maiúsculas 
  - Design deve ser atomico, sempre dividir em componentes menores
  - Separar ao máximo view da lógica usando custom hooks
  - Temas disponíveis - Dark e Light ambos com toggler da class (Tailwind)
  - Sempre organizar por pasta, agrupando por page, caso seja usado em mais de um lugar usar a subpasta "shared" (crie caso não exista)

- Nomeclatura dos arquivos
  - Services:
    - Sempre utilizar da seguinte forma nome.service.ts
  - Utils:
    - Sempre utilizar da seguinte forma nome.util.ts
  - Hooks:
    - Sempre utilizar da seguinte forma nome.hook.ts ou nome.hook.tsx

- Interfaces
  - Todas as interfaces devem ser colocadas na pasta interface e exportadas, organizar por uso.


- ESLINT
  - ATIVO
 
- FIGMA
  https://www.figma.com/design/HERhUqjxypooOJc6ydMCRh/Bitpix?node-id=106-484&t=NSUqgeJE0k7tF9RE-0
 
