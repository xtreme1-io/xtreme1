# Xtreme1 Frontend

## Overview

Xtreme1 frontend mainly includes three parts, each part is a separate project and developed width Vue 3 + Typescript + Vite.
- [main](./main/README.md) - Main web application
- [pc-tool](./pc-tool/README.md) - Point cloud annotation tool
- [image-tool](./image-tool/README.md) - Image annotation tool
- [text-tool](./text-tool/README.md) - Text annotation tool

## Deploy

Each part is developed independently, and finally the static files are put together to `frontend/dist`.  

`main` build to `/main` -- nginx: `/`
`pc-tool` build to `/pc-tool` -- nginx: `/tool/pc`
`image-tool` build to `/image-tool` -- nginx: `/tool/image`
`text-tool` build to `/text-tool` -- nginx: `/tool/text`

For more information, refer to `.ops/**/frontend-deployment.yml`

## Related Information
- [vue](https://vuejs.org/)
- [vite](https://vitejs.dev/)
- [typescript](https://www.typescriptlang.org/)
- [vben admin](https://github.com/vbenjs/vue-vben-admin/)