import { init, i } from '@instantdb/react';

const schema = i.schema({
    entities: {
        interactions: i.entity({
            type: i.string(), // 'like' | 'emoji' | 'comment'
            imageId: i.string(),
            payload: i.string(),
            username: i.string(),
            userColor: i.string(),
            timestamp: i.number(),
        }),
    },
});

export interface Interaction {
    id: string;
    type: string; // 'like' | 'emoji' | 'comment'
    imageId: string;
    payload?: string;
    username: string;
    userColor?: string;
    timestamp: number;
}

// UUID validation regex
const isValidUUID = (uuid: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);

const APP_ID = import.meta.env.VITE_INSTANT_APP_ID || '';

export const isConfigured = isValidUUID(APP_ID);

// Only initialize if we have a valid UUID to prevent crash
export const db = isConfigured
    ? init({ appId: APP_ID, schema })
    : null;

export type Schema = typeof schema;
