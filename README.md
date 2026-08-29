# Brighter Risk Pro

Crie um aplicativo para gestão de risco para Indice e Dolar no mercado financeiro. O Nome do app será Brighter Risk Pro.

Ele seguirá a seguinte logica:
Definição inicial
O usuário informa um risco mensal em R$.
O sistema identifica a quantidade de dias úteis do mês.
O risco inicial diário é calculado:

Risco diário inicial = Risco mensal ÷ Dias úteis

Conversão em pontos:
Índice → 1 ponto = R$ 0,20 por contrato
Dólar → 1 ponto = R$ 10,00 por contrato

2. Registro de trades e recalculo do stop
Sempre que o usuário registrar um trade em um dia:
Verificar o resultado em reais.
Converter o resultado para pontos:

Índice = Resultado ÷ 0,20
Dólar = Resultado ÷ 10

Atualizar o risco mensal restante:

Se o resultado for positivo, o risco mensal permanece o mesmo.
Se o resultado for negativo, o risco mensal é reduzido:
Novo risco mensal = Risco mensal anterior - prejuízo do dia.

Calcular o novo risco diário para o dia seguinte:

Caso resultado positivo:
Risco diário = Risco mensal ÷ Dias úteis restantes

Caso resultado negativo:
Risco diário = (Risco mensal - prejuízo acumulado) ÷ Dias úteis restantes

Converter o novo risco diário em pontos para Índice e Dólar.

3. Casos especiais

Se o usuário não operar em um dia:
O risco mensal não é alterado.
Para o dia seguinte:
Risco diário = Risco mensal atual ÷ Dias úteis restantes.

4. Exemplos práticos
Exemplo A – Ganho no dia 1

Risco mensal = R$ 3.000,00
Dias úteis = 22
Risco diário inicial = 3000 ÷ 22 = R$ 136,36

Stop dia 01:

Índice = 136,36 ÷ 0,20 = 681 pontos
Dólar = 136,36 ÷ 10 = 13 pontos

Resultado do dia 1: +R$ 300,00

Dia 02:

Risco mensal permanece = R$ 3.000,00

Dias úteis restantes = 21
Risco diário = 3000 ÷ 21 = R$ 142,85

Stops dia 02:

Índice = 142,85 ÷ 0,20 = 714 pontos
Dólar = 142,85 ÷ 10 = 14,2 pontos

Exemplo B – Perda no dia 1

Risco mensal = R$ 3.000,00
Dias úteis = 22

Risco diário inicial = R$ 136,36

Resultado do dia 1: -R$ 300,00

Dia 02:

Novo risco mensal = 3000 - 300 = R$ 2700

Dias úteis restantes = 21

Risco diário = 2700 ÷ 21 = R$ 128,57

Stops dia 02:

Índice = 128,57 ÷ 0,20 = 642 pontos
Dólar = 128,57 ÷ 10 = 12,85 pontos

Exemplo C – Usuário não opera no dia 2

Risco mensal segue inalterado (positivo ou negativo não registrado).

Para o dia 3:
Risco diário = Risco mensal atual ÷ Dias úteis restantes.

5. Continuidade
O sistema deve aplicar automaticamente essa lógica em todo o calendário do mês.

A cada dia, o Stop Índice e o Stop Dólar são recalculados do zero com base no risco mensal atualizado e nos dias úteis restantes.


Crie uma página inicial (home) 

Estrutura:
Topo (cards resumidos):
- Capital disponível
- Risco mensal definido
- Risco diário atual (ajustado automaticamente pelo saldo e dias restantes)
- Stop diário (Índice e Dólar)
- Resultado acumulado do mês (R$ e %)
- Drawdown acumulado

Gráficos principais:
- Linha de evolução do PnL diário (mostrar lucros/perdas dia a dia, destacando se atingiu stop diário)
- Pizza de uso do risco mensal (quanto do risco já foi consumido vs quanto ainda resta)

Seção de controles rápidos:

- Simulador de risco por contrato (usuário insere pontos e nº de contratos → sistema mostra resultado em R$)
- Botão de registrar trade manual
- Metas diárias/mensais (exibição simples de alvo x realizado)

Visão de consistência:

- Heatmap estilo calendário com dias verdes/vermelhos conforme resultado (lucro ou perda).
-Sidebar / Alertas:
- Notificações quando atingir 70% do risco diário ou mensal
- Resumo do dia (lucro/perda, % do risco consumido, nº de contratos operados)

Design:
- Dashboard estilo fintech, clean, responsivo, com cores que diferenciem lucro (verde) e perda (vermelho).
- Layout em grid para organizar cards, gráficos e heatmap.

A pagina de Trades 
Estrutura:

Topo (cards resumo do dia):
* Nº total de trades
* Lucro total do dia (R$ e %)
* Perda total do dia (R$ e %)
* Win rate (quantidade de trades positivos vs negativos)

Tabela de Trades (colunas):

-Data e hora
-Ativo (Índice, Dólar, etc.)
-Tipo de operação (Compra / Venda)
-Quantidade de contratos
-Entrada (preço/ponto)
-Saída (preço/ponto)
-Pontuação (diferença)
-Resultado financeiro (R$)
-Resultado em % do risco diário
-Duração do trade
-Observações / Setup usado

➝ Incluir filtros por data, ativo, setup e resultado.

Gráficos e Dashboards:

Distribuição de resultados por trade (barras ou histograma de lucros/perdas)
Performance por ativo (pizza ou barras comparando Índice x Dólar)
Exposição de risco por trade (linha ou barras mostrando % do risco consumido)
Tempo médio em operação (comparação trades rápidos x longos)

Seção de Destaques:

Melhor trade (maior ganho)
Pior trade (maior perda)
Nota média por trade (se usuário marcar disciplina, setup seguido etc.)
Funcionalidades adicionais:

Registro manual de trade
Integração API para importação automática de corretora
Exportar trades (CSV/Excel)
Campo de anotações rápidas por trade
Tags como “emocional” ou “fora de setup” para revisão posterior

Design:

Layout clean, estilo dashboard de fintech.
Cards grandes para indicadores principais.
Tabela responsiva e fácil de filtrar.
Gráficos intuitivos para visualizar rapidamente consistência e risco.
Cores diferenciais: verde para lucro, vermelho para perda, cinza neutro para operações neutras.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://brighterriskpro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e91fbb14-7963-4998-8865-da9854d76256).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
