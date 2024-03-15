import { DataSource } from "typeorm";
import { ApiKey, ApiKeyType } from "./entities/api.entity";
import moment from "moment";

const myDataSource = new DataSource({
  type: "sqlite",
  database: "db",
  entities: [ApiKey],
  logging: true,
  synchronize: true,
});

export const initializeDB = async () => {
  await myDataSource.initialize();
  let keys = await ApiKey.find();
  if (keys.length === 0) {
    await ApiKey.save({
      email: "matiasatheiler@gmail.com",
      authKey: "5361be295fea717e5f25a72b26fc80dcdc460042",
      authType: ApiKeyType.paid,
      quantity: 2500,
      period: "month",
      resetDate: moment("2024-04-15").toDate(),
    });
    await ApiKey.save({
      email: "plates2024@gmail.com",
      authKey: "7f857e46f03b7db7c41582e72e7ba5b316baad1c",
      authType: ApiKeyType.paid,
      quantity: 2500,
      period: "month",
      resetDate: moment("2024-03-26").toDate(),
    });
    keys = await ApiKey.find();
  }
  console.log("Keys: ", keys.length);
};
