import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client('523108120935-cu9k2p2obcig2o76u31l4s2u11fst8h9.apps.googleusercontent.com');
console.log('Fetching keys from Google...');
client.getFederatedSignonCertsAsync().then(certs => {
  console.log('Success:', Object.keys(certs.certs).length, 'keys found');
}).catch(err => {
  console.error('Error fetching keys:', err);
});
