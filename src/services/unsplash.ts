const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

export interface UnsplashImage {
    id: string;
    urls: {
        regular: string;
        small: string;
        thumb: string;
    };
    user: {
        name: string;
        username: string;
    };
    alt_description: string;
}

export const fetchImages = async (page: number = 1): Promise<UnsplashImage[]> => {
    if (!UNSPLASH_ACCESS_KEY) {
        console.warn('Unsplash Access Key is missing. Using mockup data.');
        return getMockImages(page);
    }

    const response = await fetch(
        `${UNSPLASH_BASE_URL}/photos?page=${page}&per_page=12`,
        {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
        }
    );

    if (response.status === 401 || response.status === 403) {
        console.warn('Unsplash API key rejected (401/403). Falling back to mock data.');
        return getMockImages(page);
    }

    if (!response.ok) {
        throw new Error('Failed to fetch images from Unsplash');
    }

    return response.json();
};

export const fetchImageById = async (id: string): Promise<UnsplashImage> => {
    if (!UNSPLASH_ACCESS_KEY || id.startsWith('mock-')) {
        return getMockImages(1)[0]; // Just return a mock if no key or it's a mock ID
    }

    const response = await fetch(`${UNSPLASH_BASE_URL}/photos/${id}`, {
        headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch image from Unsplash');
    }

    return response.json();
};

const getMockImages = (page: number): UnsplashImage[] => {
    return Array.from({ length: 12 }).map((_, i) => ({
        id: `mock-${page}-${i}`,
        urls: {
            regular: `https://picsum.photos/seed/${page}-${i}/800/600`,
            small: `https://picsum.photos/seed/${page}-${i}/400/300`,
            thumb: `https://picsum.photos/seed/${page}-${i}/200/150`,
        },
        user: {
            name: 'Mock User',
            username: 'mockuser',
        },
        alt_description: 'Mock Image',
    }));
};
