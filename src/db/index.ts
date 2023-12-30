import mongoose from 'mongoose';

export async function connectToDB(): Promise<void> {
    try {
        await mongoose.connect(
            process.env.MONGO_URI + process.env.DATABASE_NAME!
        )
        console.log('Database Connected');
    } catch (error: any) {
        console.log('Database Connection Failed: ', error.message);
        process.exit(1);
    }
}
