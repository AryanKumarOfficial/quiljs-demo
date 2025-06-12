import mongoose from 'mongoose';

declare global {
    var mongoose: any; // This is to avoid connection warnings during hot reloads
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quilljs-demo';

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {conn: null, promise: null};
}

async function connectToDatabase() {
    if (cached.conn) {
        // Check if connection is still valid (not disconnected)
        if (cached.conn.connection.readyState === 1) {
            return cached.conn;
        }
        // If connection was lost, reset it to reconnect
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Add more robust connection options
            serverSelectionTimeoutMS: 10000, // Timeout for server selection
            maxPoolSize: 10, // Maximum connections in the connection pool
            minPoolSize: 1, // Minimum connections maintained in the connection pool
            connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('MongoDB connected successfully');

            // Add connection event listeners
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.warn('MongoDB disconnected. Attempting to reconnect...');
                cached.conn = null;
                cached.promise = null;
            });

            // Handle Node.js process termination
            // process.on('SIGINT', () => {
            //     mongoose.connection.close(() => {
            //         console.log('Mongoose connection closed through app termination');
            //         process.exit(0);
            //     });
            // });

            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection error:', e);

        // Throw with a more descriptive error message
        throw new Error(`Unable to connect to MongoDB: ${e instanceof Error ? e.message : String(e)}`);
    }

    return cached.conn;
}

export default connectToDatabase;