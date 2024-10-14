import { Notice } from 'obsidian';

export interface YoutubeApiError {
	error: ErrorDetail;
}

export interface ErrorDetail {
	code: number;
	message: string;
}

export const handleApiError = async (response: Response) => {
	if (response.ok) return;
	const youtubeApiError = (await response.json()) as YoutubeApiError;
	new Notice(youtubeApiError.error.message);
};
