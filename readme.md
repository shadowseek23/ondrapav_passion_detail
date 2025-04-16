# Passion Static Template (Pobo)

Statická šablona pro shoptet s využitím POBO prvků. 
Postaveno na BESPOKE Build Tool (Esbuild + Handlebars + PostCSS)
# 
# Instalace 
Node.js v23
```cmd
npm install
```
# Použití BESPOKE Build Tool

```bash
npm run serve
```
1) S využitím Esbuild se provede transpilace a bundle veškerých css a js souborů linkovaných v /src/index.js do /dev/index.js a /dev/index.css
2) Zparasuje se /src/templates/index.hbs do /dev/index.html (handlebars). Je možné linkovat veškeré partials ve složkách /src/templates/**/.
3) Sleduje a renderuje veškeré změny ve složkách /src/scripts/ + /src/styles/ + /src/templates/

```bash
npm run images
```
Vymaže složku /dev/images/ a nahradí ji obsahem složky /src/images/

# PostCSS

BESPOKE Build Tool implementuje následující balíčky umožňující využívat PostCSS podobně jako SASS:
```javascript
    "postcss-advanced-variables": "^5.0.0",
    "postcss-import": "^16.0.1",
    "postcss-mixins": "^11.0.3",
    "postcss-nested": "^7.0.2",
    "postcss-simple-vars": "^7.0.1",
```

