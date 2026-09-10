require("dotenv").config();

const mongoose = require("mongoose");

const sourceUrl = process.env.SOURCE_DB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const targetUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/homebound";
const dryRun = process.env.DRY_RUN === "yes";

if (sourceUrl === targetUrl) {
    throw new Error("SOURCE_DB_URL and ATLASDB_URL must point to different databases.");
}

if (process.env.CONFIRM_DATABASE_MIGRATION !== "yes") {
    throw new Error(
        "Set CONFIRM_DATABASE_MIGRATION=yes to copy data into the HomeBound database."
    );
}

async function migrate() {
    const source = await mongoose.createConnection(sourceUrl).asPromise();
    const target = await mongoose.createConnection(targetUrl).asPromise();

    try {
        const sourceCollections = await source.db.listCollections().toArray();
        const targetCollections = await target.db.listCollections().toArray();

        if (sourceCollections.length === 0) {
            throw new Error("The source Wanderlust database contains no collections.");
        }

        if (dryRun) {
            for (const { name } of sourceCollections) {
                const sourceCount = await source.db.collection(name).countDocuments();
                const targetCount = targetCollections.some((collection) => collection.name === name)
                    ? await target.db.collection(name).countDocuments()
                    : 0;
                console.log(`${name}: source ${sourceCount}, target ${targetCount}`);
            }
            return;
        }

        const targetApplicationCollections = targetCollections.filter(
            (collection) => collection.name !== "sessions"
        );

        const targetApplicationData = await Promise.all(
            targetApplicationCollections.map(async ({ name }) => ({
                name,
                count: await target.db.collection(name).countDocuments(),
            }))
        );

        if (targetApplicationData.some(({ count }) => count > 0)) {
            throw new Error(
                "The HomeBound database already contains application data. Migration stopped to prevent overwriting or duplicating data."
            );
        }

        let copiedDocuments = 0;

        for (const { name } of sourceCollections) {
            if (name === "sessions") {
                console.log("Skipped temporary session data.");
                continue;
            }

            const documents = await source.db.collection(name).find({}).toArray();
            const destinationCollection = target.db.collection(name);

            if (documents.length > 0) {
                await destinationCollection.insertMany(documents);
                copiedDocuments += documents.length;
            }

            const indexes = await source.db.collection(name).indexes();
            const secondaryIndexes = indexes.filter((index) => index.name !== "_id_");
            if (secondaryIndexes.length > 0) {
                await destinationCollection.createIndexes(
                    secondaryIndexes.map(({ key, name, ...options }) => ({ key, name, ...options }))
                );
            }

            console.log(`Copied ${documents.length} document(s) from ${name}.`);
        }

        console.log(`Migration complete: ${copiedDocuments} document(s) copied to HomeBound.`);
    } finally {
        await Promise.all([source.close(), target.close()]);
    }
}

migrate().catch((err) => {
    console.error(`Migration failed: ${err.message}`);
    process.exitCode = 1;
});
