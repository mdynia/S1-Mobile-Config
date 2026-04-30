const { conn, login } = require("./sfdc");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

(async () => {
  await login();

  // Ensure /data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const result = await conn.query(
    "SELECT Id, SER__ID2__c, SER__Status__c, SER__Payload__c " +
    "FROM SER__SCConfiguration__c " +
    "WHERE RecordTypeId = '0124H0000006PLnQAM' " +
    "AND SER__Status__c = 'Active'"
  );

  result.records.forEach(config => {
    let id = config.Id;

    if (!id || !config.SER__Payload__c) {
      console.warn("⚠️ Skipping record with missing ID or payload:", config.Id);
      return;
    }


    if (id == 'a1r4H00000QLtSIQA1') {
      console.log(`⚠️ Default config in (ID ${id}) renamed default config`);
      id = 'default';    
    }


    const filePath = path.join(DATA_DIR, `${id}.json`);

    // Write payload exactly as received from Salesforce
    fs.writeFileSync(filePath, config.SER__Payload__c, "utf8");

    console.log(`✅ Saved ${id}.json`);
  });

  console.log(`\n✅ ${result.records.length} configurations processed`);
})();