import { sequelize } from "./db/sequelize";
import { downloadAndProcessFiles } from "./sftp/process-data";

async function initJob() {
  await sequelize.authenticate();
  try {
    await downloadAndProcessFiles();
  } catch (e) {
    await downloadAndProcessFiles().catch(e);
  }
}

initJob();
setInterval(() => {
  initJob();
}, 1000 * 60 * 60);
