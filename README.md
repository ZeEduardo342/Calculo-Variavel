# Bônus — HTML, CSS e JavaScript puro + Firebase

Sistema de bonificação sem framework nem build. Os dados ficam no **Cloud Firestore** (projeto `bonus-calculator-5327e`), com sincronização em tempo real e cache offline.

## Executar

O app usa módulos ES (SDK do Firebase via CDN), então **não abre com duplo clique em `index.html`** (`file://` bloqueia módulos). Sirva a pasta por HTTP:

```bash
python3 -m http.server 8080
```

Depois, abra `http://localhost:8080`.

## Arquivos

- `index.html`: estrutura da aplicação.
- `styles.css`: identidade visual e responsividade.
- `firebase.js`: inicialização do Firebase/Firestore (credenciais + cache offline).
- `app.js`: estado, cálculos, histórico, gráfico, configurações e sincronização com o Firestore.
- `firestore.rules`: regras de segurança para colar em Firebase Console → Firestore → Regras.
- `FIREBASE_SETUP.md`: estrutura das coleções e passos de configuração.
