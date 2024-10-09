import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL); // PocketBase sunucusunun URL'si
export default pb;
