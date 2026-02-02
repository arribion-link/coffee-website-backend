import mongoose from "mongoose";
import "dotenv/config";
// const MONGO_URI = process.env.MONGO_URI;
const MONGO_ATLAS_URI = process.env.MONGO_ATLAS_URI;
if (!MONGO_ATLAS_URI) {
  console.log("error fetching database connection string");
  process.exit(1);
}
const connect_db = async () => {
    try {
        const conn = await mongoose.connect(MONGO_ATLAS_URI);
        console.log(conn.connection.host, 'database connected successfully...');
    } catch (error) {
        console.log("ERROR :" , error);
    }
}

export default connect_db;