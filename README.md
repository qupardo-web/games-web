# games-web

Frontend del taller DevOps e Integración Continua. Catálogo de videojuegos agrupados por género.

Diseño generado en Open Design y adaptado a React + Vite.

## Desarrollo

```bash
npm ci
npm run dev
```

## Build de producción

```bash
npm run build
```

## Docker

```bash
docker build -t games-web .
docker run --rm -p 8083:80 games-web
```

Abrir `http://localhost:8083`.

## Variables

- `VITE_API_URL`: URL de la API. Se pasa como build arg al construir la imagen.
  Ejemplo: `docker build --build-arg VITE_API_URL=http://localhost:8081 -t games-web .`
