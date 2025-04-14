import { Client } from 'cassandra-driver';

const client = new Client({
  contactPoints: ['node-0.aws-us-east-1.29720b38e82b5dd3f026.clusters.scylla.cloud'],
  localDataCenter: 'AWS_US_EAST_1', 
  credentials:{ username: 'scylla', password: 'hgCvoKz7UJ8qmH1' },
  keyspace: 'youtube',
});
export const connectToScylla = async () => {
  await client.connect();
};

export const scyllaClient = client;
