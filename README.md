# Starfisher

Starfisher is a Game Master Assistant for Starfinder, now with a Node.js backend!

## Features

- Store and manage NPCs and combat encounters
- Backend API for CRUD operations
- Configurable server port
- NeDB database for data storage
- Responsive frontend UI

## Setup

### Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Configuration

The server can be configured by creating a `config.json` file in the root directory. See `config.json.example` for an example configuration.

Available configuration options:
- `port`: The port on which the server will run (default: 3000)
- `dbPath`: The path where NeDB will store its database files (default: "./data/nedb")

Example `config.json`:
```json
{
  "port": 8080,
  "dbPath": "./data/nedb"
}
```

### Running the Server

Start the server with:
```
npm start
```

For development with auto-restart on file changes:
```
npm run dev
```

## Using the Application

1. Start the server as described above
2. Open a web browser and navigate to `http://localhost:3000` (or the port you configured)
3. The application will connect to the backend API automatically
4. If you need to change the API port in the frontend, go to Settings and update the port in the API Backend section

## Data Migration

When the server starts for the first time, it will automatically import data from the existing `data/starfisherDB.json` file if it exists and the NeDB databases are empty.

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/:store` - Get all items from a store
- `GET /api/:store/:id` - Get a single item by ID
- `POST /api/:store` - Add a new item
- `PUT /api/:store/:id` - Update an item
- `DELETE /api/:store/:id` - Delete an item

Where `:store` can be `npcs` or `combats`.
