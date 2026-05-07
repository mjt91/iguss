# iGuss 🌿

A simple plant watering tracker - hosted with [ONCE](https://github.com/basecamp/once).

## Features

- 🌱 Manage plants with watering intervals
- 🚿 Daily overview of plants that need watering
- 📅 Calendar export (ICS) for reminders
- 💾 Data stored in browser (localStorage)
- 📱 PWA support (installable as app)

## Local Development

### With Docker

```bash
# Build image
docker build -t iguss .

# Run container
docker run -d -p 8080:80 --name iguss iguss

# App available at: http://localhost:8080
```

### Without Docker (Node.js)

```bash
# Start server
node server.js

# App available at: http://localhost:80
```

## ONCE Compatible

This app runs with [ONCE](https://github.com/basecamp/once):

- Port: `80`
- Healthcheck: `/up`
- Image: `ghcr.io/mjt91/iguss:latest`

## Data Isolation

Each user has completely isolated data through browser localStorage. Data is not stored on the server.
