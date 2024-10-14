import { Strategy } from './strategy';
import { YoutubeReference } from '../reference';
import { AutoRefSettings } from '../main';
import { Err } from '../error';
import { handleApiError } from './youtube-api';

interface VideoResponse {
	kind: string;
	etag: string;
	id: string;
	snippet: VideoSnippet;
	topicDetails: VideoTopicDetails;
	player: VideoPlayer;
}

interface VideoSnippet {
	publishedAt: string;
	channelId: string;
	title: string;
	description: string;
	channelTitle: string;
	tags: string[];
	categoryId: string;
	liveBroadcastContent: string;
	defaultAudioLanguage: string;
}

interface VideoTopicDetails {
	topicCategories: string[];
}

interface VideoPlayer {
	embedHtml: string;
}

interface ChannelResponse {
	kind: string;
	etag: string;
	id: string;
	snippet: ChannelSnippet;
}

interface ChannelSnippet {
	title: string;
	description: string;
	customUrl?: string;
	publishedAt: string;
	country: string;
}

export class YoutubeStrategy implements Strategy<YoutubeReference> {
	private readonly settings: AutoRefSettings;

	constructor(settings: AutoRefSettings) {
		this.settings = settings;
	}

	toMarkdown(reference: YoutubeReference | null): string {
		if (!reference) return '';
		const template = [
			'---',
			'type: Reference',
			'refType: Youtube',
			`author: ${reference.author}`,
			`publishDate: ${reference.publishDate}`,
			`url: ${reference.url}`,
			`channelUrl: ${reference.channelUrl}`,
			'',
			'---',
			`![](${reference.url})`,
		];

		return template.join('\n');
	}

	async fetchReference(url: string): Promise<[YoutubeReference | null, Err]> {
		const [id, error] = this.parseVideoId(url);
		if (error) return [null, error];

		const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${this.settings.googleApiKey}&part=contentDetails,id,player,snippet,topicDetails`;

		try {
			const response = await fetch(apiUrl);
			await handleApiError(response);

			const body = await response.json();

			const videoResponse: VideoResponse = body.items[0] as VideoResponse;
			const channelResponse: ChannelResponse = await this.fetchChannelInfo(
				videoResponse.snippet.channelId
			);

			return [
				{
					title: videoResponse.snippet.title,
					description: videoResponse.snippet.description,
					publishDate: videoResponse.snippet.publishedAt,
					author: channelResponse.snippet.title,
					videoId: videoResponse.id,
					channelId: channelResponse.id,
					topicCategories: videoResponse.topicDetails.topicCategories,
					url: url,
					channelUrl: `https://www.youtube.com/channel/${channelResponse.id}`,
				},
				null,
			];
		} catch (e) {
			return [null, { msg: e.toString() }];
		}
	}

	private async fetchChannelInfo(id: string): Promise<ChannelResponse> {
		const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${id}&key=${this.settings.googleApiKey}`;
		const response = await fetch(channelUrl);

		await handleApiError(response);

		const body = await response.json();
		return body.items[0] as ChannelResponse;
	}

	private parseVideoId(url: string): [string, Err] {
		const regex =
			/(?:youtube\.com\/(?:[^\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		const match = url.match(regex);

		if (match == null) return ['', { msg: 'invalid YouTube URL' }];

		return [match[1], null];
	}
}
