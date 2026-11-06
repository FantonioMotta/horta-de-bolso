# Horta de Bolso — sua horta idle

[![Jogar](https://img.shields.io/badge/jogar-horta--de--bolso.pages.dev-5a8f3d)](https://horta-de-bolso.pages.dev)
[![Cloudflare Pages](https://img.shields.io/badge/deploy-Cloudflare%20Pages-f38020?logo=cloudflarepages&logoColor=white)](https://horta-de-bolso.pages.dev)
[![React 18](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-instal%C3%A1vel%20e%20offline-8fc5da)](https://horta-de-bolso.pages.dev)

> Uma horta idle em pt-BR que cresce enquanto você faz outra coisa.

Plante, regue, colha para a sacola, venda a produção, cumpra pedidos da feira e use as moedas para liberar sementes, fertilizantes e mais espaço. No galinheiro, galinhas põem ovos, pintinhos crescem e novos moradores podem ser comprados ou vendidos.

**Jogue agora em [horta-de-bolso.pages.dev](https://horta-de-bolso.pages.dev)** — instale como app e continue offline.

Toda a arte é procedural (SVG e CSS) e todo o áudio é sintetizado com Web Audio API — o projeto não usa imagens, fontes ou arquivos de som externos.

O progresso fica no `localStorage` do navegador e pode ser exportado/importado pela loja, na seção **Backup do progresso**.

## Rodar o projeto

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

O servidor de desenvolvimento abre em `http://127.0.0.1:5173/`.

Outros comandos:

```bash
npm run typecheck   # valida o TypeScript
npm run build       # gera a versão de produção em dist/
npm run preview     # serve a build de produção
```

Para testar a build:

```bash
npm run build
npm run preview
```

## Instalar como aplicativo (PWA)

A build de produção inclui `manifest.webmanifest` e um service worker (`sw.js`), então o Horta de Bolso funciona instalado e também offline depois da primeira visita.

1. Rode `npm run build` e `npm run preview`.
2. Abra o endereço mostrado pelo preview no Chrome ou Edge.
3. Use o ícone de instalação na barra de endereço (ou o menu do navegador → “Instalar Horta de Bolso”).

O manifesto usa `display: "window"`, então o app abre em uma janela normal do sistema, com moldura, e não em modo standalone sem bordas. O service worker guarda o app em cache; o progresso fica no `localStorage` do navegador.

> Observação: como o service worker tem escopo no diretório publicado, use a build de produção (`preview` ou um servidor estático) para testar a instalação. O servidor de desenvolvimento serve os arquivos sem o cache do PWA.

## Como jogar

- **Plantar:** escolha uma semente na bandeja e clique em um canteiro vazio. O custo da semente é descontado na hora.
- **Regar:** selecione o regador (ou pressione `W`) e clique em um canteiro. A terra úmida acelera o crescimento; terra seca cresce bem mais devagar.
- **Colher:** quando a planta estiver pronta, clique nela. A colheita vai para a sacola, não vira moeda automaticamente.
- **Vender:** abra a **Sacola** no topo e venda uma espécie ou tudo de uma vez. A sacola tem limite de espaço.
- **Fertilizar:** compre Húmus ou Cobertura na loja, selecione o adubo na bandeja e clique num canteiro vazio, antes de plantar. Cada germinação aceita só um fertilizante.
- **Pedidos:** abra a **Caderneta de pedidos** no topo. Os pedidos pedem uma quantidade de uma espécie, pagam um extra e têm prazo real para entrega; use os itens da sacola.
- **Galinheiro:** use os botões **Horta / Galinheiro** no topo da cena (ou tecle `G`) para trocar de tela. No galinheiro, compre galinhas e galos, recolha e venda ovos, choque pintinhos e amplie o espaço.
- **Loja:** libere espécies novas, compre fertilizantes e amplie a sacola e os canteiros.
- **Nome:** clique no lápis ao lado do nome para renomear a horta. O nome aparece também na plaquinha do canteiro.
- **Backup:** na loja, use **Exportar save** para baixar um arquivo `.json` e **Importar save** para restaurar o progresso em outro navegador.
- **Som:** o botão no topo liga e desliga o áudio. A escolha fica salva.
- **Atalhos:** `1`–`6` selecionam sementes; `7` e `8` selecionam fertilizantes; `W` seleciona o regador; `G` alterna entre a horta e o galinheiro; `H` volta para a horta; `L`, `I` e `P` abrem a loja, a sacola e os pedidos; `Esc` fecha painéis e diálogos.

### Espécies

| Espécie | Semente | Liberação | Venda | Crescimento |
| --- | ---: | ---: | ---: | ---: |
| Alface | 8 | já liberada | 26 | 90 s |
| Cenoura | 22 | 90 | 85 | 4 min |
| Morango | 55 | 260 | 230 | 7 min |
| Tomate | 130 | 650 | 560 | 10 min |
| Abóbora | 300 | 1.500 | 1.400 | 15 min |
| Girassol | 650 | 3.200 | 3.200 | 20 min |

Os tempos acima valem com a terra molhada. Com a terra seca, o crescimento cai para 14% da velocidade. A umidade vai baixando com o tempo; o indicador em cada canteiro mostra quanto ainda resta.

### Canteiros

O jogo começa com 4 espaços e 24 moedas. As expansões custam 140, 450 e 1.600 moedas e levam o total para 6, 8 e 12 canteiros.

### Sacola e vendas

A sacola começa com 8 lugares. Cada colheita ocupa um lugar e, quando ela está cheia, é preciso vender ou entregar algo antes de colher mais. As melhorias custam 120, 380, 1.100 e 2.800 moedas e aumentam a capacidade para 12, 20, 32 e 48.

A venda é sempre manual, na aba **Sacola**. Você pode vender uma espécie inteira ou tudo de uma vez; os pedidos usam os mesmos itens.

### Fertilizantes

| Fertilizante | Preço | Efeito |
| --- | ---: | --- |
| Húmus | 16 | crescimento 35% mais rápido |
| Cobertura | 12 | a terra demora o dobro para secar |

O adubo é aplicado em um canteiro vazio antes da semente, gasta uma dose do estoque e vale só para aquela germinação. Depois de colher, o canteiro fica livre e pode receber outro adubo.

### Pedidos

A caderneta mantém até 3 pedidos ativos. Cada pedido pede uma quantidade de uma espécie liberada, oferece de 30% a 70% a mais do que a venda direta e tem prazo de 3 a 5 minutos e meio. O primeiro pedido chega cerca de 30 segundos depois de começar, e novos pedidos aparecem com o tempo — inclusive com a janela fechada. Pedidos vencidos saem da caderneta sem pagar nada.

### Galinheiro

A horta e o galinheiro são telas separadas, alternadas pelos botões no topo da cena (ou por `G` / `H`). O galinheiro começa vazio, com espaço para 4 moradores e 6 ovos no ninho.

| Morador | Compra | Venda | O que faz |
| --- | ---: | ---: | --- |
| Galinha | 55 | 70 | põe um ovo a cada 2 min e meio |
| Galo | 85 | 110 | necessário para chocar os ovos |

- **Ovos:** cada ovo vale 15 moedas e pode ser vendido direto na bandeja do galinheiro ou no painel. O ninho guarda no máximo a capacidade do espaço atual.
- **Chocar:** com pelo menos um galo e 3 ovos no ninho, é possível chocar um pintinho. Ele leva 4 minutos para virar adulto e tem 32% de chance de nascer galo. Até 6 pintinhos podem crescer ao mesmo tempo.
- **Pintinhos:** podem ser vendidos ainda pequenos por 40 moedas ou esperar para reforçar o galinheiro.
- **Expansão:** o espaço cresce para 6 moradores e 10 ovos por 220 moedas, depois 9 e 16 por 780 e, por fim, 14 e 24 por 2.200.
- **Tempo offline:** a postura e o crescimento dos pintinhos continuam com a janela fechada; ao voltar, o resumo informa os ovos novos e os pintinhos que cresceram.

## Progresso, backup e tempo offline

- O jogo salva automaticamente no `localStorage`, na chave `orta.save.v1`. O formato atual é `v: 3`, com migração automática de saves `v: 1` e `v: 2` (saves antigos ganham o galinheiro padrão e abrem na horta).
- A tela ativa também fica salva: ao voltar, o jogo reabre na horta ou no galinheiro, conforme onde você estava.
- Ao voltar, o tempo fora do jogo é aplicado ao crescimento e à umidade da horta, à postura das galinhas e ao crescimento dos pintinhos. Um resumo mostra o que amadureceu, o que ainda está crescendo, o que ficou com sede, os pedidos e as novidades do galinheiro.
- O relógio do jogo usa o horário real do sistema para o ciclo de dia e noite.
- Limpar os dados do site apaga a horta; não há conta nem servidor.
- **Exportar save** baixa um arquivo `horta-de-bolso-save-AAAA-MM-DD.json` com uma fotografia do progresso. **Importar save** valida o arquivo, pede confirmação e substitui a horta atual. O backup também aceita um save antigo `v: 1` ou `v: 2`.
- O arquivo importado não aplica o tempo em que ficou guardado: plantas, moedas, sacola e pedidos voltam como estavam no momento da exportação. Pedidos já vencidos são descartados.
- Ao importar, o progresso é gravado imediatamente no navegador atual.

## Áudio

Todo o som é gerado em tempo real:

- vento com camadas lentas e filtro passa-baixa, em volume baixo;
- pads e plucks de lo-fi com delay, mais presentes à noite;
- pássaros de dia, grilos à noite, além dos efeitos de plantar, regar, colher, comprar e expandir.

O áudio só começa depois da primeira interação, como exigem os navegadores. O botão de som controla o volume geral e a preferência é salva.

## Desenvolvimento

### Prévia de horários

No servidor de desenvolvimento, o parâmetro `?hora=HH:MM` força um horário do ciclo de dia e noite:

```text
http://127.0.0.1:5173/?hora=22
http://127.0.0.1:5173/?hora=06:30
```

Isso é apenas uma ferramenta de desenvolvimento; em produção o parâmetro é ignorado.

### Áudio no console

Em desenvolvimento, o motor de áudio fica exposto em `window.__ortaAudio` para inspeção (estado do `AudioContext`, volumes das trilhas e modo noite). Em produção esse atalho não é criado.

### Estrutura

```text
src/
  components/   cena, horta, galinheiro, plantas, HUD, bandeja, loja e diálogos
  game/         dados de economia, motor, save, áudio, ciclo de luz e galinheiro
  styles.css    layout, animações e arte em CSS
public/
  manifest.webmanifest
  sw.js
  icon.svg
  icon-maskable.svg
```

### Direção visual

A paleta e a atmosfera seguem o material de referência “Jardim Encantado”: verdes oliva, terra quente, terracota e luz dourada, com cogumelos, flores miúdas, árvores assentadas nos morros e uma casinha na encosta. Tudo é desenhado em SVG/CSS e reage ao ciclo de dia e noite.

## Compatibilidade

Feito para navegadores modernos com suporte a Web Audio, `localStorage`, `@property` e service workers (Chrome, Edge, Firefox e Safari recentes). Em janelas estreitas, as bandejas de sementes e do galinheiro rolam na horizontal e o canteiro se ajusta à largura disponível.
