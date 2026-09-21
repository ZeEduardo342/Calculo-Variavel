# Integração Firebase

Já integrado: `firebase.js` inicializa o app e o Firestore; `app.js` escuta as três coleções com `onSnapshot` e grava com `addDoc`/`deleteDoc`. O SDK modular v11.10.0 é carregado direto do CDN `gstatic.com`.

## Passos no console (uma vez)

1. Firebase Console → **Build → Firestore Database → Criar banco de dados** (se ainda não existir).
2. Aba **Regras**: cole o conteúdo de `firestore.rules` e publique.
3. Rode o app por HTTP (`python3 -m http.server 8080`). No primeiro acesso, `valores_niveis` e `configuracoes` são criadas automaticamente com os valores iniciais (N1 R$ 1, N2 R$ 2,50, N3 R$ 5, N4 R$ 10; teto R$ 200, vigência 2026-01-01).
4. Se for publicar em um domínio, adicione-o em Authentication → Settings → Authorized domains (só necessário quando Auth for usado).

## Coleções

| Coleção | Campos |
|---|---|
| `valores_niveis` | `nivel`, `valor`, `inicio` |
| `configuracoes` | `tipo` (`teto_mensal`), `valor`, `inicio` |
| `lancamentos` | `data` (ISO), `nivel`, `quantidade`, `valor_unitario`, `valor_total` |

Regra: `valor_total = quantidade × valor_unitario`. A vigência usada é a mais recente com `inicio <= data`, e `valor_unitario` é gravado dentro do lançamento. Lançamentos nunca são atualizados (só criados ou apagados pelo "Desfazer").

## Segurança — importante

O app ainda **não tem login**, então as regras em `firestore.rules` liberam leitura/escrita para qualquer pessoa com a URL do app (a config web do Firebase é pública por natureza). Elas já impedem edição de lançamentos e validam formato e total, mas **não protegem contra leitura, criação ou exclusão por terceiros**. Antes de usar dados reais, adicione Firebase Authentication e troque `if true` por `if request.auth != null`.
