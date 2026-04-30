const { conn, login } = require("./sfdc");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

(async () => {
  await login();

  if (!fs.existsSync(DATA_DIR)) {
    console.error("❌ data directory does not exist");
    process.exit(1);
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));

  if (files.length === 0) {
    console.warn("⚠️ No .json files found in data directory");
    return;
  }

  console.log(`⬆️ Uploading ${files.length} configuration files...\n`);

  for (const file of files) {
    const id = path.basename(file, ".json");
    const filePath = path.join(DATA_DIR, file);

    if (id == 'default') {
      console.log(`⚠️ Skipping ${file} (ID ${id}) as this is default config`);
      continue;
    }
    let payload;
    try {
      payload = fs.readFileSync(filePath, "utf8");
    } catch (err) {
      console.error(`❌ Failed to read ${file}:`, err.message);
      continue;
    }

    try {
      const result = await conn.sobject("SER__SCConfiguration__c").update({
        Id: id,
        SER__Payload__c: payload
      });

      if (result.success) {
        console.log(`✅ Updated ${id}`);
      } else {
        console.error(`❌ Failed to update ${id}`, result.errors);
      }
    } catch (err) {
      console.error(`❌ Salesforce error updating ${id}:`, err.message);
    }
  }

  console.log("\n✅ Upload completed");
})();