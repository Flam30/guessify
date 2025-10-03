This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Navigate to the root folder and run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
In a different terminal, run ```local-ssl-proxy --source 3010 --target 3000 --cert localhost.pem --key localhost-key.pem``` (Requires locally generated SSL certificates, I used ```mkcert```)

Open ```https://127.0.0.1:3010/```

Open [https://localhost:3010](https://localhost:3010) with your browser to see the result.
