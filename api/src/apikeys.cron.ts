import cron from "node-cron";
import { ApiKey } from "./entities/api.entity";
import moment from "moment";
import { apiKeyService } from "./apikeys.service";

async function updateQuota() {
  const expiredKeys = (await ApiKey.find()).filter(
    (key) => key.resetDate.getTime() < moment().toDate().getTime()
  );
  if (expiredKeys.length === 0) {
    return;
  }
  await ApiKey.save(
    expiredKeys.map((eKey) => {
      eKey.resetDate = moment(eKey.resetDate).add(eKey.period).toDate();
      return eKey;
    })
  );
  await apiKeyService.updateCache(true);
}

const task = cron.schedule("0 0 * * *", async () => {
  await updateQuota()
});

export const initCronJob = () => {
    updateQuota().catch(e=>console.log(e))
    task.start();
    console.log('Cron initialized')
}

