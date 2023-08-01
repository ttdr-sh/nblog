import "websocket-polyfill";
import { SimplePool, type Event } from "nostr-tools";
import { PUBLIC_RELAYS, PUBLIC_PUBKEYS } from "$env/static/public";
import { browser } from "$app/environment";

export default class Nostr extends SimplePool {
	public relays: string[];
	public pubkeys: string[];
	public pubkey: string;

	constructor() {
		super();
		this.relays = PUBLIC_RELAYS.split(",");
		// If we are connected on web browser, then add more relays
		if (browser) {
			this.relays = [
				...this.relays,
				"wss://relay.damus.io",
				"wss://relay.snort.social",
				"wss://nostr-pub.wellorder.net",
				"wss://nos.lol",
				"wss://nostr-relay.nokotaro.com",
				"wss://relay.nostr.wirednet.jp",
				"wss://relay.nostr.band",
				"wss://relay.txinito.xyz",
			];
		}
		this.pubkeys = PUBLIC_PUBKEYS.split(",");
		this.pubkey = "";
	}

	public async connect(relays: string[]) {
		for (let i = 0; i < relays.length; i++) {
			try {
				await this.ensureRelay(relays[i]);
			} catch (error) {
				// GFY
			}
		}
	}

	public getPubkey() {
		// @ts-expect-error we are literally checking if it is there
		if (browser && window.nostr) {
			// @ts-expect-error we already confirmed it's present
			return window.nostr.getPublicKey();
		}
	}

	public async signEvent(event: Event) {
		if (browser) {
			// @ts-expect-error we are checking
			if (window.nostr) {
				// @ts-expect-error it's there
				event = await window.nostr.signEvent(event);
				this.pubkey = event.pubkey;
				return event;
			}
			alert("沒有可用的 NIP-07 擴充套件。");
		}

		return null;
	}
}
