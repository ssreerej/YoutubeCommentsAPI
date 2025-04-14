import express from 'express';
import { Routes } from './Routes';
import { connectToScylla } from './Db/dataSource';
const app = express();
const port = 3000;
connectToScylla()
  .then(() => {
    console.log('Connected to ScyllaDB');
    app.use(express.json());
    Routes.call(app);
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err :any) => {
    console.error('ScyllaDB connection failed:', err);
    process.exit(1);
  });